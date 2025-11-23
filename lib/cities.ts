import { prisma } from './db';

export async function getCityBySlug(slug: string) {
    if (!slug || typeof slug !== 'string') {
        return null;
    }

    try {
        // First find by unique slug, then verify isActive
        // This is more efficient than findFirst with both conditions
        const city = await prisma.city.findUnique({
            where: {
                slug: slug,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                state: true,
                latitude: true,
                longitude: true,
                isActive: true,
            },
        });
        
        // Return null if city doesn't exist or is not active
        return city && city.isActive ? {
            id: city.id,
            name: city.name,
            slug: city.slug,
            state: city.state,
            latitude: city.latitude,
            longitude: city.longitude,
        } : null;
    } catch (error) {
        console.error('Error fetching city by slug:', error);
        return null;
    }
}

export async function getAllActiveCities() {
    try {
        const cities = await prisma.city.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                state: true,
                latitude: true,
                longitude: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return cities;
    } catch (error) {
        console.error('Error fetching all cities:', error);
        return [];
    }
}

