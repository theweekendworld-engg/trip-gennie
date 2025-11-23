import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { prisma } from '../../../../lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const action = searchParams.get('action') || '';
        const entityType = searchParams.get('entityType') || '';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where: any = {};

        if (action) {
            where.action = { contains: action, mode: 'insensitive' as const };
        }

        if (entityType) {
            where.entityType = entityType;
        }

        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) {
                where.timestamp.gte = new Date(startDate);
            }
            if (endDate) {
                where.timestamp.lte = new Date(endDate);
            }
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { timestamp: 'desc' },
                include: {
                    adminUser: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.auditLog.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch audit logs' },
            { status: 500 }
        );
    }
}

