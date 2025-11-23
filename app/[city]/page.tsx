'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import TripCard from '../../components/ui/TripCard';
import ThemeToggle from '../../components/ui/ThemeToggle';
import CitySearch from '../../components/home/CitySearch';
import { SearchFilters, TripResult } from '../../types';
import { useAnalytics } from '../../hooks/useAnalytics';
import { cachedFetch } from '../../lib/api-cache';

// Lazy load FilterPanel (not critical for initial render)
const FilterPanel = dynamic(() => import('../../components/ui/FilterPanel'), {
    loading: () => <div className="card h-96 animate-pulse bg-gray-200 dark:bg-gray-700" />,
    ssr: false,
});

interface City {
    id: number;
    name: string;
    slug: string;
    state: string;
}

export default function CityPage() {
    const params = useParams();
    const router = useRouter();
    const citySlug = params.city as string;
    const { trackSearch } = useAnalytics();

    const [city, setCity] = useState<City | null>(null);
    const [filters, setFilters] = useState<SearchFilters>({
        cityId: undefined,
        categories: undefined,
        transportModes: undefined,
    });
    const [trips, setTrips] = useState<TripResult[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [cityLoading, setCityLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });

    // Filter trips based on search query
    const filteredTrips = trips.filter(trip =>
        trip.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fetch city from database (with caching)
    useEffect(() => {
        const fetchCity = async () => {
            setCityLoading(true);
            try {
                const data = await cachedFetch<{ success: boolean; cities: City[] }>(
                    `/api/cities?search=${citySlug}`,
                    undefined,
                    { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
                );
                if (data.success && data.cities.length > 0) {
                    const foundCity = data.cities.find((c: City) => c.slug === citySlug);
                    if (foundCity) {
                        setCity(foundCity);
                        setFilters(prev => ({ ...prev, cityId: foundCity.id }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch city:', error);
            } finally {
                setCityLoading(false);
            }
        };

        fetchCity();
    }, [citySlug]);

    const searchTrips = useCallback(async () => {
        if (!filters.cityId) return;

        setLoading(true);
        setError(null);

        try {
            const data = await cachedFetch<{ success: boolean; trips?: TripResult[]; error?: string; pagination?: any; total?: number }>(
                `/api/search?page=${pagination.page}&limit=${pagination.limit}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(filters),
                },
                { ttl: 5 * 60 * 1000, forceCache: true } // Cache search results for 5 minutes
            );

            if (data.success) {
                setTrips(data.trips || []);
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total,
                        pages: data.pagination.pages,
                    }));
                } else if (data.total !== undefined) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.total || 0,
                        pages: Math.ceil((data.total || 0) / prev.limit),
                    }));
                }
            } else {
                setError(data.error || 'Failed to load trips');
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit]);

    // Search trips when filters change
    useEffect(() => {
        if (filters.cityId) {
            setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
        }
    }, [filters]);

    useEffect(() => {
        if (filters.cityId) {
            searchTrips();
        }
    }, [filters, pagination.page, searchTrips]);

    if (cityLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading city...</p>
                </div>
            </div>
        );
    }

    if (!city) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">City not found</h1>
                    <p className="text-muted-foreground mb-4">The city you're looking for doesn't exist or hasn't been added yet.</p>
                    <a href="/" className="btn-primary">
                        Back to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            <span className="font-display font-bold text-xl text-foreground">TripGennie</span>
                        </a>
                        <div className="flex items-center gap-4">
                            <div className="w-96">
                                <CitySearch />
                            </div>
                            <ThemeToggle />
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
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-3xl font-bold">
                                    Weekend Trips from {city.name}
                                </h1>
                            </div>

                            {/* Search Bar */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="Search destinations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                />
                                <svg
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <p className="text-muted-foreground">
                                {loading ? (
                                    'Searching...'
                                ) : filteredTrips.length === 0 && searchQuery ? (
                                    `No destinations found matching "${searchQuery}"`
                                ) : filteredTrips.length === 0 ? (
                                    'No trips found. Try adjusting your filters.'
                                ) : (
                                    `Found ${filteredTrips.length} amazing destination${filteredTrips.length === 1 ? '' : 's'}${searchQuery ? ` matching "${searchQuery}"` : ''}`
                                )}
                            </p>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-6 text-center">
                                <p className="text-red-600 dark:text-red-400">{error}</p>
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
                        {!loading && !error && filteredTrips.length > 0 && (
                            <>
                                <div className="grid-auto-fill">
                                    {filteredTrips.map((trip) => (
                                        <TripCard
                                            key={trip.id}
                                            trip={trip}
                                            citySlug={citySlug}
                                        />
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} destinations
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                disabled={pagination.page === 1}
                                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex gap-1">
                                                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                                    let pageNum;
                                                    if (pagination.pages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.page <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (pagination.page >= pagination.pages - 2) {
                                                        pageNum = pagination.pages - 4 + i;
                                                    } else {
                                                        pageNum = pagination.page - 2 + i;
                                                    }
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => {
                                                                setPagination(prev => ({ ...prev, page: pageNum }));
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                            className={`px-4 py-2 rounded-lg border transition-colors ${
                                                                pagination.page === pageNum
                                                                    ? 'bg-primary-600 text-white border-primary-600'
                                                                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                disabled={pagination.page === pagination.pages}
                                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Empty State */}
                        {!loading && !error && filteredTrips.length === 0 && trips.length > 0 && searchQuery && (
                            <div className="card p-12 text-center">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
                                <p className="text-muted-foreground mb-6">
                                    No destinations match "{searchQuery}". Try a different search term.
                                </p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="btn-primary"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
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
