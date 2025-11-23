'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import TransportModeSelector from '../../../components/destination/TransportModeSelector';
import FareComparisonCard from '../../../components/destination/FareComparisonCard';
import WeatherWidget from '../../../components/destination/WeatherWidget';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver';
import { CATEGORIES } from '../../../lib/constants';
import { formatDistance, formatDuration } from '../../../lib/utils';
import { cachedFetch } from '../../../lib/api-cache';
import type { DestinationResponse, TransportOption } from '../../../types/destination';

// Lazy load heavy components
const RouteMap = dynamic(() => import('../../../components/destination/RouteMap'), {
    loading: () => <div className="card h-96 animate-pulse bg-gray-200 dark:bg-gray-700" />,
    ssr: false,
});

const NearbyAttractionsCarousel = dynamic(() => import('../../../components/destination/NearbyAttractionsCarousel'), {
    loading: () => <div className="card h-64 animate-pulse bg-gray-200 dark:bg-gray-700" />,
    ssr: false,
});

// Lazy load RouteMap only when it comes into viewport
function LazyRouteMap(props: any) {
    const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
    
    return (
        <div ref={ref}>
            {isVisible ? <RouteMap {...props} /> : <div className="card h-96 animate-pulse bg-gray-200 dark:bg-gray-700" />}
        </div>
    );
}

// Lazy load NearbyAttractionsCarousel only when it comes into viewport
function LazyNearbyAttractions(props: any) {
    const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
    
    return (
        <div ref={ref}>
            {isVisible ? <NearbyAttractionsCarousel {...props} /> : <div className="card h-64 animate-pulse bg-gray-200 dark:bg-gray-700" />}
        </div>
    );
}

const TRANSPORT_MODES = [
    { value: 'driving', label: 'Driving', emoji: '🚗' },
    { value: 'transit', label: 'Transit', emoji: '🚌' },
];

interface City {
    id: number;
    name: string;
    slug: string;
    state: string;
}

export default function DestinationPage() {
    const params = useParams();
    const citySlug = params.city as string;
    const destinationSlug = params.destination as string;

    const [city, setCity] = useState<City | null>(null);
    const [data, setData] = useState<DestinationResponse | null>(null);
    const [selectedMode, setSelectedMode] = useState<string>('driving');
    const [loading, setLoading] = useState(true);
    const [cityLoading, setCityLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch city from database (with caching)
    useEffect(() => {
        const fetchCity = async () => {
            setCityLoading(true);
            try {
                const data = await cachedFetch<{ success: boolean; cities: City[] }>(
                    `/api/cities?search=${citySlug}`,
                    undefined,
                    { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
                );
                if (data.success && data.cities.length > 0) {
                    const foundCity = data.cities.find((c: City) => c.slug === citySlug);
                    if (foundCity) {
                        setCity(foundCity);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch city:', error);
            } finally {
                setCityLoading(false);
            }
        };

        fetchCity();
    }, [citySlug]);

    useEffect(() => {
        if (!city || !destinationSlug) return;

        const fetchDestination = async () => {
            setLoading(true);
            setError(null);

            try {
                const responseData = await cachedFetch<DestinationResponse>(
                    '/api/destination',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            citySlug,
                            destinationSlug,
                        }),
                    },
                    { ttl: 10 * 60 * 1000, forceCache: true } // Cache for 10 minutes
                );

                if (responseData.success) {
                    setData(responseData);
                    // Set default mode to first available transport option
                    if (responseData.transportOptions && responseData.transportOptions.length > 0) {
                        setSelectedMode(responseData.transportOptions[0].mode);
                    }
                } else {
                    setError(responseData.error || 'Destination not found');
                }
            } catch (err) {
                setError('Failed to load destination');
                console.error('Destination error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDestination();
    }, [city, citySlug, destinationSlug]);

    if (cityLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading city...</p>
                </div>
            </div>
        );
    }

    if (!city) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">City not found</h1>
                    <p className="text-muted-foreground mb-4">Please select a valid city</p>
                    <Link href="/" className="btn-primary">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950">
                <div className="container-custom py-8">
                    <div className="card animate-pulse">
                        <div className="h-96 bg-muted" />
                        <div className="p-8 space-y-4">
                            <div className="h-8 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data || !data.destination) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950">
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
                    <div className="container-custom py-4">
                        <div className="flex items-center justify-between">
                            <Link href={`/${citySlug}`} className="flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <span className="font-display font-bold text-xl text-foreground">TripGennie</span>
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>
                <div className="container-custom py-16">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-2">{error || 'Destination not found'}</h1>
                        <p className="text-muted-foreground mb-6">
                            The destination you're looking for doesn't exist or has been removed.
                        </p>
                        <Link href={`/${citySlug}`} className="btn-primary">
                            Back to {city.name} Trips
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { destination, transportOptions, nearbyAttractions } = data;
    const category = CATEGORIES.find(c => c.value === destination.category);
    const primaryImage = destination.destinationPhotos?.[0]?.photoUrl || destination.imageUrl;

    // Get current transport option
    const currentTransport = transportOptions?.find(t => t.mode === selectedMode) || transportOptions?.[0];
    const availableModes = TRANSPORT_MODES.filter(mode =>
        transportOptions?.some(t => t.mode === mode.value)
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <Link href={`/${citySlug}`} className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            <span className="font-display font-bold text-xl text-foreground">TripGennie</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">From {city.name}</div>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Image with Weather Widget */}
            <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={destination.name}
                        fill
                        className="object-cover"
                        priority
                        unoptimized={primaryImage.includes('unsplash.com') || primaryImage.includes('googleapis.com')}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 dark:from-primary-900 to-accent-100 dark:to-accent-900">
                        <span className="text-9xl">{category?.emoji || '🏞️'}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Weather Widget Overlay */}
                <WeatherWidget
                    weatherInfo={destination.weatherInfo}
                    airQuality={destination.airQuality}
                    bestVisitTime={destination.bestVisitTime}
                />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 container-custom">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="badge bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-foreground shadow-lg">
                            {category?.emoji} {category?.label}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                        {destination.name}
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary */}
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold mb-4">About</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {destination.aiEnhancedSummary || destination.shortSummary}
                            </p>
                        </div>

                        {/* Nearby Attractions - Lazy loaded when in viewport */}
                        {nearbyAttractions && nearbyAttractions.length > 0 && (
                            <LazyNearbyAttractions attractions={nearbyAttractions} />
                        )}

                        {/* Photos Gallery */}
                        {destination.destinationPhotos && destination.destinationPhotos.length > 1 && (
                            <div className="card p-8">
                                <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {destination.destinationPhotos.slice(1, 7).map((photo, idx) => (
                                        photo.photoUrl && (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                                                <Image
                                                    src={photo.photoUrl}
                                                    alt={`${destination.name} - Photo ${idx + 2}`}
                                                    fill
                                                    className="object-cover"
                                                    loading="lazy"
                                                    unoptimized={photo.photoUrl.includes('googleapis.com')}
                                                />
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Route Map - Lazy loaded when in viewport */}
                        {destination.latitude && destination.longitude && data.city && (
                            <LazyRouteMap
                                latitude={destination.latitude}
                                longitude={destination.longitude}
                                destinationName={destination.name}
                                cityName={city.name}
                                cityLatitude={Number(data.city.latitude)}
                                cityLongitude={Number(data.city.longitude)}
                                routePolyline={currentTransport?.routePolyline}
                                majorWaypoints={currentTransport?.majorWaypoints as any}
                            />
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Transport Mode Selector */}
                            {availableModes.length > 1 && (
                                <TransportModeSelector
                                    selectedMode={selectedMode}
                                    onModeChange={setSelectedMode}
                                    modes={availableModes}
                                />
                            )}

                            {/* Trip Details */}
                            {currentTransport && (
                                <div className="card-glass p-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">Trip Details</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">📍</span>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">Distance</div>
                                                        <div className="font-semibold">{formatDistance(currentTransport.distanceKm)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">⏱️</span>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">Travel Time</div>
                                                        <div className="font-semibold">{formatDuration(currentTransport.travelTimeMinutes)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fare Comparison */}
                            {currentTransport && (
                                <FareComparisonCard
                                    mode={selectedMode}
                                    fareDetails={currentTransport.fareDetails}
                                    bookingLinks={currentTransport.bookingLinks}
                                />
                            )}

                            {/* CTA */}
                            <Link
                                href={`/${citySlug}`}
                                className="w-full btn-primary text-center block"
                            >
                                ← Back to Trips
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
