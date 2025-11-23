import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/db';

export const runtime = 'nodejs';

// GET - List all cities
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { state: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const [cities, total] = await Promise.all([
            prisma.city.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { cityDestinations: true },
                    },
                },
            }),
            prisma.city.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            cities,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching cities:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cities' },
            { status: 500 }
        );
    }
}

// POST - Create new city
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, state, latitude, longitude } = body;

        if (!name || !slug || !state || !latitude || !longitude) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const city = await prisma.city.create({
            data: {
                name,
                slug,
                state,
                latitude,
                longitude,
            },
        });

        return NextResponse.json({ success: true, city });
    } catch (error: any) {
        console.error('Error creating city:', error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'City with this name or slug already exists' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to create city' },
            { status: 500 }
        );
    }
}

// PUT - Update city
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, slug, state, latitude, longitude, isActive } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'City ID is required' },
                { status: 400 }
            );
        }

        const city = await prisma.city.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(state && { state }),
                ...(latitude && { latitude }),
                ...(longitude && { longitude }),
                ...(typeof isActive === 'boolean' && { isActive }),
            },
        });

        return NextResponse.json({ success: true, city });
    } catch (error) {
        console.error('Error updating city:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update city' },
            { status: 500 }
        );
    }
}

// DELETE - Delete city
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id') || '0');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'City ID is required' },
                { status: 400 }
            );
        }

        await prisma.city.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting city:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete city' },
            { status: 500 }
        );
    }
}
