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
        url.searchParams.append('fields', 'name,formatted_address,rating,user_ratings_total,types,opening_hours,website,formatted_phone_number,reviews,photos');
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
}

export const googleMaps = new GoogleMapsService();
