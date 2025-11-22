import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { ThemeScript } from "../components/ThemeScript";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://tripgenie.in';

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "TripGenie - Discover Amazing Weekend Getaways from Indian Cities",
        template: "%s | TripGenie",
    },
    description: "Find perfect 1-day and 2-day trips from Bengaluru, Mumbai, Pune, Delhi, Chennai, and Hyderabad. Filter by budget (₹1,000-₹5,000), travel time (2-6 hours), category, and transport mode. Discover hidden gems for your weekend adventure.",
    keywords: [
        "weekend trips",
        "one day trips",
        "weekend getaways",
        "road trips India",
        "weekend destinations",
        "Bengaluru weekend trips",
        "Mumbai weekend trips",
        "Pune weekend trips",
        "Delhi weekend trips",
        "Chennai weekend trips",
        "Hyderabad weekend trips",
        "budget trips",
        "short trips",
        "nearby places",
        "weekend travel",
        "hill stations",
        "waterfalls",
        "forts",
        "temples",
        "adventure trips",
    ],
    authors: [{ name: "TripGenie", url: baseUrl }],
    creator: "TripGenie",
    publisher: "TripGenie",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_IN",
        url: baseUrl,
        siteName: "TripGenie",
        title: "TripGenie - Discover Amazing Weekend Getaways from Indian Cities",
        description: "Find perfect 1-day and 2-day trips from your city. Filter by budget, time, and interests. Discover hidden gems near you.",
        images: [
            {
                url: `${baseUrl}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "TripGenie - Weekend Getaways",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "TripGenie - Discover Amazing Weekend Getaways",
        description: "Find perfect 1-day and 2-day trips from your city. Filter by budget, time, and interests.",
        images: [`${baseUrl}/og-image.png`],
        creator: "@tripgenie",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        // Add your verification codes here when available
        // google: 'your-google-verification-code',
        // yandex: 'your-yandex-verification-code',
        // yahoo: 'your-yahoo-verification-code',
    },
    alternates: {
        canonical: baseUrl,
    },
    category: "Travel",
    classification: "Travel & Tourism",
    other: {
        'geo.region': 'IN',
        'geo.placename': 'India',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ThemeScript />
            </head>
            <body className="min-h-screen">
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
