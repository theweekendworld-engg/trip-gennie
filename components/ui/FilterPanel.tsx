'use client';

import { useState } from 'react';
import { SearchFilters } from '../../types';
import { CATEGORIES, BUDGET_RANGES, TRAVEL_TIME_RANGES, TRANSPORT_MODES } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface FilterPanelProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    className?: string;
}

export default function FilterPanel({ filters, onFiltersChange, className }: FilterPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Get active filters count
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.maxBudget) count++;
        if (filters.maxTravelTime) count++;
        if (filters.categories && filters.categories.length > 0) count += filters.categories.length;
        if (filters.transportModes && filters.transportModes.length > 0) count += filters.transportModes.length;
        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    // Helper to get filter labels
    const getBudgetLabel = (value?: number) => {
        return BUDGET_RANGES.find(r => r.value === value)?.label;
    };

    const getTravelTimeLabel = (value?: number) => {
        return TRAVEL_TIME_RANGES.find(r => r.value === value)?.label;
    };

    const getCategoryLabel = (value: string) => {
        return CATEGORIES.find(c => c.value === value);
    };

    const getTransportLabel = (value: string) => {
        return TRANSPORT_MODES.find(m => m.value === value);
    };

    // Clear individual filters
    const clearBudget = () => {
        const { maxBudget, ...rest } = filters;
        onFiltersChange(rest);
    };

    const clearTravelTime = () => {
        const { maxTravelTime, ...rest } = filters;
        onFiltersChange(rest);
    };

    const clearCategory = (category: string) => {
        const updated = (filters.categories || []).filter(c => c !== category);
        onFiltersChange({ ...filters, categories: updated.length > 0 ? updated : undefined });
    };

    const clearTransport = (mode: string) => {
        const updated = (filters.transportModes || []).filter(m => m !== mode);
        onFiltersChange({ ...filters, transportModes: updated.length > 0 ? updated : undefined });
    };

    const toggleCategory = (category: string) => {
        const current = filters.categories || [];
        const updated = current.includes(category)
            ? current.filter(c => c !== category)
            : [...current, category];
        onFiltersChange({ ...filters, categories: updated.length > 0 ? updated : undefined });
    };

    const toggleTransport = (mode: string) => {
        const current = filters.transportModes || [];
        const updated = current.includes(mode)
            ? current.filter(m => m !== mode)
            : [...current, mode];
        onFiltersChange({ ...filters, transportModes: updated.length > 0 ? updated : undefined });
    };

    return (
        <div className={cn('card-glass sticky top-4 border-gray-200/60 dark:border-gray-700/50', className)}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Filters</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {activeFiltersCount > 0 ? `${activeFiltersCount} active` : 'Customize your search'}
                    </p>
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

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-primary-50/50 dark:bg-primary-900/20">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">Active Filters</h3>
                        <button
                            onClick={() => onFiltersChange({ cityId: filters.cityId })}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {filters.maxBudget && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700">
                                Budget: {getBudgetLabel(filters.maxBudget)}
                                <button
                                    onClick={clearBudget}
                                    className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                                    aria-label="Remove budget filter"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        )}
                        {filters.maxTravelTime && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700">
                                Time: {getTravelTimeLabel(filters.maxTravelTime)}
                                <button
                                    onClick={clearTravelTime}
                                    className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                                    aria-label="Remove travel time filter"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        )}
                        {filters.categories?.map((cat) => {
                            const category = getCategoryLabel(cat);
                            return category ? (
                                <span
                                    key={cat}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700"
                                >
                                    {category.emoji} {category.label}
                                    <button
                                        onClick={() => clearCategory(cat)}
                                        className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                                        aria-label={`Remove ${category.label} filter`}
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ) : null;
                        })}
                        {filters.transportModes?.map((mode) => {
                            const transport = getTransportLabel(mode);
                            return transport ? (
                                <span
                                    key={mode}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700"
                                >
                                    {transport.emoji} {transport.label}
                                    <button
                                        onClick={() => clearTransport(mode)}
                                        className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                                        aria-label={`Remove ${transport.label} filter`}
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {/* Filters Content */}
            <div className={cn('space-y-6 p-6', !isExpanded && 'hidden lg:block')}>
                {/* Budget Filter */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Budget</label>
                    <div className="space-y-2">
                        {BUDGET_RANGES.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => {
                                    // Toggle: if already selected, deselect it
                                    const newBudget = filters.maxBudget === range.value ? undefined : range.value;
                                    onFiltersChange({ ...filters, maxBudget: newBudget });
                                }}
                                className={cn(
                                    'w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200',
                                    'border-2 text-sm font-medium text-foreground',
                                    filters.maxBudget === range.value
                                        ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                                onClick={() => {
                                    // Toggle: if already selected, deselect it
                                    const newTime = filters.maxTravelTime === range.value ? undefined : range.value;
                                    onFiltersChange({ ...filters, maxTravelTime: newTime });
                                }}
                                className={cn(
                                    'w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200',
                                    'border-2 text-sm font-medium text-foreground',
                                    filters.maxTravelTime === range.value
                                        ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'
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
                                        ? 'border-primary-500 dark:border-primary-400 bg-primary-500 dark:bg-primary-600 text-white shadow-md'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground'
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
                                    'border-2 flex items-center justify-center gap-2 text-foreground',
                                    filters.transportModes?.includes(mode.value)
                                        ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                )}
                            >
                                <span className="text-lg">{mode.emoji}</span>
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reset Button */}
                {activeFiltersCount > 0 && (
                    <button
                        onClick={() => {
                            onFiltersChange({
                                cityId: filters.cityId,
                                categories: undefined,
                                transportModes: undefined,
                                maxBudget: undefined,
                                maxTravelTime: undefined,
                            });
                        }}
                        className="w-full btn-secondary py-3"
                    >
                        Reset All Filters
                    </button>
                )}
            </div>
        </div>
    );
}
