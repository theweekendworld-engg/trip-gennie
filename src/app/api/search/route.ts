import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SearchFilters } from '@/types';

export async function POST(request: Request) {
    try {
        const filters: SearchFilters = await request.json();

        // Build query conditions
        const where: any = {
            cityId: filters.cityId,
            destination: {
                isActive: true,
            },
        };

        if (filters.maxBudget) {
            where.OR = [
                { estimatedFuelCost: { lte: filters.maxBudget } },
                { estimatedTransportCost: { lte: filters.maxBudget } },
            ];
        }

        if (filters.maxTravelTime) {
            where.travelTimeMinutes = { lte: filters.maxTravelTime };
        }

        if (filters.categories && filters.categories.length > 0) {
            where.destination = {
                ...where.destination,
                category: { in: filters.categories },
            };
        }

        if (filters.transportModes && filters.transportModes.length > 0) {
            where.transportMode = { in: filters.transportModes };
        }

        // Fetch results
        const results = await prisma.cityDestination.findMany({
            where,
            include: {
                destination: {
                    include: {
                        destinationPhotos: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: {
                distanceKm: 'asc',
            },
            take: 50,
        });

        // Transform to TripResult format
        const trips = results.map((cd) => ({
            id: cd.destination.id,
            name: cd.destination.name,
            slug: cd.destination.slug,
            category: cd.destination.category,
            summary: cd.destination.aiEnhancedSummary || cd.destination.shortSummary,
            imageUrl: cd.destination.destinationPhotos[0]?.photoUrl || cd.destination.imageUrl,
            distanceKm: cd.distanceKm,
            travelTimeMinutes: cd.travelTimeMinutes,
            estimatedCost: cd.estimatedFuelCost || cd.estimatedTransportCost || 0,
            transportMode: cd.transportMode,
        }));

        return NextResponse.json({
            success: true,
            count: trips.length,
            trips,
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to search trips' },
            { status: 500 }
        );
    }
}
