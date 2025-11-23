import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get stats
        const [totalCities, totalDestinations, totalVisits, todayVisits] = await Promise.all([
            prisma.city.count({ where: { isActive: true } }),
            prisma.destination.count({ where: { isActive: true } }),
            prisma.analyticsEvent.count({ where: { eventType: 'page_view' } }),
            prisma.analyticsEvent.count({
                where: {
                    eventType: 'page_view',
                    timestamp: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalCities,
                totalDestinations,
                totalVisits,
                todayVisits,
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
