import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { citySlug, destinationSlug } = await request.json();

        if (!citySlug || !destinationSlug) {
            return NextResponse.json(
                { success: false, error: 'City slug and destination slug are required.' },
                { status: 400 }
            );
        }

        // Fetch city from database
        const city = await prisma.city.findFirst({
            where: {
                slug: citySlug,
                isActive: true,
            },
        });

        if (!city) {
            return NextResponse.json(
                { success: false, error: 'City not found.' },
                { status: 404 }
            );
        }

        // Fetch city from database to get coordinates
        const cityData = await prisma.city.findUnique({
            where: { id: city.id },
            select: { latitude: true, longitude: true },
        });

        // Find the destination
        const destination = await prisma.destination.findFirst({
            where: {
                slug: destinationSlug,
                isActive: true,
            },
            include: {
                destinationPhotos: {
                    orderBy: { isPrimary: 'desc' },
                    take: 10,
                },
                nearbyAttractions: {
                    take: 6,
                },
            },
        });

        if (!destination) {
            return NextResponse.json(
                { success: false, error: 'Destination not found.' },
                { status: 404 }
            );
        }

        // Fetch both transport modes
        const transportOptions = await prisma.cityDestination.findMany({
            where: {
                cityId: city.id,
                destinationId: destination.id,
            },
        });

        // Transform transport options
        const formattedTransportOptions = transportOptions.map(option => ({
            mode: option.transportMode,
            distanceKm: option.distanceKm,
            travelTimeMinutes: option.travelTimeMinutes,
            routePolyline: option.routePolyline,
            majorWaypoints: option.majorWaypoints,
            fareDetails: option.fareDetails,
            bookingLinks: option.bookingLinks,
        }));

        // Transform destination data
        const destinationData = {
            id: destination.id,
            name: destination.name,
            slug: destination.slug,
            category: destination.category,
            shortSummary: destination.shortSummary,
            aiEnhancedSummary: destination.aiEnhancedSummary,
            bestMonths: destination.bestMonths,
            imageUrl: destination.imageUrl,
            latitude: Number(destination.latitude),
            longitude: Number(destination.longitude),
            weatherInfo: destination.weatherInfo,
            airQuality: destination.airQuality,
            bestVisitTime: destination.bestVisitTime,
            destinationPhotos: destination.destinationPhotos.map(photo => ({
                photoUrl: photo.photoUrl,
            })),
        };

        // Transform nearby attractions
        const nearbyAttractions = destination.nearbyAttractions.map(nearby => ({
            id: nearby.id,
            name: nearby.name,
            distanceKm: nearby.distanceKm,
            category: nearby.category,
        }));

        return NextResponse.json({
            success: true,
            destination: destinationData,
            transportOptions: formattedTransportOptions,
            nearbyAttractions,
            city: cityData ? {
                name: city.name,
                latitude: cityData.latitude,
                longitude: cityData.longitude,
            } : null,
        });
    } catch (error) {
        console.error('Destination API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch destination' },
            { status: 500 }
        );
    }
}

