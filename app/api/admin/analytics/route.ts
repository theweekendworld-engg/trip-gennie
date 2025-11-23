import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/db';

export const runtime = 'nodejs';

/**
 * Recursively convert BigInt values to numbers for JSON serialization
 */
function convertBigIntToNumber(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (typeof obj === 'bigint') {
        return Number(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(convertBigIntToNumber);
    }
    
    if (typeof obj === 'object') {
        const converted: any = {};
        for (const [key, value] of Object.entries(obj)) {
            converted[key] = convertBigIntToNumber(value);
        }
        return converted;
    }
    
    return obj;
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get visit trends
        const visitTrends = await prisma.$queryRaw`
            SELECT 
                DATE(timestamp)::text as date,
                COUNT(*)::bigint as count
            FROM analytics_events
            WHERE event_type = 'page_view'
            AND timestamp >= ${startDate}
            GROUP BY DATE(timestamp)
            ORDER BY date ASC
        `;

        // Get top destinations (using page_view events that have destination_id)
        const topDestinations = await prisma.$queryRaw`
            SELECT 
                d.id,
                d.name,
                COUNT(ae.id) as views
            FROM destinations d
            LEFT JOIN analytics_events ae ON ae.destination_id = d.id
                AND ae.event_type = 'page_view'
                AND ae.timestamp >= ${startDate}
            GROUP BY d.id, d.name
            ORDER BY views DESC
            LIMIT 10
        `;

        // Get top cities
        const topCities = await prisma.$queryRaw`
            SELECT 
                c.id,
                c.name,
                COUNT(ae.id) as views
            FROM cities c
            LEFT JOIN analytics_events ae ON ae.city_id = c.id
            WHERE ae.event_type = 'page_view'
            AND ae.timestamp >= ${startDate}
            GROUP BY c.id, c.name
            ORDER BY views DESC
            LIMIT 10
        `;

        // Get category distribution
        const categoryStats = await prisma.destination.groupBy({
            by: ['category'],
            _count: true,
        });

        // Convert BigInt values to numbers for JSON serialization
        const convertedData = {
            visitTrends: convertBigIntToNumber(visitTrends),
            topDestinations: convertBigIntToNumber(topDestinations),
            topCities: convertBigIntToNumber(topCities),
            categoryStats: convertBigIntToNumber(categoryStats),
        };

        return NextResponse.json({
            success: true,
            data: convertedData,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
