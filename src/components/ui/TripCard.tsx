'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TripResult } from '@/types';
import { formatCurrency, formatDistance, formatDuration, cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

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
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100">
                    {trip.imageUrl ? (
                        <Image
                            src={trip.imageUrl}
                            alt={trip.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
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
                        <span className="badge bg-white/90 backdrop-blur-sm text-foreground shadow-lg">
                            {category?.emoji} {category?.label}
                        </span>
                    </div>

                    {/* Distance Badge */}
                    <div className="absolute top-4 right-4">
                        <span className="badge bg-white/90 backdrop-blur-sm text-foreground shadow-lg">
                            📍 {formatDistance(trip.distanceKm)}
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
                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-medium text-primary-600">View Details</span>
                        <svg
                            className="w-5 h-5 text-primary-600 transition-transform group-hover:translate-x-1"
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
