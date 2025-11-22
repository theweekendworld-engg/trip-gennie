import { Metadata } from 'next';
import { generateCityMetadata } from './metadata';

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
    return generateCityMetadata(params.city);
}

export default function CityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

