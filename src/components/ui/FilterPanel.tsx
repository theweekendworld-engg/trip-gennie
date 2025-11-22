'use client';

import { useState } from 'react';
import { SearchFilters } from '@/types';
import { CATEGORIES, BUDGET_RANGES, TRAVEL_TIME_RANGES, TRANSPORT_MODES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    className?: string;
}

export default function FilterPanel({ filters, onFiltersChange, className }: FilterPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleCategory = (category: string) => {
        const current = filters.categories || [];
        const updated = current.includes(category)
            ? current.filter(c => c !== category)
            : [...current, category];
        onFiltersChange({ ...filters, categories: updated });
    };

    const toggleTransport = (mode: string) => {
        const current = filters.transportModes || [];
        const updated = current.includes(mode)
            ? current.filter(m => m !== mode)
            : [...current, mode];
        onFiltersChange({ ...filters, transportModes: updated });
    };

    return (
        <div className={cn('card-glass sticky top-4', className)}>
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Filters</h2>
                    <p className="text-sm text-muted-foreground mt-1">Customize your search</p>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="lg:hidden btn-ghost p-2"
                >
                    <svg
                        className={cn('w-5 h-5 transition-transform', !isExpanded && 'rotate-180')}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            </div>

            {/* Filters Content */}
            <div className={cn('space-y-6 p-6', !isExpanded && 'hidden lg:block')}>
                {/* Budget Filter */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Budget</label>
                    <div className="space-y-2">
                        {BUDGET_RANGES.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => onFiltersChange({ ...filters, maxBudget: range.value })}
                                className={cn(
                                    'w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200',
                                    'border-2 text-sm font-medium',
                                    filters.maxBudget === range.value
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                )}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Travel Time Filter */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Travel Time</label>
                    <div className="space-y-2">
                        {TRAVEL_TIME_RANGES.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => onFiltersChange({ ...filters, maxTravelTime: range.value })}
                                className={cn(
                                    'w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200',
                                    'border-2 text-sm font-medium',
                                    filters.maxTravelTime === range.value
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                )}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Categories</label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.value}
                                onClick={() => toggleCategory(category.value)}
                                className={cn(
                                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                                    'border-2',
                                    filters.categories?.includes(category.value)
                                        ? 'border-primary-500 bg-primary-500 text-white shadow-md'
                                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                )}
                            >
                                {category.emoji} {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transport Mode Filter */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Transport</label>
                    <div className="grid grid-cols-2 gap-2">
                        {TRANSPORT_MODES.map((mode) => (
                            <button
                                key={mode.value}
                                onClick={() => toggleTransport(mode.value)}
                                className={cn(
                                    'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                                    'border-2 flex items-center justify-center gap-2',
                                    filters.transportModes?.includes(mode.value)
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                )}
                            >
                                <span className="text-lg">{mode.emoji}</span>
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reset Button */}
                <button
                    onClick={() => onFiltersChange({ cityId: filters.cityId })}
                    className="w-full btn-secondary py-3"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
}
