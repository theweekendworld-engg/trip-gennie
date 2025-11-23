'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '../../lib/utils';
import type { FareDetails, BookingLinks } from '../../types/destination';

interface FareComparisonCardProps {
    mode: string;
    fareDetails: FareDetails | null;
    bookingLinks: BookingLinks | null;
}

export default function FareComparisonCard({ mode, fareDetails, bookingLinks }: FareComparisonCardProps) {
    if (!fareDetails) {
        return (
            <div className="card-glass p-6">
                <h3 className="text-lg font-bold mb-2">💰 Estimated Fare</h3>
                <p className="text-sm text-muted-foreground">No fare information available</p>
            </div>
        );
    }

    const isDriving = mode === 'driving';
    const fareItems = isDriving
        ? [
            { label: 'Taxi', value: fareDetails.taxi, link: bookingLinks?.taxi, emoji: '🚕' },
            { label: 'Rental', value: fareDetails.rental, link: bookingLinks?.rental, emoji: '🚗' },
        ]
        : [
            { label: 'Bus', value: fareDetails.bus, link: bookingLinks?.bus, emoji: '🚌' },
            { label: 'Train', value: fareDetails.train, link: bookingLinks?.train, emoji: '🚆' },
        ];

    const totalFare = Object.values(fareDetails).reduce((sum, val) => sum + (val || 0), 0);
    const avgFare = totalFare / Object.values(fareDetails).filter(v => v).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card-glass p-6 space-y-4"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">💰 Estimated Fare</h3>
                <div className="text-right">
                    <div className="text-xs text-muted-foreground">Average</div>
                    <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(avgFare)}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {fareItems.map((item, idx) => (
                    item.value && (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{item.emoji}</span>
                                <div>
                                    <div className="font-medium">{item.label}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatCurrency(item.value)}
                                    </div>
                                </div>
                            </div>
                            {item.link && (
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
                                >
                                    Book →
                                </a>
                            )}
                        </motion.div>
                    )
                ))}
            </div>

            {isDriving && (
                <div className="pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                        💡 Prices are estimates. Actual fares may vary based on traffic and time of day.
                    </p>
                </div>
            )}
        </motion.div>
    );
}
