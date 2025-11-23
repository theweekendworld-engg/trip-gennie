import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const whereClause: any = {
            isActive: true,
        };

        // Add search filter if provided
        if (search && search.trim()) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { state: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        const cities = await prisma.city.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                slug: true,
                state: true,
                latitude: true,
                longitude: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({
            success: true,
            cities: cities.map(city => ({
                id: city.id,
                name: city.name,
                slug: city.slug,
                state: city.state,
                latitude: city.latitude,
                longitude: city.longitude,
            })),
        });
    } catch (error) {
        console.error('Cities API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cities' },
            { status: 500 }
        );
    }
}
