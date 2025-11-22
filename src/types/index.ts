export interface City {
    id: number;
    name: string;
    slug: string;
    state: string;
    latitude: number;
    longitude: number;
}

export interface Destination {
    id: number;
    name: string;
    slug: string;
    latitude: number;
    longitude: number;
    category: string;
    shortSummary: string;
    aiEnhancedSummary?: string;
    bestMonths?: string;
    imageUrl?: string;
}

export interface TripResult {
    id: number;
    name: string;
    slug: string;
    category: string;
    summary: string;
    imageUrl?: string;
    distanceKm: number;
    travelTimeMinutes: number;
    estimatedCost: number;
    transportMode: string;
}

export interface SearchFilters {
    cityId: number;
    maxBudget?: number;
    duration?: number;
    maxTravelTime?: number;
    categories?: string[];
    transportModes?: string[];
}

export interface UserSession {
    id: string;
    fingerprintHash: string;
    totalSearches: number;
}
