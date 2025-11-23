'use client';

import ThemeToggle from '../components/ui/ThemeToggle';
import CitySearch from '../components/home/CitySearch';
import StructuredData from '../components/StructuredData';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://tripgenie.com';

const homepageStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'TripGenie',
    description: 'Discover amazing weekend getaways from Indian cities. Find perfect 1-day and 2-day trips tailored to your budget, time, and interests.',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    areaServed: {
        '@type': 'Country',
        name: 'India',
    },
    serviceType: 'Weekend Trip Planning',
    offers: {
        '@type': 'Offer',
        priceRange: '₹1,000 - ₹5,000',
        availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '150',
    },
};

export default function HomePage() {
    return (
        <>
            <StructuredData data={homepageStructuredData} />
            <div className="min-h-screen relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 gradient-mesh opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 dark:via-gray-900/50 to-white dark:to-gray-950" />

                {/* Content */}
                <div className="relative z-10">
                    {/* Theme Toggle - Top Right */}
                    <div className="fixed top-4 right-4 z-50">
                        <ThemeToggle />
                    </div>

                    {/* Hero Section */}
                    <div className="container-custom section min-h-screen flex flex-col items-center justify-center text-center">
                        {/* Logo/Brand */}
                        <div className="mb-8 animate-scale-in">
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                                <span className="text-3xl">✨</span>
                                <span className="font-display text-2xl font-bold text-gradient">TripGenie</span>
                            </div>
                        </div>

                        {/* Headline */}
                        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
                            Discover Your Next
                            <br />
                            <span className="text-gradient">Weekend Adventure</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 animate-slide-up">
                            Find perfect 1-day and 2-day trips tailored to your budget, time, and interests.
                            Start exploring hidden gems near you.
                        </p>

                        {/* City Search */}
                        <div className="w-full mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <CitySearch />
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="card-glass p-6 text-center">
                                <div className="text-4xl mb-3">🎯</div>
                                <h3 className="font-semibold text-lg mb-2">Smart Filters</h3>
                                <p className="text-sm text-muted-foreground">
                                    Filter by budget, time, category, and transport mode
                                </p>
                            </div>

                            <div className="card-glass p-6 text-center">
                                <div className="text-4xl mb-3">💰</div>
                                <h3 className="font-semibold text-lg mb-2">Budget Friendly</h3>
                                <p className="text-sm text-muted-foreground">
                                    Find trips under ₹1,000 to ₹5,000 with cost breakdowns
                                </p>
                            </div>

                            <div className="card-glass p-6 text-center">
                                <div className="text-4xl mb-3">⚡</div>
                                <h3 className="font-semibold text-lg mb-2">Quick Getaways</h3>
                                <p className="text-sm text-muted-foreground">
                                    Destinations within 2-6 hours from your city
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center">
                            <div>
                                <div className="text-3xl font-bold text-gradient">150+</div>
                                <div className="text-sm text-muted-foreground mt-1">Destinations</div>
                            </div>
                            <div className="w-px h-12 bg-border" />
                            <div>
                                <div className="text-3xl font-bold text-gradient">6</div>
                                <div className="text-sm text-muted-foreground mt-1">Major Cities</div>
                            </div>
                            <div className="w-px h-12 bg-border" />
                            <div>
                                <div className="text-3xl font-bold text-gradient">8</div>
                                <div className="text-sm text-muted-foreground mt-1">Categories</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <div className="container-custom py-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">✨</span>
                                    <span className="font-display font-bold text-lg text-foreground">TripGenie</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    © 2024 TripGenie. Discover your next adventure.
                                </p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
