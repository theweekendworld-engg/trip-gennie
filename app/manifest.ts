import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'TripGenie - Discover Amazing Weekend Getaways',
        short_name: 'TripGenie',
        description: 'Find perfect 1-day and 2-day trips from your city. Filter by budget, time, and interests. Discover hidden gems near Bengaluru, Mumbai, Pune, Delhi, Chennai, and Hyderabad.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#6366F1',
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    };
}

