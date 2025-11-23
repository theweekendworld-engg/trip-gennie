import { Metadata } from 'next';
import { generateDestinationMetadata } from './metadata';
import { prisma } from '../../../lib/db';
import { getCityBySlug } from '../../../lib/cities';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ city: string; destination: string }>
}): Promise<Metadata> {
    try {
        const { city: citySlug, destination: destinationSlug } = await params;
        
        if (!citySlug || !destinationSlug) {
            return {
                title: 'Destination Not Found | TripGenie',
            };
        }
        
        const city = await getCityBySlug(citySlug);
        if (!city) {
            return {
                title: 'Destination Not Found | TripGenie',
            };
        }

        const cityDestination = await prisma.cityDestination.findFirst({
            where: {
                cityId: city.id,
                destination: {
                    slug: destinationSlug,
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
            citySlug,
            destinationSlug,
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

