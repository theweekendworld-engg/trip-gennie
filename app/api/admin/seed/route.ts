import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/db';
import { GoogleMapsService } from '../../../../lib/api/google-maps';
import { createAuditLog } from '../../../../lib/audit';

export const runtime = 'nodejs';

const googleMaps = new GoogleMapsService();

// Rate limiting map (in-memory, per user email)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit: 1 request per 5 minutes per user
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds
const RATE_LIMIT_MAX = 1; // 1 request per window

function checkRateLimit(userEmail: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const limit = rateLimitMap.get(userEmail);

    if (!limit || now > limit.resetTime) {
        rateLimitMap.set(userEmail, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return { allowed: true };
    }

    if (limit.count >= RATE_LIMIT_MAX) {
        return { allowed: false, resetTime: limit.resetTime };
    }

    limit.count++;
    return { allowed: true };
}

// Categories to search for nearby destinations
const SEARCH_CATEGORIES = [
    { term: "Hill Stations", category: "hill_station" },
    { term: "Beaches", category: "beach" },
    { term: "Forts", category: "historical" },
    { term: "Waterfalls", category: "nature" },
    { term: "Temples", category: "spiritual" },
    { term: "Wildlife Sanctuaries", category: "wildlife" },
    { term: "Trekking Points", category: "adventure" },
    { term: "Lakes", category: "nature" },
];

async function seedCityNearby(cityName: string, adminUserId: number) {
    const logs: string[] = [];
    
    function log(message: string) {
        console.log(message);
        logs.push(message);
    }

    function logError(message: string, error?: any) {
        const errorMsg = `ERROR: ${message} ${error ? error.message : ''}`;
        console.error(errorMsg, error);
        logs.push(errorMsg);
    }

    try {
        log(`\n🌱 Seeding nearby weekend getaways for: ${cityName}\n`);

        // 1. Find or Create City
        let city = await prisma.city.findFirst({
            where: {
                OR: [
                    { name: { equals: cityName, mode: 'insensitive' } },
                    { slug: { equals: cityName.toLowerCase().replace(/ /g, '-'), mode: 'insensitive' } }
                ]
            }
        });

        if (!city) {
            log(`City ${cityName} not found in DB. Searching Google Maps...`);
            const cityResults = await googleMaps.searchPlaces(cityName, prisma);

            if (cityResults.length === 0) {
                logError(`❌ Could not find city: ${cityName}`);
                throw new Error(`Could not find city: ${cityName}`);
            }

            const cityData = cityResults[0];
            const details = await googleMaps.getPlaceDetails(cityData.place_id, prisma);

            city = await prisma.city.create({
                data: {
                    name: cityData.name,
                    slug: cityData.name.toLowerCase().replace(/ /g, '-'),
                    state: "Unknown",
                    latitude: cityData.geometry.location.lat,
                    longitude: cityData.geometry.location.lng,
                    isActive: true,
                }
            });
            log(`✅ Created city: ${city.name}`);
        } else {
            log(`✅ Found existing city: ${city.name}`);
        }

        // 2. Search for Nearby Destinations by Category
        let totalDestinationsCreated = 0;
        
        for (const cat of SEARCH_CATEGORIES) {
            const query = `${cat.term} near ${city.name}`;
            log(`\n🔍 Searching for: ${query}`);

            const places = await googleMaps.searchPlaces(query, prisma);
            log(`   -> Found ${places.length} potential places`);

            // Filter and Process (Batch of 5 to avoid rate limits/costs)
            const destinationsInBatch = [];

            for (const place of places.slice(0, 5)) {
                // Skip if it's the city itself
                if (place.name.toLowerCase().includes(city.name.toLowerCase()) && !place.name.toLowerCase().includes('beach')) continue;

                // Check if already exists
                const slug = place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                const existing = await prisma.destination.findFirst({
                    where: { slug: slug }
                });

                if (existing) {
                    log(`   -> Skipping ${place.name} (already exists)`);

                    // Ensure it's linked to this city
                    const existingLink = await prisma.cityDestination.findFirst({
                        where: { cityId: city.id, destinationId: existing.id }
                    });

                    if (!existingLink) {
                        destinationsInBatch.push(existing);
                    }
                    continue;
                }

                try {
                    // Get Details
                    const details = await googleMaps.getPlaceDetails(place.place_id, prisma);

                    // Create Destination
                    const destination = await prisma.destination.create({
                        data: {
                            name: place.name,
                            slug: slug,
                            aiEnhancedSummary: details.editorial_summary?.overview || `A beautiful ${cat.term.toLowerCase()} near ${city.name}.`,
                            shortSummary: `Famous ${cat.term.toLowerCase()} known for its scenic beauty.`,
                            latitude: place.geometry.location.lat,
                            longitude: place.geometry.location.lng,
                            category: cat.category,
                            imageUrl: details.photos?.[0] ?
                                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${details.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}` :
                                null,
                            isActive: true,
                        }
                    });

                    log(`   -> Created destination: ${destination.name}`);
                    destinationsInBatch.push(destination);
                    totalDestinationsCreated++;

                    // Save Photos
                    if (details.photos && details.photos.length > 0) {
                        for (const photo of details.photos.slice(0, 3)) {
                            await prisma.destinationPhoto.create({
                                data: {
                                    destinationId: destination.id,
                                    photoUrl: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
                                    photoReference: photo.photo_reference,
                                    width: photo.width,
                                    height: photo.height,
                                    attribution: photo.html_attributions?.[0] || null,
                                    isPrimary: photo === details.photos[0],
                                },
                            });
                        }
                    }

                } catch (err) {
                    logError(`   -> Failed to process ${place.name}:`, err);
                }
            }

            if (destinationsInBatch.length === 0) continue;

            // 3. Calculate Travel Times & Link to City
            log(`   -> Calculating travel times for ${destinationsInBatch.length} places...`);

            const cityCenter = { lat: Number(city.latitude), lng: Number(city.longitude) };
            const destinationCoords = destinationsInBatch.map(d => ({
                lat: Number(d.latitude),
                lng: Number(d.longitude)
            }));

            // Fetch Matrix (Driving)
            const drivingResults = await googleMaps.getDistanceMatrixBatch(
                [cityCenter],
                destinationCoords,
                'driving',
                prisma
            );

            // Fetch Matrix (Transit)
            const transitResults = await googleMaps.getDistanceMatrixBatch(
                [cityCenter],
                destinationCoords,
                'transit',
                prisma
            );

            for (let i = 0; i < destinationsInBatch.length; i++) {
                const dest = destinationsInBatch[i];
                const driving = drivingResults[i];
                const transit = transitResults[i];

                // Helper for realistic fare calculation
                const getFareAndLinks = (mode: string, distKm: number, transitDetails?: any) => {
                    if (mode === 'driving') {
                        const fuelCost = Math.round(distKm * 7);
                        const tollCost = Math.round(distKm * 2);
                        const totalCost = fuelCost + tollCost;

                        return {
                            fare: {
                                fuel: fuelCost,
                                toll: tollCost,
                                total: totalCost,
                                taxi: Math.round(distKm * 15)
                            },
                            links: { rental: 'https://www.zoomcar.com', taxi: 'https://www.uber.com' }
                        };
                    } else {
                        let trainFare = 0;
                        let busFare = 0;

                        if (transitDetails?.fare) {
                            trainFare = transitDetails.fare.value;
                        } else {
                            trainFare = Math.round(distKm * 1.5);
                            busFare = Math.round(distKm * 2.5);
                        }

                        return {
                            fare: { bus: busFare, train: trainFare },
                            links: { bus: 'https://www.redbus.in', train: 'https://www.irctc.co.in' }
                        };
                    }
                };

                // Helper to fetch real weather and AQI from OpenMeteo
                const getRealWeatherAndAQI = async (lat: number, lng: number) => {
                    try {
                        const weatherRes = await fetch(
                            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code`
                        );
                        const weatherData = await weatherRes.json();

                        const aqiRes = await fetch(
                            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi`
                        );
                        const aqiData = await aqiRes.json();

                        const getWeatherCondition = (code: number) => {
                            if (code === 0) return "Clear sky";
                            if (code < 4) return "Partly cloudy";
                            if (code < 50) return "Foggy";
                            if (code < 60) return "Drizzle";
                            if (code < 70) return "Rain";
                            if (code < 80) return "Snow";
                            return "Thunderstorm";
                        };

                        const aqiValue = aqiData.current?.us_aqi || 50;
                        let aqiStatus = "Good";
                        if (aqiValue > 50) aqiStatus = "Moderate";
                        if (aqiValue > 100) aqiStatus = "Unhealthy for Sensitive Groups";
                        if (aqiValue > 150) aqiStatus = "Unhealthy";

                        return {
                            weather: {
                                temp: Math.round(weatherData.current.temperature_2m),
                                condition: getWeatherCondition(weatherData.current.weather_code),
                                humidity: weatherData.current.relative_humidity_2m
                            },
                            aqi: {
                                aqi: aqiValue,
                                status: aqiStatus
                            }
                        };
                    } catch (e) {
                        log('Failed to fetch OpenMeteo data, using fallback');
                        return null;
                    }
                };

                // Helper for Best Visit Time based on Category
                const getBestVisitTime = (category: string) => {
                    switch (category) {
                        case 'hill_station': return { best_months: ["March", "April", "May", "October", "November"] };
                        case 'beach': return { best_months: ["October", "November", "December", "January", "February"] };
                        case 'wildlife': return { best_months: ["October", "November", "December", "January", "February", "March"] };
                        case 'nature':
                        case 'waterfall': return { best_months: ["July", "August", "September", "October"] };
                        default: return { best_months: ["October", "November", "December", "January", "February", "March"] };
                    }
                };

                // Fetch Real Weather & AQI
                const realData = await getRealWeatherAndAQI(Number(dest.latitude), Number(dest.longitude));
                const bestTime = getBestVisitTime(dest.category);

                // Update Destination with Real Info
                await prisma.destination.update({
                    where: { id: dest.id },
                    data: {
                        weatherInfo: realData?.weather || undefined,
                        airQuality: realData?.aqi || undefined,
                        bestVisitTime: bestTime
                    }
                });

                // Link Driving
                if (driving && driving.distanceKm > 0) {
                    let routeData = null;
                    try {
                        routeData = await googleMaps.getDirections(
                            cityCenter,
                            { lat: Number(dest.latitude), lng: Number(dest.longitude) },
                            'driving',
                            prisma
                        );
                    } catch (e) { log('Failed to get directions'); }

                    const { fare, links } = getFareAndLinks('driving', driving.distanceKm);

                    await prisma.cityDestination.upsert({
                        where: {
                            cityId_destinationId_transportMode: {
                                cityId: city.id,
                                destinationId: dest.id,
                                transportMode: 'driving',
                            },
                        },
                        update: {
                            distanceKm: driving.distanceKm,
                            travelTimeMinutes: driving.durationMinutes,
                            estimatedFuelCost: fare.total,
                            estimatedTransportCost: fare.taxi,
                            routePolyline: routeData?.polyline || null,
                            majorWaypoints: routeData?.waypoints || [],
                            fareDetails: fare,
                            bookingLinks: links
                        },
                        create: {
                            cityId: city.id,
                            destinationId: dest.id,
                            transportMode: 'driving',
                            distanceKm: driving.distanceKm,
                            travelTimeMinutes: driving.durationMinutes,
                            estimatedFuelCost: fare.total,
                            estimatedTransportCost: fare.taxi,
                            routePolyline: routeData?.polyline || null,
                            majorWaypoints: routeData?.waypoints || [],
                            fareDetails: fare,
                            bookingLinks: links
                        },
                    });
                }

                // Link Transit
                if (transit && transit.distanceKm > 0) {
                    const { fare, links } = getFareAndLinks('transit', transit.distanceKm, transit);

                    await prisma.cityDestination.upsert({
                        where: {
                            cityId_destinationId_transportMode: {
                                cityId: city.id,
                                destinationId: dest.id,
                                transportMode: 'transit',
                            },
                        },
                        update: {
                            distanceKm: transit.distanceKm,
                            travelTimeMinutes: transit.durationMinutes,
                            estimatedTransportCost: fare.train || fare.bus,
                            fareDetails: fare,
                            bookingLinks: links
                        },
                        create: {
                            cityId: city.id,
                            destinationId: dest.id,
                            transportMode: 'transit',
                            distanceKm: transit.distanceKm,
                            travelTimeMinutes: transit.durationMinutes,
                            estimatedTransportCost: fare.train || fare.bus,
                            fareDetails: fare,
                            bookingLinks: links
                        },
                    });
                }
            }
        }

        log('\n✅ Nearby seeding complete!');
        
        return {
            success: true,
            cityId: city.id,
            cityName: city.name,
            destinationsCreated: totalDestinationsCreated,
            logs
        };

    } catch (error: any) {
        logError('Seeding failed:', error);
        throw error;
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get admin user
        const adminUser = await prisma.adminUser.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser) {
            return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
        }

        // Check rate limit
        const rateLimit = checkRateLimit(session.user.email);
        if (!rateLimit.allowed) {
            const resetTime = rateLimit.resetTime || Date.now() + RATE_LIMIT_WINDOW;
            const waitMinutes = Math.ceil((resetTime - Date.now()) / 60000);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded. Please wait before seeding again.',
                    resetTime: new Date(resetTime).toISOString(),
                    waitMinutes
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { cityName } = body;

        if (!cityName || typeof cityName !== 'string') {
            return NextResponse.json(
                { success: false, error: 'City name is required' },
                { status: 400 }
            );
        }

        // Perform seeding
        const result = await seedCityNearby(cityName, adminUser.id);

        // Create audit log
        await createAuditLog(
            adminUser.id,
            'seed_city',
            'city',
            result.cityId,
            {
                cityName: result.cityName,
                destinationsCreated: result.destinationsCreated
            },
            request
        );

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${result.cityName}`,
            ...result
        });
    } catch (error: any) {
        console.error('Error seeding city:', error);
        
        // Create audit log for failure
        try {
            const session = await auth();
            if (session?.user?.email) {
                const adminUser = await prisma.adminUser.findUnique({
                    where: { email: session.user.email },
                });
                if (adminUser) {
                    await createAuditLog(
                        adminUser.id,
                        'seed_city_failed',
                        'city',
                        undefined,
                        { error: error.message },
                        request
                    );
                }
            }
        } catch (auditError) {
            console.error('Failed to create audit log:', auditError);
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to seed city',
            },
            { status: 500 }
        );
    }
}
