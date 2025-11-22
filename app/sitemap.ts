import { MetadataRoute } from 'next';
import { prisma } from '../lib/db';
import { CITIES } from '../lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'https://tripgenie.com';
    
    // Get all active destinations from database
    let destinations: Array<{ slug: string; cityId: number }> = [];
    
    try {
        const cityDestinations = await prisma.cityDestination.findMany({
            where: {
                destination: {
                    isActive: true,
                },
            },
            select: {
                destination: {
                    select: {
                        slug: true,
                    },
                },
                cityId: true,
            },
            distinct: ['destinationId'],
        });

        destinations = cityDestinations.map(cd => ({
            slug: cd.destination.slug,
            cityId: cd.cityId,
        }));
    } catch (error) {
        console.error('Error fetching destinations for sitemap:', error);
        // Fallback to empty array if database is not available
        // This ensures the sitemap still works with at least city pages
    }

    // Homepage
    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
    ];

    // City pages
    CITIES.forEach((city) => {
        routes.push({
            url: `${baseUrl}/${city.slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        });
    });

    // Destination pages
    destinations.forEach((dest) => {
        const city = CITIES.find(c => c.id === dest.cityId);
        if (city) {
            routes.push({
                url: `${baseUrl}/${city.slug}/${dest.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        }
    });

    return routes;
}

