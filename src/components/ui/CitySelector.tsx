'use client';

import { useState } from 'react';
import { CITIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CitySelectorProps {
    selectedCity?: number;
    onCitySelect: (cityId: number) => void;
    className?: string;
}

export default function CitySelector({ selectedCity, onCitySelect, className }: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const selected = CITIES.find(c => c.id === selectedCity);

    return (
        <div className={cn('relative', className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full flex items-center justify-between gap-3',
                    'px-6 py-4 rounded-xl border-2 transition-all duration-200',
                    'bg-white hover:bg-gray-50',
                    isOpen ? 'border-primary-500 ring-4 ring-primary-100' : 'border-gray-200 hover:border-primary-300'
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                        {selected ? selected.name[0] : '?'}
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-muted-foreground font-medium">Starting from</div>
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
                        <div className="glass rounded-xl shadow-xl border overflow-hidden">
                            {CITIES.map((city) => (
                                <button
                                    key={city.id}
                                    onClick={() => {
                                        onCitySelect(city.id);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-6 py-4 transition-all duration-200',
                                        'hover:bg-primary-50 border-b border-gray-100 last:border-0',
                                        selectedCity === city.id && 'bg-primary-50'
                                    )}
                                >
                                    <div className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                                        selectedCity === city.id
                                            ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                    )}>
                                        {city.name[0]}
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-foreground">{city.name}</div>
                                        <div className="text-sm text-muted-foreground">{city.state}</div>
                                    </div>
                                    {selectedCity === city.id && (
                                        <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
