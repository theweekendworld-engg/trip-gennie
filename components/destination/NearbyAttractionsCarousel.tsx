'use client';

import { motion } from 'framer-motion';
import { formatDistance } from '../../lib/utils';
import type { NearbyAttraction } from '../../types/destination';

interface NearbyAttractionsCarouselProps {
    attractions: NearbyAttraction[];
}

export default function NearbyAttractionsCarousel({ attractions }: NearbyAttractionsCarouselProps) {
    if (!attractions || attractions.length === 0) {
        return null;
    }

    const getCategoryEmoji = (category: string) => {
        const lower = category.toLowerCase();
        if (lower.includes('museum')) return '🏛️';
        if (lower.includes('park')) return '🌳';
        if (lower.includes('temple') || lower.includes('church')) return '🛕';
        if (lower.includes('restaurant') || lower.includes('food')) return '🍽️';
        if (lower.includes('shop') || lower.includes('store')) return '🛍️';
        if (lower.includes('beach')) return '🏖️';
        if (lower.includes('mountain')) return '⛰️';
        return '📍';
    };

    return (
        <div className="card p-8">
            <h2 className="text-2xl font-bold mb-6">🎯 Nearby Attractions</h2>

            <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                    {attractions.map((attraction, idx) => (
                        <motion.div
                            key={attraction.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex-none w-64 snap-start"
                        >
                            <div className="card-glass p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{getCategoryEmoji(attraction.category)}</span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                                            {attraction.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>📏</span>
                                            <span>{formatDistance(attraction.distanceKm)} away</span>
                                        </div>
                                        <div className="mt-2">
                                            <span className="inline-block px-2 py-1 bg-muted/50 rounded text-xs capitalize">
                                                {attraction.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Scroll Indicator */}
                {attractions.length > 3 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="bg-gradient-to-l from-white dark:from-gray-950 to-transparent w-20 h-full flex items-center justify-end pr-2">
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-muted-foreground"
                            >
                                →
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
