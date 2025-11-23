import { Metadata } from 'next';
import { generateCityMetadata } from './metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ city: string }> 
}): Promise<Metadata> {
    const { city } = await params;
    
    if (!city) {
        return {
            title: 'City Not Found | TripGennie',
            description: 'The requested city page could not be found.',
        };
    }
    
    return generateCityMetadata(city);
}

export default function CityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

