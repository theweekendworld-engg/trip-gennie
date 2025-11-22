import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { CITIES, FUEL_COST_PER_KM } from '../lib/constants';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
            aiEnhancedSummary: 'Nandi Hills, also known as Nandidurg, is a popular weekend destination located 60km from Bengaluru. This ancient hill fortress stands at 1,478 meters above sea level and offers breathtaking panoramic views of the surrounding landscape. The hill is famous for its spectacular sunrise views, which attract thousands of visitors every weekend. With its pleasant climate, historical temples, and well-maintained gardens, Nandi Hills provides the perfect escape from city life.',
            bestMonths: 'October-February',
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80',
        },
        {
            name: 'Mysore Palace',
            slug: 'mysore-palace',
            latitude: 12.3052,
            longitude: 76.6551,
            category: 'fort',
            shortSummary: 'Magnificent royal palace showcasing Indo-Saracenic architecture, rich history, and cultural heritage of Karnataka.',
            aiEnhancedSummary: 'Mysore Palace, also known as Amba Vilas Palace, is one of India\'s most magnificent royal residences. This architectural marvel showcases a blend of Hindu, Muslim, Rajput, and Gothic styles. The palace is illuminated with nearly 100,000 light bulbs during the Dasara festival, creating a spectacular sight. Visitors can explore the opulent Durbar Hall, royal portraits, and the palace museum that houses artifacts from the Wodeyar dynasty.',
            bestMonths: 'October-March',
            imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80',
        },
        {
            name: 'Coorg',
            slug: 'coorg',
            latitude: 12.3375,
            longitude: 75.8069,
            category: 'hill',
            shortSummary: 'Scotland of India with lush coffee plantations, misty hills, waterfalls, and pleasant weather year-round.',
            aiEnhancedSummary: 'Coorg, officially known as Kodagu, is often called the "Scotland of India" due to its misty hills, lush greenery, and pleasant climate. This hill station is famous for its sprawling coffee plantations, aromatic spices, and stunning natural beauty. Visitors can explore waterfalls like Abbey Falls, trek through dense forests, visit coffee estates, and experience the unique Kodava culture. The region is also home to several wildlife sanctuaries and offers excellent opportunities for adventure activities.',
            bestMonths: 'October-March',
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80',
        },
        {
            name: 'Shivanasamudra Falls',
            slug: 'shivanasamudra-falls',
            latitude: 12.2969,
            longitude: 77.1786,
            category: 'waterfall',
            shortSummary: 'Spectacular twin waterfalls on the Kaveri river, offering breathtaking views and natural beauty.',
            aiEnhancedSummary: 'Shivanasamudra Falls is a spectacular waterfall located on the Kaveri River, creating two beautiful cascades - Gaganachukki and Barachukki. These falls are among the most powerful waterfalls in India, especially during the monsoon season. The surrounding area offers excellent viewpoints, and visitors can enjoy the thunderous sound of water crashing down the rocks. The falls are surrounded by lush greenery and provide a perfect setting for photography and nature appreciation.',
            bestMonths: 'July-February',
            imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80',
        },
        {
            name: 'Skandagiri',
            slug: 'skandagiri',
            latitude: 13.3990,
            longitude: 77.6780,
            category: 'adventure',
            shortSummary: 'Popular night trek destination with ancient fort ruins and mesmerizing sunrise views from the peak.',
            aiEnhancedSummary: 'Skandagiri, also known as Kalavara Durga, is a popular trekking destination located 62km from Bengaluru. This hill is famous for its night treks that lead to spectacular sunrise views from the summit. The trek takes you through ancient fort ruins and offers panoramic views of the surrounding countryside. At 1,450 meters above sea level, the peak provides a challenging yet rewarding experience for adventure enthusiasts. The early morning trek is particularly popular as it allows trekkers to witness a breathtaking sunrise.',
            bestMonths: 'November-February',
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80',
        },
    ];

    for (const dest of destinations) {
        const created = await prisma.destination.upsert({
            where: { slug: dest.slug },
            update: dest,
            create: dest,
        });

        // Add destination photos
        if (dest.imageUrl) {
            // Delete existing primary photo if any
            await prisma.destinationPhoto.deleteMany({
                where: {
                    destinationId: created.id,
                    isPrimary: true,
                },
            });

            // Create new primary photo
            await prisma.destinationPhoto.create({
                data: {
                    destinationId: created.id,
                    photoUrl: dest.imageUrl,
                    isPrimary: true,
                    photoReference: `seed-${dest.slug}-primary`,
                },
            });
        }
    }
    console.log(`✅ Seeded ${destinations.length} sample destinations with images\n`);

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
