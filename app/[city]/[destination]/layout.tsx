import { Metadata } from 'next';
import { generateDestinationMetadata } from './metadata';
import { prisma } from '../../../lib/db';
import { CITIES } from '../../../lib/constants';

export async function generateMetadata({ 
    params 
}: { 
    params: { city: string; destination: string } 
}): Promise<Metadata> {
    try {
        const city = CITIES.find(c => c.slug === params.city);
        if (!city) {
            return {
                title: 'Destination Not Found | TripGenie',
            };
        }

        const cityDestination = await prisma.cityDestination.findFirst({
            where: {
                cityId: city.id,
                destination: {
                    slug: params.destination,
                    isActive: true,
                },
            },
            include: {
                destination: true,
            },
        });

        if (!cityDestination) {
            return {
                title: 'Destination Not Found | TripGenie',
            };
        }

        return generateDestinationMetadata(
            params.city,
            params.destination,
            {
                name: cityDestination.destination.name,
                category: cityDestination.destination.category,
                shortSummary: cityDestination.destination.shortSummary,
                aiEnhancedSummary: cityDestination.destination.aiEnhancedSummary || undefined,
                distanceKm: cityDestination.distanceKm,
                travelTimeMinutes: cityDestination.travelTimeMinutes,
                estimatedCost: cityDestination.estimatedFuelCost || cityDestination.estimatedTransportCost || 0,
                imageUrl: cityDestination.destination.imageUrl || undefined,
            }
        );
    } catch (error) {
        console.error('Error generating destination metadata:', error);
        return {
            title: 'Destination | TripGenie',
        };
    }
}

export default function DestinationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

