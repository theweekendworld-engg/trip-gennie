// Enhanced destination types with new travel data

export interface WeatherInfo {
    temp: number;
    condition: string;
    humidity: number;
}

export interface AirQuality {
    aqi: number;
    status: string;
}

export interface BestVisitTime {
    best_months: string[];
}

export interface FareDetails {
    taxi?: number;
    rental?: number;
    bus?: number;
    train?: number;
}

export interface BookingLinks {
    taxi?: string;
    rental?: string;
    bus?: string;
    train?: string;
}

export interface Waypoint {
    name: string;
    lat: number;
    lng: number;
}

export interface TransportOption {
    mode: string;
    distanceKm: number;
    travelTimeMinutes: number;
    routePolyline: string | null;
    majorWaypoints: Waypoint[] | null;
    fareDetails: FareDetails | null;
    bookingLinks: BookingLinks | null;
}

export interface NearbyAttraction {
    id: number;
    name: string;
    distanceKm: number;
    category: string;
}

export interface DestinationPhoto {
    photoUrl: string | null;
}

export interface DestinationDetail {
    id: number;
    name: string;
    slug: string;
    category: string;
    shortSummary: string;
    aiEnhancedSummary?: string | null;
    bestMonths?: string | null;
    imageUrl?: string | null;
    latitude: number;
    longitude: number;
    weatherInfo: WeatherInfo | null;
    airQuality: AirQuality | null;
    bestVisitTime: BestVisitTime | null;
    destinationPhotos: DestinationPhoto[];
}

export interface CityInfo {
    name: string;
    latitude: any; // Prisma Decimal
    longitude: any; // Prisma Decimal
}

export interface DestinationResponse {
    success: boolean;
    destination: DestinationDetail;
    transportOptions: TransportOption[];
    nearbyAttractions: NearbyAttraction[];
    city: CityInfo | null;
    error?: string;
}
