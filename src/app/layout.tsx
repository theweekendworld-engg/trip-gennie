import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "TripGenie - Discover Amazing Weekend Getaways",
    description: "Find perfect 1-day and 2-day trips from your city. Filter by budget, time, and interests. Discover hidden gems near Bengaluru, Mumbai, Pune, Delhi, Chennai, and Hyderabad.",
    keywords: ["weekend trips", "one day trips", "weekend getaways", "road trips", "travel India"],
    authors: [{ name: "TripGenie" }],
    openGraph: {
        title: "TripGenie - Discover Amazing Weekend Getaways",
        description: "Find perfect 1-day and 2-day trips from your city",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="min-h-screen">
                {children}
            </body>
        </html>
    );
}
