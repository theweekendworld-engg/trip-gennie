'use client';

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { cachedFetch } from '../../lib/api-cache';

interface City {
    id: number;
    name: string;
    slug: string;
    state: string;
}

interface CitySelectorProps {
    selectedCity?: number;
    onCitySelect: (cityId: number) => void;
    className?: string;
    label?: string;
}

export default function CitySelector({ selectedCity, onCitySelect, className, label = 'Starting from' }: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const data = await cachedFetch<{ success: boolean; cities: City[] }>('/api/cities', undefined, {
                    ttl: 10 * 60 * 1000, // Cache for 10 minutes
                });
                if (data.success) {
                    setCities(data.cities);
                }
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, []);

    const selected = cities.find(c => c.id === selectedCity);

    return (
        <div className={cn('relative', className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full flex items-center justify-between gap-3',
                    'px-6 py-4 rounded-xl border-2 transition-all duration-200',
                    'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
                    'text-foreground',
                    isOpen
                        ? 'border-primary-500 dark:border-primary-400 ring-4 ring-primary-100 dark:ring-primary-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500'
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                        {selected ? selected.name[0] : '?'}
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-muted-foreground font-medium">{label}</div>
                        <div className="text-lg font-semibold text-foreground">
                            {selected ? selected.name : 'Select your city'}
                        </div>
                    </div>
                </div>
                <svg
                    className={cn('w-5 h-5 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 z-20 animate-slide-up">
                        <div className="glass rounded-xl shadow-xl overflow-hidden">
                            {loading ? (
                                <div className="p-4 text-center text-muted-foreground">Loading cities...</div>
                            ) : (
                                cities.map((city) => (
                                <button
                                    key={city.id}
                                    onClick={() => {
                                        onCitySelect(city.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-6 py-4 transition-all duration-200',
                                        'hover:bg-primary-50 dark:hover:bg-primary-900/20',
                                        'border-b border-gray-100 dark:border-gray-700 last:border-0',
                                        selectedCity === city.id && 'bg-primary-50 dark:bg-primary-900/30'
                                    )}
                                >
                                    <div className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                                        selectedCity === city.id
                                            ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    )}>
                                        {city.name[0]}
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-foreground">{city.name}</div>
                                        <div className="text-sm text-muted-foreground">{city.state}</div>
                                    </div>
                                    {selectedCity === city.id && (
                                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
