import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect admin routes (except login page)
    if (path.startsWith('/admin') && path !== '/admin') {
        const session = await auth();

        if (!session) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
