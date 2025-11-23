import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { SearchFilters } from '../../../types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filters: SearchFilters = await request.json();

        // Validate required fields
        if (!filters.cityId || typeof filters.cityId !== 'number') {
            return NextResponse.json(
                { success: false, error: 'Invalid cityId. City ID is required.' },
                { status: 400 }
            );
        }

        // Validate and sanitize filters
        const validatedFilters: SearchFilters = {
            cityId: filters.cityId,
        };

        // Validate budget filter
        if (filters.maxBudget !== undefined) {
            if (typeof filters.maxBudget !== 'number' || filters.maxBudget <= 0) {
                return NextResponse.json(
                    { success: false, error: 'Invalid maxBudget. Must be a positive number.' },
                    { status: 400 }
                );
            }
            validatedFilters.maxBudget = filters.maxBudget;
        }

        // Validate travel time filter
        if (filters.maxTravelTime !== undefined) {
            if (typeof filters.maxTravelTime !== 'number' || filters.maxTravelTime <= 0) {
                return NextResponse.json(
                    { success: false, error: 'Invalid maxTravelTime. Must be a positive number.' },
                    { status: 400 }
                );
            }
            validatedFilters.maxTravelTime = filters.maxTravelTime;
        }

        // Validate categories filter
        if (filters.categories !== undefined) {
            if (!Array.isArray(filters.categories)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid categories. Must be an array.' },
                    { status: 400 }
                );
            }
            // Filter out empty strings and invalid values
            const validCategories = filters.categories.filter(
                cat => typeof cat === 'string' && cat.trim().length > 0
            );
            if (validCategories.length > 0) {
                validatedFilters.categories = validCategories;
            }
        }

        // Validate transport modes filter
        if (filters.transportModes !== undefined) {
            if (!Array.isArray(filters.transportModes)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid transportModes. Must be an array.' },
                    { status: 400 }
                );
            }
            // Filter out empty strings and invalid values
            const validTransportModes = filters.transportModes.filter(
                mode => typeof mode === 'string' && mode.trim().length > 0
            );
            if (validTransportModes.length > 0) {
                validatedFilters.transportModes = validTransportModes;
            }
        }

        // Build query conditions
        const where: any = {
            cityId: validatedFilters.cityId,
            destination: {
                isActive: true,
            },
        };

        // Apply budget filter (check both fuel and transport costs)
        // Treat null as 0 to match frontend display
        if (validatedFilters.maxBudget) {
            where.OR = [
                { estimatedFuelCost: { lte: validatedFilters.maxBudget } },
                { estimatedTransportCost: { lte: validatedFilters.maxBudget } },
                { estimatedFuelCost: null },
                { estimatedTransportCost: null },
            ];
        }

        // Apply travel time filter
        if (validatedFilters.maxTravelTime) {
            where.travelTimeMinutes = { lte: validatedFilters.maxTravelTime };
        }

        // Apply category filter
        if (validatedFilters.categories && validatedFilters.categories.length > 0) {
            where.destination = {
                ...where.destination,
                category: { in: validatedFilters.categories },
            };
        }

        // Apply transport mode filter
        if (validatedFilters.transportModes && validatedFilters.transportModes.length > 0) {
            where.transportMode = { in: validatedFilters.transportModes };
        }

        // Get pagination parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Fetch results with pagination
        const [results, total] = await Promise.all([
            prisma.cityDestination.findMany({
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
                skip,
                take: limit,
            }),
            prisma.cityDestination.count({ where }),
        ]);

        // Group by destination to avoid duplicates (same destination with different transport modes)
        // Prefer driving over transit when both exist
        const uniqueDestinations = new Map<number, typeof results[0]>();

        for (const result of results) {
            const destId = result.destination.id;
            const existing = uniqueDestinations.get(destId);

            if (!existing) {
                uniqueDestinations.set(destId, result);
            } else {
                // Prefer driving over transit
                if (result.transportMode === 'driving' && existing.transportMode === 'transit') {
                    uniqueDestinations.set(destId, result);
                }
            }
        }

        // Transform to TripResult format
        const trips = Array.from(uniqueDestinations.values()).map((cd) => {
            // Get primary photo first, then fallback to any photo, then imageUrl
            const primaryPhoto = cd.destination.destinationPhotos.find(p => p.isPrimary);
            const anyPhoto = cd.destination.destinationPhotos[0];
            const imageUrl = primaryPhoto?.photoUrl || anyPhoto?.photoUrl || cd.destination.imageUrl;

            return {
                id: cd.destination.id,
                name: cd.destination.name,
                slug: cd.destination.slug,
                category: cd.destination.category,
                summary: cd.destination.aiEnhancedSummary || cd.destination.shortSummary,
                imageUrl: imageUrl,
                distanceKm: cd.distanceKm,
                travelTimeMinutes: cd.travelTimeMinutes,
                estimatedCost: cd.estimatedFuelCost || cd.estimatedTransportCost || 0,
                transportMode: cd.transportMode,
            };
        });

        return NextResponse.json({
            success: true,
            count: trips.length,
            total,
            trips,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to search trips' },
            { status: 500 }
        );
    }
}
