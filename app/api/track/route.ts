import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import crypto from 'crypto';

export const runtime = 'nodejs';

// Rate limiting map (in-memory, simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex');
}

function checkRateLimit(ipHash: string): boolean {
    const now = Date.now();
    const limit = rateLimitMap.get(ipHash);

    if (!limit || now > limit.resetTime) {
        rateLimitMap.set(ipHash, { count: 1, resetTime: now + 60000 }); // 1 minute window
        return true;
    }

    if (limit.count >= 60) { // 60 requests per minute
        return false;
    }

    limit.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventType, page, cityId, destinationId, metadata } = body;

        if (!eventType) {
            return NextResponse.json(
                { success: false, error: 'Event type is required' },
                { status: 400 }
            );
        }

        // Get IP and hash it for privacy
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const ipHash = hashIP(ip);

        // Rate limiting
        if (!checkRateLimit(ipHash)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded' },
                { status: 429 }
            );
        }

        // Get user agent
        const userAgent = request.headers.get('user-agent') || undefined;

        // Create analytics event
        await prisma.analyticsEvent.create({
            data: {
                eventType,
                page: page || undefined,
                cityId: cityId || undefined,
                destinationId: destinationId || undefined,
                userAgent,
                ipHash,
                metadata: metadata || undefined,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking event:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to track event' },
            { status: 500 }
        );
    }
}
