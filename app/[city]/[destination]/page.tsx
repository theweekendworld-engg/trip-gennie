'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import GoogleMap from '../../../components/ui/GoogleMap';
import { CITIES, CATEGORIES, TRANSPORT_MODES } from '../../../lib/constants';
import { formatCurrency, formatDistance, formatDuration, cn } from '../../../lib/utils';

interface DestinationDetail {
    id: number;
    name: string;
    slug: string;
    category: string;
    shortSummary: string;
    aiEnhancedSummary?: string;
    bestMonths?: string;
    imageUrl?: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
    travelTimeMinutes: number;
    estimatedCost: number;
    transportMode: string;
    destinationPhotos?: Array<{ photoUrl?: string }>;
}

export default function DestinationPage() {
    const params = useParams();
    const router = useRouter();
    const citySlug = params.city as string;
    const destinationSlug = params.destination as string;
    
    const city = CITIES.find(c => c.slug === citySlug);
    const [destination, setDestination] = useState<DestinationDetail | null>(null);
    const [cityCoords, setCityCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!city || !destinationSlug) return;

        const fetchDestination = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/destination', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        citySlug,
                        destinationSlug,
                    }),
                });

            const data = await response.json();

            if (data.success) {
                setDestination(data.destination);
                if (data.city) {
                    setCityCoords({
                        latitude: Number(data.city.latitude),
                        longitude: Number(data.city.longitude),
                    });
                }
            } else {
                setError(data.error || 'Destination not found');
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

    if (error || !destination) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950">
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
                    <div className="container-custom py-4">
                        <div className="flex items-center justify-between">
                            <Link href={`/${citySlug}`} className="flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <span className="font-display font-bold text-xl text-foreground">TripGenie</span>
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

    const category = CATEGORIES.find(c => c.value === destination.category);
    const transport = TRANSPORT_MODES.find(m => m.value === destination.transportMode);
    const primaryImage = destination.destinationPhotos?.[0]?.photoUrl || destination.imageUrl;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <Link href={`/${citySlug}`} className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            <span className="font-display font-bold text-xl text-foreground">TripGenie</span>
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

            {/* Hero Image */}
            <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
                {primaryImage ? (
                    <Image
                        src={primaryImage}
                        alt={destination.name}
                        fill
                        className="object-cover"
                        priority
                        unoptimized={primaryImage.includes('unsplash.com')}
                        onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                const fallback = parent.querySelector('.image-fallback');
                                if (fallback) {
                                    (fallback as HTMLElement).style.display = 'flex';
                                }
                            }
                        }}
                    />
                ) : null}
                {(!primaryImage || primaryImage === '') && (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 dark:from-primary-900 to-accent-100 dark:to-accent-900 image-fallback">
                        <span className="text-9xl">{category?.emoji || '🏞️'}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 container-custom">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="badge bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-foreground shadow-lg">
                            {category?.emoji} {category?.label}
                        </span>
                        {destination.bestMonths && (
                            <span className="badge bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-foreground shadow-lg">
                                📅 Best: {destination.bestMonths}
                            </span>
                        )}
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
                                                />
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Google Map */}
                        {destination.latitude && destination.longitude && (
                            <GoogleMap
                                latitude={destination.latitude}
                                longitude={destination.longitude}
                                destinationName={destination.name}
                                cityName={city?.name}
                                cityLatitude={cityCoords?.latitude}
                                cityLongitude={cityCoords?.longitude}
                            />
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="card-glass sticky top-24 p-6 space-y-6">
                            {/* Quick Stats */}
                            <div>
                                <h3 className="text-lg font-bold mb-4">Trip Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📍</span>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Distance</div>
                                                <div className="font-semibold">{formatDistance(destination.distanceKm)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">⏱️</span>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Travel Time</div>
                                                <div className="font-semibold">{formatDuration(destination.travelTimeMinutes)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{transport?.emoji || '🚗'}</span>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Transport</div>
                                                <div className="font-semibold capitalize">{destination.transportMode}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">💰</span>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Estimated Cost</div>
                                                <div className="font-semibold">{formatCurrency(destination.estimatedCost)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <Link
                                href={`/${citySlug}`}
                                className="w-full btn-primary text-center"
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

