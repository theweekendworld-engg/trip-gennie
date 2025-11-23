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

    // Validate referrer for security - restrict to your domain
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Allowed origins - your production domain and localhost for development
    const allowedOrigins = [
        'https://tripgennie.in',
        'https://www.tripgennie.in',
        'https://*.tripgennie.in', // For any subdomain
        process.env.NEXT_PUBLIC_BASE_URL,
        // Development
        'http://localhost:3000',
        'http://localhost:3001',
    ].filter(Boolean);

    // Check if request is from allowed origin
    const isValidOrigin = 
        // Allow same-origin requests (when host matches)
        (host && (host.includes('tripgennie.in') || host.includes('localhost'))) ||
        // Check origin header
        (origin && allowedOrigins.some(allowed => {
            // Handle wildcard subdomains
            if (allowed.includes('*.')) {
                const domain = allowed.replace('https://*.', '');
                return origin.includes(domain);
            }
            return origin.startsWith(allowed);
        })) ||
        // Check referer header
        (referer && allowedOrigins.some(allowed => {
            if (allowed.includes('*.')) {
                const domain = allowed.replace('https://*.', '');
                return referer.includes(domain);
            }
            return referer.startsWith(allowed);
        }));

    // In production, enforce strict origin checking
    if (process.env.NODE_ENV === 'production') {
        if (!isValidOrigin) {
            console.error('🚨 SECURITY: Google Maps API key requested from unauthorized origin:', {
                origin,
                referer,
                host,
            });
            return NextResponse.json(
                { error: 'Unauthorized origin' },
                { status: 403 }
            );
        }
    } else if (!isValidOrigin) {
        // In development, just warn
        console.warn('⚠️ Google Maps API key requested from unauthorized origin:', origin || referer);
    }

    return NextResponse.json({ apiKey });
}

