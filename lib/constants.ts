// App-wide constants

export const CITIES = [
    { id: 1, name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka' },
    { id: 2, name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra' },
    { id: 3, name: 'Pune', slug: 'pune', state: 'Maharashtra' },
    { id: 4, name: 'Delhi', slug: 'delhi', state: 'Delhi' },
    { id: 5, name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu' },
    { id: 6, name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana' },
] as const;

export const CATEGORIES = [
    { value: 'hill', label: 'Hill Stations', emoji: '⛰️' },
    { value: 'lake', label: 'Lakes', emoji: '🏞️' },
    { value: 'waterfall', label: 'Waterfalls', emoji: '💧' },
    { value: 'fort', label: 'Forts', emoji: '🏰' },
    { value: 'temple', label: 'Temples', emoji: '🛕' },
    { value: 'adventure', label: 'Adventure', emoji: '🏕️' },
    { value: 'beach', label: 'Beaches', emoji: '🏖️' },
    { value: 'wildlife', label: 'Wildlife', emoji: '🦁' },
] as const;

export const TRANSPORT_MODES = [
    { value: 'car', label: 'Car', emoji: '🚗' },
    { value: 'train', label: 'Train', emoji: '🚆' },
    { value: 'bus', label: 'Bus', emoji: '🚌' },
    { value: 'bike', label: 'Bike', emoji: '🏍️' },
] as const;

export const BUDGET_RANGES = [
    { value: 1000, label: 'Under ₹1,000' },
    { value: 1500, label: 'Under ₹1,500' },
    { value: 2000, label: 'Under ₹2,000' },
    { value: 3000, label: 'Under ₹3,000' },
    { value: 5000, label: 'Under ₹5,000' },
] as const;

export const DURATION_OPTIONS = [
    { value: 1, label: '1 Day Trip' },
    { value: 2, label: '2 Day Trip' },
] as const;

export const TRAVEL_TIME_RANGES = [
    { value: 120, label: 'Under 2 hours' },
    { value: 240, label: 'Under 4 hours' },
    { value: 360, label: 'Under 6 hours' },
] as const;

// Rate limiting
export const RATE_LIMITS = {
    SEARCH_PER_15_MIN: 100,
    API_PER_15_MIN: 50,
} as const;

// Fuel cost calculation (₹/km)
export const FUEL_COST_PER_KM = {
    car: 7, // Assuming 15 km/l and ₹105/l
    bike: 3, // Assuming 35 km/l and ₹105/l
} as const;
