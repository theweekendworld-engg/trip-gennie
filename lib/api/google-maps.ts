import { Prisma } from '@prisma/client';

interface DistanceMatrixResult {
    distanceKm: number;
    durationMinutes: number;
    cached: boolean;
}

interface Coordinates {
    lat: number;
    lng: number;
}

export class GoogleMapsService {
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('GOOGLE_MAPS_API_KEY not set');
        }
    }

    /**
     * Get distance and duration between two points
     * Uses database cache first, falls back to API
     */
    async getDistanceMatrix(
        origin: Coordinates,
        destination: Coordinates,
        mode: 'driving' | 'transit' = 'driving',
        prisma: any
    ): Promise<DistanceMatrixResult> {
        // Check cache first
        const cached = await prisma.distanceMatrixCache.findFirst({
            where: {
                originLat: origin.lat as unknown as Prisma.Decimal,
                originLng: origin.lng as unknown as Prisma.Decimal,
                destinationLat: destination.lat as unknown as Prisma.Decimal,
                destinationLng: destination.lng as unknown as Prisma.Decimal,
                transportMode: mode,
            },
        });

        if (cached) {
            return {
                distanceKm: Math.round(cached.distanceMeters / 1000),
                durationMinutes: Math.round(cached.durationSeconds / 60),
                cached: true,
            };
        }

        // Cache miss - call API
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
        url.searchParams.append('origins', `${origin.lat},${origin.lng}`);
        url.searchParams.append('destinations', `${destination.lat},${destination.lng}`);
        url.searchParams.append('mode', mode);
        url.searchParams.append('key', this.apiKey);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Google Maps API error: ${data.status}`);
        }

        const element = data.rows[0]?.elements[0];
        if (!element || element.status !== 'OK') {
            throw new Error('No route found');
        }

        // Store in cache
        await prisma.distanceMatrixCache.create({
            data: {
                originLat: origin.lat as unknown as Prisma.Decimal,
                originLng: origin.lng as unknown as Prisma.Decimal,
                destinationLat: destination.lat as unknown as Prisma.Decimal,
                destinationLng: destination.lng as unknown as Prisma.Decimal,
                transportMode: mode,
                distanceMeters: element.distance.value,
                durationSeconds: element.duration.value,
                distanceText: element.distance.text,
                durationText: element.duration.text,
            },
        });

        return {
            distanceKm: Math.round(element.distance.value / 1000),
            durationMinutes: Math.round(element.duration.value / 60),
            cached: false,
        };
    }

    /**
     * Geocode an address to coordinates
     */
    async geocode(address: string, prisma: any): Promise<Coordinates> {
        const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
        url.searchParams.append('address', address);
        url.searchParams.append('key', this.apiKey);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status !== 'OK' || !data.results[0]) {
            throw new Error(`Geocoding failed: ${data.status}`);
        }

        const location = data.results[0].geometry.location;
        return {
            lat: location.lat,
            lng: location.lng,
        };
    }

    /**
     * Get place details from Google Places API
     */
    async getPlaceDetails(placeId: string, prisma: any): Promise<any> {
        // Check cache
        const cached = await prisma.placesCache.findUnique({
            where: { placeId },
        });

        if (cached) {
            return cached.fullResponse;
        }

        // Call API
        const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
        url.searchParams.append('place_id', placeId);
        url.searchParams.append('fields', 'name,formatted_address,rating,user_ratings_total,types,opening_hours,website,formatted_phone_number,reviews,photos,editorial_summary,geometry');
        url.searchParams.append('key', this.apiKey);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Places API error: ${data.status}`);
        }

        const result = data.result;

        // Store in cache
        await prisma.placesCache.create({
            data: {
                placeId,
                name: result.name,
                formattedAddress: result.formatted_address,
                rating: result.rating ? (result.rating as unknown as Prisma.Decimal) : null,
                userRatingsTotal: result.user_ratings_total,
                types: result.types,
                openingHours: result.opening_hours,
                website: result.website,
                phoneNumber: result.formatted_phone_number,
                reviews: result.reviews,
                fullResponse: result,
            },
        });

        return result;
    }
    /**
     * Get distance and duration between multiple origins and destinations
     */
    async getDistanceMatrixBatch(
        origins: Coordinates[],
        destinations: Coordinates[],
        mode: 'driving' | 'transit' = 'driving',
        prisma: any
    ): Promise<DistanceMatrixResult[]> {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        // Note: For a true production app, we should check cache for each pair first.
        // For this MVP/seeding script, we'll just hit the API for simplicity in batching,
        // or implement a more complex cache lookup/merge strategy if needed.
        // Here we will assume we want fresh data or just simple API call for the batch.

        const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
        url.searchParams.append('origins', origins.map(o => `${o.lat},${o.lng}`).join('|'));
        url.searchParams.append('destinations', destinations.map(d => `${d.lat},${d.lng}`).join('|'));
        url.searchParams.append('mode', mode);
        url.searchParams.append('key', this.apiKey);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Google Maps API error: ${data.status}`);
        }

        const results: DistanceMatrixResult[] = [];

        // Parse rows (origins) and elements (destinations)
        // Assuming 1 origin and N destinations for our specific use case (City Center -> Destinations)
        if (data.rows.length > 0) {
            const elements = data.rows[0].elements;
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                if (element.status === 'OK') {
                    results.push({
                        distanceKm: Math.round(element.distance.value / 1000),
                        durationMinutes: Math.round(element.duration.value / 60),
                        cached: false
                    });
                } else {
                    // Handle not found or zero results
                    results.push({
                        distanceKm: 0,
                        durationMinutes: 0,
                        cached: false
                    });
                }
            }
        }

        return results;
    }

    /**
     * Get directions between two points to extract polyline and waypoints
     */
    async getDirections(
        origin: Coordinates,
        destination: Coordinates,
        mode: 'driving' | 'transit' = 'driving',
        prisma: any
    ): Promise<any> {
        const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
        url.searchParams.append('origin', `${origin.lat},${origin.lng}`);
        url.searchParams.append('destination', `${destination.lat},${destination.lng}`);
        url.searchParams.append('mode', mode);
        url.searchParams.append('key', this.apiKey);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status !== 'OK') {
            // Don't throw, just return null so we don't break the whole batch
            console.warn(`Directions API error: ${data.status}`);
            return null;
        }

        const route = data.routes[0];
        if (!route) return null;

        // Extract major waypoints (start, end, and some mid-points from steps)
        // This is a simplified extraction.
        const leg = route.legs[0];
        const waypoints = [
            { name: 'Start', lat: leg.start_location.lat, lng: leg.start_location.lng },
            ...leg.steps.filter((_: any, i: number) => i % 5 === 0).map((step: any) => ({
                name: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML
                lat: step.end_location.lat,
                lng: step.end_location.lng
            })),
            { name: 'End', lat: leg.end_location.lat, lng: leg.end_location.lng }
        ];

        return {
            polyline: route.overview_polyline.points,
            waypoints: waypoints,
            distanceText: leg.distance.text,
            durationText: leg.duration.text
        };
    }


    /**
     * Search for places using text query
     */
    async searchPlaces(query: string, prisma: any): Promise<any[]> {
        const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
        url.searchParams.append('query', query);
        url.searchParams.append('key', this.apiKey);

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(`Places Search API error: ${data.status}`);
        }

        return data.results || [];
    }
}

export const googleMaps = new GoogleMapsService();
