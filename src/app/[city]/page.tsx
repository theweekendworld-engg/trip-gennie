'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import FilterPanel from '@/components/ui/FilterPanel';
import TripCard from '@/components/ui/TripCard';
import { SearchFilters, TripResult } from '@/types';
import { CITIES } from '@/lib/constants';

export default function CityPage() {
    const params = useParams();
    const citySlug = params.city as string;
    const city = CITIES.find(c => c.slug === citySlug);

    const [filters, setFilters] = useState<SearchFilters>({
        cityId: city?.id || 1,
        categories: [],
        transportModes: [],
    });
    const [trips, setTrips] = useState<TripResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (city) {
            searchTrips();
        }
    }, [city, filters]);

    const searchTrips = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters),
            });

            const data = await response.json();

            if (data.success) {
                setTrips(data.trips);
            } else {
                setError(data.error || 'Failed to load trips');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!city) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">City not found</h1>
                    <p className="text-muted-foreground">Please select a valid city</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30 backdrop-blur-sm bg-white/80">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            <span className="font-display font-bold text-xl">TripGenie</span>
                        </a>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Exploring from</div>
                            <div className="font-semibold text-lg">{city.name}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1">
                        <FilterPanel
                            filters={filters}
                            onFiltersChange={setFilters}
                        />
                    </aside>

                    {/* Results */}
                    <main className="lg:col-span-3">
                        {/* Results Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-2">
                                Weekend Trips from {city.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {loading ? 'Searching...' : `Found ${trips.length} amazing destinations`}
                            </p>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="card bg-red-50 border-red-200 p-6 text-center">
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={searchTrips}
                                    className="btn-primary mt-4"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="grid-auto-fill">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="card h-96 animate-pulse">
                                        <div className="h-56 bg-muted" />
                                        <div className="p-5 space-y-3">
                                            <div className="h-4 bg-muted rounded w-3/4" />
                                            <div className="h-4 bg-muted rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Results Grid */}
                        {!loading && !error && trips.length > 0 && (
                            <div className="grid-auto-fill">
                                {trips.map((trip) => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        citySlug={citySlug}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && trips.length === 0 && (
                            <div className="card p-12 text-center">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold mb-2">No trips found</h3>
                                <p className="text-muted-foreground mb-6">
                                    Try adjusting your filters to see more results
                                </p>
                                <button
                                    onClick={() => setFilters({ cityId: city.id })}
                                    className="btn-primary"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
