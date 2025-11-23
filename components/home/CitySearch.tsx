'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface City {
    id: number;
    name: string;
    slug: string;
    state: string;
}

export default function CitySearch() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch all cities on mount
    useEffect(() => {
        const fetchCities = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/cities');
                const data = await response.json();
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

    // Filter cities based on search
    useEffect(() => {
        if (!search.trim()) {
            setFilteredCities(cities.slice(0, 5)); // Show top 5 when empty
            return;
        }

        const filtered = cities.filter(city =>
            city.name.toLowerCase().includes(search.toLowerCase()) ||
            city.state.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredCities(filtered);
        setHighlightedIndex(0);
    }, [search, cities]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredCities.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCities[highlightedIndex]) {
                    handleCitySelect(filteredCities[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    const handleCitySelect = (city: City) => {
        router.push(`/${city.slug}`);
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for a city... (e.g., Mumbai, Delhi)"
                    className="w-full px-6 py-4 pr-12 text-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && filteredCities.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="max-h-96 overflow-y-auto">
                            {filteredCities.map((city, index) => (
                                <button
                                    key={city.id}
                                    type="button"
                                    onClick={() => handleCitySelect(city)}
                                    className={cn(
                                        'w-full px-6 py-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0',
                                        index === highlightedIndex && 'bg-gray-100 dark:bg-gray-700'
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-lg">{city.name}</div>
                                            <div className="text-sm text-muted-foreground">{city.state}</div>
                                        </div>
                                        <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {search && filteredCities.length > 0 && (
                            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-xs text-muted-foreground border-t border-gray-200 dark:border-gray-700">
                                Found {filteredCities.length} {filteredCities.length === 1 ? 'city' : 'cities'}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {isOpen && search && filteredCities.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl p-8 text-center"
                >
                    <div className="text-4xl mb-2">🔍</div>
                    <div className="font-semibold mb-1">No cities found</div>
                    <div className="text-sm text-muted-foreground">
                        Try searching for a different city
                    </div>
                </motion.div>
            )}
        </div>
    );
}
