import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { CITIES } from '../../../lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { citySlug, destinationSlug } = await request.json();

        if (!citySlug || !destinationSlug) {
            return NextResponse.json(
                { success: false, error: 'City slug and destination slug are required.' },
                { status: 400 }
            );
        }

        const city = CITIES.find(c => c.slug === citySlug);
        if (!city) {
            return NextResponse.json(
                { success: false, error: 'City not found.' },
                { status: 404 }
            );
        }

        // Fetch city from database to get coordinates
        const cityData = await prisma.city.findUnique({
            where: { id: city.id },
            select: { latitude: true, longitude: true },
        });

        // Find the destination with city-destination relationship
        const cityDestination = await prisma.cityDestination.findFirst({
            where: {
                cityId: city.id,
                destination: {
                    slug: destinationSlug,
                    isActive: true,
                },
            },
            include: {
                destination: {
                    include: {
                        destinationPhotos: {
                            orderBy: { isPrimary: 'desc' },
                            take: 10,
                        },
                    },
                },
            },
        });

        if (!cityDestination) {
            return NextResponse.json(
                { success: false, error: 'Destination not found.' },
                { status: 404 }
            );
        }

        const dest = cityDestination.destination;

        // Transform to response format
        const destination = {
            id: dest.id,
            name: dest.name,
            slug: dest.slug,
            category: dest.category,
            shortSummary: dest.shortSummary,
            aiEnhancedSummary: dest.aiEnhancedSummary,
            bestMonths: dest.bestMonths,
            imageUrl: dest.imageUrl,
            latitude: Number(dest.latitude),
            longitude: Number(dest.longitude),
            distanceKm: cityDestination.distanceKm,
            travelTimeMinutes: cityDestination.travelTimeMinutes,
            estimatedCost: cityDestination.estimatedFuelCost || cityDestination.estimatedTransportCost || 0,
            transportMode: cityDestination.transportMode,
            destinationPhotos: dest.destinationPhotos.map(photo => ({
                photoUrl: photo.photoUrl,
            })),
        };

        return NextResponse.json({
            success: true,
            destination,
            city: cityData ? {
                name: city.name,
                latitude: cityData.latitude,
                longitude: cityData.longitude,
            } : null,
        });
    } catch (error) {
        console.error('Destination API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch destination' },
            { status: 500 }
        );
    }
}

