'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CitySelector from '@/components/ui/CitySelector';
import { CITIES } from '@/lib/constants';

export default function HomePage() {
    const router = useRouter();
    const [selectedCity, setSelectedCity] = useState<number | undefined>();

    const handleCitySelect = (cityId: number) => {
        setSelectedCity(cityId);
        const city = CITIES.find(c => c.id === cityId);
        if (city) {
            router.push(`/${city.slug}`);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 gradient-mesh opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />

            {/* Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <div className="container-custom section min-h-screen flex flex-col items-center justify-center text-center">
                    {/* Logo/Brand */}
                    <div className="mb-8 animate-scale-in">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/20">
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

                    {/* City Selector */}
                    <div className="w-full max-w-md mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <CitySelector
                            selectedCity={selectedCity}
                            onCitySelect={handleCitySelect}
                        />
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
                <footer className="border-t bg-white/50 backdrop-blur-sm">
                    <div className="container-custom py-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">✨</span>
                                <span className="font-display font-bold text-lg">TripGenie</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                © 2024 TripGenie. Discover your next adventure.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
