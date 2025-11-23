import { MetadataRoute } from 'next';
import { prisma } from '../lib/db';
import { getAllActiveCities } from '../lib/cities';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
        : 'https://tripgennie.in';

    // Get all active cities from database
    let cities: Array<{ id: number; slug: string }> = [];
    let destinations: Array<{ slug: string; cityId: number }> = [];

    try {
        // Fetch cities
        cities = await getAllActiveCities();

        // Get all active destinations from database
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
        console.error('Error fetching data for sitemap:', error);
        // Fallback to empty arrays if database is not available
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
    cities.forEach((city) => {
        routes.push({
            url: `${baseUrl}/${city.slug}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        });
    });

    // Destination pages
    destinations.forEach((dest) => {
        const city = cities.find(c => c.id === dest.cityId);
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

