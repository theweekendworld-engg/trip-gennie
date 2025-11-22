import { Metadata } from 'next';
import { CITIES } from '../../lib/constants';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://tripgenie.com';

export function generateCityMetadata(citySlug: string): Metadata {
    const city = CITIES.find(c => c.slug === citySlug);
    
    if (!city) {
        return {
            title: 'City Not Found | TripGenie',
            description: 'The requested city page could not be found.',
        };
    }

    return {
        title: `Weekend Trips from ${city.name} - Budget Getaways & Quick Escapes`,
        description: `Discover amazing 1-day and 2-day weekend trips from ${city.name}, ${city.state}. Find budget-friendly getaways (₹1,000-₹5,000) within 2-6 hours. Filter by hill stations, waterfalls, forts, temples, beaches, and more. Plan your perfect weekend adventure!`,
        keywords: [
            `weekend trips from ${city.name}`,
            `${city.name} weekend getaways`,
            `one day trips from ${city.name}`,
            `budget trips from ${city.name}`,
            `nearby places from ${city.name}`,
            `${city.name} road trips`,
            `weekend destinations from ${city.name}`,
            `${city.state} weekend trips`,
            'hill stations',
            'waterfalls',
            'forts',
            'temples',
            'adventure trips',
            'budget travel',
        ],
        openGraph: {
            title: `Weekend Trips from ${city.name} | TripGenie`,
            description: `Discover amazing weekend getaways from ${city.name}. Filter by budget, time, and interests.`,
            url: `${baseUrl}/${citySlug}`,
            siteName: 'TripGenie',
            locale: 'en_IN',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `Weekend Trips from ${city.name} | TripGenie`,
            description: `Discover amazing weekend getaways from ${city.name}.`,
        },
        alternates: {
            canonical: `${baseUrl}/${citySlug}`,
        },
    };
}

