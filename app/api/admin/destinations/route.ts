import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/db';
import { createAuditLog } from '../../../../lib/audit';

export const runtime = 'nodejs';

// GET - List destinations with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const cityId = searchParams.get('cityId');
        const category = searchParams.get('category');

        const where: any = {};

        if (search) {
            where.name = { contains: search, mode: 'insensitive' as const };
        }

        if (category) {
            where.category = category;
        }

        const [destinations, total] = await Promise.all([
            prisma.destination.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    cityDestinations: {
                        include: {
                            city: {
                                select: { id: true, name: true, slug: true },
                            },
                        },
                        take: 1,
                    },
                },
            }),
            prisma.destination.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            destinations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching destinations:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch destinations' },
            { status: 500 }
        );
    }
}

// PUT - Update destination
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, category, shortSummary, aiEnhancedSummary, imageUrl, isActive } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Destination ID is required' },
                { status: 400 }
            );
        }

        // Get admin user
        const adminUser = await prisma.adminUser.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser) {
            return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
        }

        // Get old values for audit
        const oldDestination = await prisma.destination.findUnique({ where: { id } });

        const destination = await prisma.destination.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(category && { category }),
                ...(shortSummary && { shortSummary }),
                ...(aiEnhancedSummary !== undefined && { aiEnhancedSummary }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(typeof isActive === 'boolean' && { isActive }),
            },
        });

        // Create audit log
        await createAuditLog(
            adminUser.id,
            'update_destination',
            'destination',
            id,
            { before: oldDestination, after: destination },
            request
        );

        return NextResponse.json({ success: true, destination });
    } catch (error) {
        console.error('Error updating destination:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update destination' },
            { status: 500 }
        );
    }
}

// POST - Create new destination
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, latitude, longitude, category, shortSummary, imageUrl, cityId } = body;

        if (!name || !slug || !latitude || !longitude || !category || !shortSummary || !cityId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get admin user
        const adminUser = await prisma.adminUser.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser) {
            return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
        }

        // Create destination
        const destination = await prisma.destination.create({
            data: {
                name,
                slug,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                category,
                shortSummary,
                imageUrl,
                isActive: true,
            },
        });

        // Create city-destination relationship
        await prisma.cityDestination.create({
            data: {
                cityId: parseInt(cityId),
                destinationId: destination.id,
                distanceKm: 0, // Will need to be calculated
                travelTimeMinutes: 0,
                transportMode: 'car',
            },
        });

        // Create audit log
        await createAuditLog(
            adminUser.id,
            'create_destination',
            'destination',
            destination.id,
            { destination },
            request
        );

        return NextResponse.json({ success: true, destination });
    } catch (error: any) {
        console.error('Error creating destination:', error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'Destination with this slug already exists' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to create destination' },
            { status: 500 }
        );
    }
}

// DELETE - Delete destination(s)
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const idsParam = searchParams.get('ids');

        if (!idsParam) {
            return NextResponse.json(
                { success: false, error: 'Destination IDs are required' },
                { status: 400 }
            );
        }

        const ids = idsParam.split(',').map(id => parseInt(id));

        // Get admin user
        const adminUser = await prisma.adminUser.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser) {
            return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
        }

        // Delete destinations
        await prisma.destination.deleteMany({
            where: { id: { in: ids } },
        });

        // Create audit log
        await createAuditLog(
            adminUser.id,
            'delete_destinations',
            'destination',
            undefined,
            { deletedIds: ids },
            request
        );

        return NextResponse.json({ success: true, deletedCount: ids.length });
    } catch (error) {
        console.error('Error deleting destinations:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete destinations' },
            { status: 500 }
        );
    }
}

// PATCH - Bulk update destinations (e.g., bulk status change)
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { ids, updates } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Destination IDs are required' },
                { status: 400 }
            );
        }

        // Get admin user
        const adminUser = await prisma.adminUser.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser) {
            return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
        }

        // Bulk update
        const result = await prisma.destination.updateMany({
            where: { id: { in: ids.map((id: string) => parseInt(id)) } },
            data: updates,
        });

        // Create audit log
        await createAuditLog(
            adminUser.id,
            'bulk_update_destinations',
            'destination',
            undefined,
            { ids, updates, count: result.count },
            request
        );

        return NextResponse.json({ success: true, updatedCount: result.count });
    } catch (error) {
        console.error('Error bulk updating destinations:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to bulk update destinations' },
            { status: 500 }
        );
    }
}
