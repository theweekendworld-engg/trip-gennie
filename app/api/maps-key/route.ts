import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
        return NextResponse.json(
            { error: 'Google Maps API key not configured' },
            { status: 500 }
        );
    }

    // Optional: Validate referrer for extra security
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Allow requests from same origin or localhost in development
    const allowedOrigins = [
        process.env.NEXT_PUBLIC_BASE_URL,
        `https://${host}`,
        `http://${host}`,
        'http://localhost:3000',
        'http://localhost:3001',
    ].filter(Boolean);

    const isValidOrigin = !origin || allowedOrigins.some(allowed => 
        origin.startsWith(allowed) || 
        (referer && referer.startsWith(allowed))
    );

    // In production, you might want to enforce this more strictly
    // For now, we'll allow it but log if there's a mismatch
    if (process.env.NODE_ENV === 'production' && !isValidOrigin) {
        console.warn('Google Maps API key requested from unauthorized origin:', origin || referer);
    }

    return NextResponse.json({ apiKey });
}

