import { PrismaClient } from '@prisma/client';
import { CITIES, FUEL_COST_PER_KM } from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...\n');

    // 1. Seed Cities
    console.log('📍 Seeding cities...');
    const cityData = [
        { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
        { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
        { name: 'Pune', slug: 'pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
        { name: 'Delhi', slug: 'delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
        { name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
        { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
    ];

    for (const city of cityData) {
        await prisma.city.upsert({
            where: { slug: city.slug },
            update: city,
            create: city,
        });
    }
    console.log(`✅ Seeded ${cityData.length} cities\n`);

    // 2. Seed Sample Destinations (Bengaluru)
    console.log('🏞️ Seeding sample destinations...');
    const destinations = [
        {
            name: 'Nandi Hills',
            slug: 'nandi-hills',
            latitude: 13.3703,
            longitude: 77.6838,
            category: 'hill',
            shortSummary: 'Ancient hill fortress with stunning sunrise views, pleasant climate, and historical significance. Perfect for a quick weekend getaway.',
            bestMonths: 'October-February',
            imageUrl: '/images/nandi-hills.jpg',
        },
        {
            name: 'Mysore Palace',
            slug: 'mysore-palace',
            latitude: 12.3052,
            longitude: 76.6551,
            category: 'fort',
            shortSummary: 'Magnificent royal palace showcasing Indo-Saracenic architecture, rich history, and cultural heritage of Karnataka.',
            bestMonths: 'October-March',
            imageUrl: '/images/mysore-palace.jpg',
        },
        {
            name: 'Coorg',
            slug: 'coorg',
            latitude: 12.3375,
            longitude: 75.8069,
            category: 'hill',
            shortSummary: 'Scotland of India with lush coffee plantations, misty hills, waterfalls, and pleasant weather year-round.',
            bestMonths: 'October-March',
            imageUrl: '/images/coorg.jpg',
        },
        {
            name: 'Shivanasamudra Falls',
            slug: 'shivanasamudra-falls',
            latitude: 12.2969,
            longitude: 77.1786,
            category: 'waterfall',
            shortSummary: 'Spectacular twin waterfalls on the Kaveri river, offering breathtaking views and natural beauty.',
            bestMonths: 'July-February',
            imageUrl: '/images/shivanasamudra.jpg',
        },
        {
            name: 'Skandagiri',
            slug: 'skandagiri',
            latitude: 13.3990,
            longitude: 77.6780,
            category: 'adventure',
            shortSummary: 'Popular night trek destination with ancient fort ruins and mesmerizing sunrise views from the peak.',
            bestMonths: 'November-February',
            imageUrl: '/images/skandagiri.jpg',
        },
    ];

    for (const dest of destinations) {
        await prisma.destination.upsert({
            where: { slug: dest.slug },
            update: dest,
            create: dest,
        });
    }
    console.log(`✅ Seeded ${destinations.length} sample destinations\n`);

    // 3. Create City-Destination relationships for Bengaluru
    console.log('🔗 Creating city-destination relationships...');
    const bengaluru = await prisma.city.findUnique({ where: { slug: 'bengaluru' } });

    if (bengaluru) {
        const relationships = [
            { destSlug: 'nandi-hills', distanceKm: 60, travelTime: 90, mode: 'car' },
            { destSlug: 'nandi-hills', distanceKm: 60, travelTime: 120, mode: 'bus' },
            { destSlug: 'mysore-palace', distanceKm: 145, travelTime: 180, mode: 'car' },
            { destSlug: 'mysore-palace', distanceKm: 145, travelTime: 210, mode: 'bus' },
            { destSlug: 'coorg', distanceKm: 265, travelTime: 330, mode: 'car' },
            { destSlug: 'shivanasamudra-falls', distanceKm: 135, travelTime: 165, mode: 'car' },
            { destSlug: 'skandagiri', distanceKm: 62, travelTime: 95, mode: 'car' },
        ];

        for (const rel of relationships) {
            const destination = await prisma.destination.findUnique({ where: { slug: rel.destSlug } });
            if (destination) {
                const fuelCost = rel.mode === 'car' ? rel.distanceKm * 2 * FUEL_COST_PER_KM.car : null;
                const transportCost = rel.mode === 'bus' ? Math.round(rel.distanceKm * 2 * 1.5) : null;

                await prisma.cityDestination.upsert({
                    where: {
                        cityId_destinationId_transportMode: {
                            cityId: bengaluru.id,
                            destinationId: destination.id,
                            transportMode: rel.mode,
                        },
                    },
                    update: {
                        distanceKm: rel.distanceKm,
                        travelTimeMinutes: rel.travelTime,
                        estimatedFuelCost: fuelCost,
                        estimatedTransportCost: transportCost,
                    },
                    create: {
                        cityId: bengaluru.id,
                        destinationId: destination.id,
                        distanceKm: rel.distanceKm,
                        travelTimeMinutes: rel.travelTime,
                        transportMode: rel.mode,
                        estimatedFuelCost: fuelCost,
                        estimatedTransportCost: transportCost,
                        routeQuality: 'good',
                    },
                });
            }
        }
        console.log(`✅ Created ${relationships.length} city-destination relationships\n`);
    }

    console.log('✨ Database seeding completed!\n');
    console.log('📝 Next steps:');
    console.log('   1. Set up Google Maps API key in .env.local');
    console.log('   2. Run the full data seeding script to populate all destinations');
    console.log('   3. Start the development server: npm run dev\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
