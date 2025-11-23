'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TripResult } from '../../types';
import { formatCurrency, formatDistance, formatDuration, cn } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';

interface TripCardProps {
    trip: TripResult;
    citySlug: string;
}

export default function TripCard({ trip, citySlug }: TripCardProps) {
    const category = CATEGORIES.find(c => c.value === trip.category);

    return (
        <Link href={`/${citySlug}/${trip.slug}`}>
            <div className="card-hover group overflow-hidden h-full">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary-100 dark:from-primary-900 to-accent-100 dark:to-accent-900">
                    {trip.imageUrl ? (
                        <Image
                            src={trip.imageUrl}
                            alt={trip.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized={
                                trip.imageUrl.includes('unsplash.com') ||
                                trip.imageUrl.includes('googleapis.com')
                            }
                            onError={(e) => {
                                // Fallback to emoji if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-6xl">${category?.emoji || '🏞️'}</div>`;
                                }
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                            {category?.emoji || '🏞️'}
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium text-sm shadow-lg border border-gray-200 dark:border-gray-700">
                            <span>{category?.emoji}</span>
                            <span>{category?.label}</span>
                        </span>
                    </div>

                    {/* Distance Badge */}
                    <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium text-sm shadow-lg border border-gray-200 dark:border-gray-700">
                            <span>📍</span>
                            <span>{formatDistance(trip.distanceKm)}</span>
                        </span>
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-2">
                            {trip.name}
                        </h3>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-4">
                    {/* Summary */}
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {trip.summary}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                            <div className="text-xs text-muted-foreground mb-1">Time</div>
                            <div className="font-semibold text-sm">{formatDuration(trip.travelTimeMinutes)}</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                            <div className="text-xs text-muted-foreground mb-1">Budget</div>
                            <div className="font-semibold text-sm">{formatCurrency(trip.estimatedCost)}</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                            <div className="text-xs text-muted-foreground mb-1">Mode</div>
                            <div className="font-semibold text-sm capitalize">{trip.transportMode}</div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-primary-600 dark:text-primary-400">View Details</span>
                        <svg
                            className="w-5 h-5 text-primary-600 dark:text-primary-400 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
