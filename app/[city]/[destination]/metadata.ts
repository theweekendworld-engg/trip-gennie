import { Metadata } from 'next';
import { CITIES } from '../../../lib/constants';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://tripgenie.com';

export function generateDestinationMetadata(
    citySlug: string,
    destinationSlug: string,
    destination: {
        name: string;
        category: string;
        shortSummary: string;
        aiEnhancedSummary?: string;
        distanceKm: number;
        travelTimeMinutes: number;
        estimatedCost: number;
        imageUrl?: string;
    }
): Metadata {
    const city = CITIES.find(c => c.slug === citySlug);
    const cityName = city?.name || citySlug;
    
    const categoryLabels: Record<string, string> = {
        hill: 'Hill Station',
        lake: 'Lake',
        waterfall: 'Waterfall',
        fort: 'Fort',
        temple: 'Temple',
        adventure: 'Adventure Destination',
        beach: 'Beach',
        wildlife: 'Wildlife Sanctuary',
    };

    const categoryLabel = categoryLabels[destination.category] || 'Destination';
    const summary = destination.aiEnhancedSummary || destination.shortSummary;
    const travelTime = Math.round(destination.travelTimeMinutes / 60);

    return {
        title: `${destination.name} - Weekend Trip from ${cityName} | ${categoryLabel} Guide`,
        description: `${destination.name} is a perfect ${categoryLabel.toLowerCase()} for a weekend trip from ${cityName}. ${summary.substring(0, 120)}... Distance: ${destination.distanceKm}km, Travel time: ${travelTime} hours, Budget: ${destination.estimatedCost > 0 ? `₹${destination.estimatedCost}` : 'Budget-friendly'}.`,
        keywords: [
            `${destination.name} from ${cityName}`,
            `${destination.name} weekend trip`,
            `${destination.name} ${cityName}`,
            `${categoryLabel.toLowerCase()} near ${cityName}`,
            `how to reach ${destination.name}`,
            `${destination.name} travel guide`,
            `${destination.name} budget`,
            `${cityName} to ${destination.name}`,
            `weekend trip to ${destination.name}`,
            `${destination.name} ${cityName} distance`,
        ],
        openGraph: {
            title: `${destination.name} - Weekend Trip from ${cityName} | TripGenie`,
            description: `${summary.substring(0, 160)}...`,
            url: `${baseUrl}/${citySlug}/${destinationSlug}`,
            siteName: 'TripGenie',
            locale: 'en_IN',
            type: 'article',
            images: destination.imageUrl ? [
                {
                    url: destination.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${destination.name} - Weekend trip from ${cityName}`,
                },
            ] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${destination.name} - Weekend Trip from ${cityName}`,
            description: `${summary.substring(0, 160)}...`,
            images: destination.imageUrl ? [destination.imageUrl] : [],
        },
        alternates: {
            canonical: `${baseUrl}/${citySlug}/${destinationSlug}`,
        },
        other: {
            'article:author': 'TripGenie',
            'article:section': categoryLabel,
        },
    };
}

