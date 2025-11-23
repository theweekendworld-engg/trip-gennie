'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useAnalytics() {
    const pathname = usePathname();

    // Track page views
    useEffect(() => {
        trackPageView(pathname);
    }, [pathname]);

    const trackPageView = async (page: string) => {
        try {
            await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'page_view',
                    page,
                }),
            });
        } catch (error) {
            // Silently fail - don't disrupt user experience
            console.debug('Analytics tracking failed:', error);
        }
    };

    const trackEvent = async (
        eventType: string,
        metadata?: Record<string, any>
    ) => {
        try {
            await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType,
                    page: pathname,
                    ...metadata,
                }),
            });
        } catch (error) {
            console.debug('Analytics tracking failed:', error);
        }
    };

    const trackSearch = async (filters: any) => {
        await trackEvent('search', { metadata: { filters } });
    };

    const trackDestinationClick = async (destinationId: number, cityId: number) => {
        await trackEvent('destination_click', { destinationId, cityId });
    };

    return {
        trackEvent,
        trackSearch,
        trackDestinationClick,
    };
}
