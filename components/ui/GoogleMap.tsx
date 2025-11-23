'use client';

import { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
    latitude: number;
    longitude: number;
    destinationName: string;
    cityName?: string;
    cityLatitude?: number;
    cityLongitude?: number;
    className?: string;
}

export default function GoogleMap({
    latitude,
    longitude,
    destinationName,
    cityName,
    cityLatitude,
    cityLongitude,
    className = '',
}: GoogleMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);
    const initMapRef = useRef<(() => void) | null>(null);

    const markersRef = useRef<any[]>([]);

    // Get API key from environment variable (frontend key with HTTP referrer restrictions)
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;

    // Check if API key is available
    useEffect(() => {
        if (!apiKey) {
            console.error('NEXT_PUBLIC_GOOGLE_MAP_KEY is not set');
            setMapError(true);
        }
    }, [apiKey]);

    useEffect(() => {
        if (!mapRef.current || mapLoaded || !apiKey) return;

        let isMounted = true;

        const initMap = async () => {
            try {
                setOptions({
                    key: apiKey,
                    v: "weekly",
                    libraries: ["places", "marker"],
                });

                const { Map, InfoWindow, Polyline } = await importLibrary("maps") as any;
                const { LatLng, LatLngBounds } = await importLibrary("core") as any;
                const { AdvancedMarkerElement, PinElement } = await importLibrary("marker") as any;

                if (!isMounted) return;

                const destination = new LatLng(latitude, longitude);

                const map = new Map(mapRef.current as HTMLElement, {
                    center: destination,
                    zoom: 13,
                    mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                });

                mapInstanceRef.current = map;

                // Add destination marker using AdvancedMarkerElement
                const destinationPin = new PinElement({
                    background: '#6366F1',
                    borderColor: '#ffffff',
                    glyphColor: '#ffffff',
                    scale: 1.2,
                });

                const destinationMarker = new AdvancedMarkerElement({
                    map: map,
                    position: destination,
                    title: destinationName,
                    content: destinationPin.element,
                });
                markersRef.current.push(destinationMarker);

                // Add city marker if provided
                let cityMarker: any = null;
                if (cityName && cityLatitude && cityLongitude) {
                    const city = new LatLng(cityLatitude, cityLongitude);

                    const cityPin = new PinElement({
                        background: '#A855F7',
                        borderColor: '#ffffff',
                        glyphColor: '#ffffff',
                        scale: 1.0,
                    });

                    cityMarker = new AdvancedMarkerElement({
                        map: map,
                        position: city,
                        title: cityName,
                        content: cityPin.element,
                    });
                    markersRef.current.push(cityMarker);

                    // Draw route line if both points exist
                    const route = new Polyline({
                        path: [city, destination],
                        geodesic: true,
                        strokeColor: '#6366F1',
                        strokeOpacity: 0.6,
                        strokeWeight: 3,
                    });
                    route.setMap(map);

                    // Fit bounds to show both markers
                    const bounds = new LatLngBounds();
                    bounds.extend(city);
                    bounds.extend(destination);
                    map.fitBounds(bounds);
                }

                // Add info window for destination
                const infoWindow = new InfoWindow({
                    content: `
                        <div style="padding: 8px;">
                            <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 16px;">${destinationName}</h3>
                            <p style="margin: 0; color: #666; font-size: 14px;">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
                        </div>
                    `,
                });

                destinationMarker.addListener('click', () => {
                    infoWindow.open(map, destinationMarker);
                });

                if (isMounted) {
                    setMapLoaded(true);
                }
            } catch (error) {
                console.error('Error initializing map:', error);
                if (isMounted) {
                    setMapError(true);
                }
            }
        };

        initMap();

        // Cleanup function
        return () => {
            isMounted = false;
            // Clean up markers to prevent DOM errors
            if (markersRef.current) {
                markersRef.current.forEach(marker => {
                    if (marker) marker.map = null;
                });
                markersRef.current = [];
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude, destinationName, cityName, cityLatitude, cityLongitude, mapLoaded, apiKey]);

    if (mapError) {
        return (
            <div className={`card p-8 text-center ${className}`}>
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold mb-2">Map unavailable</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Unable to load map. Please check your Google Maps API key configuration.
                </p>
                <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm"
                >
                    Open in Google Maps
                </a>
            </div>
        );
    }

    return (
        <div className={`card overflow-hidden ${className}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-2">Location Map</h3>
                <p className="text-sm text-muted-foreground">
                    Explore the area around {destinationName}
                    {cityName && ` and route from ${cityName}`}
                </p>
            </div>
            <div className="relative w-full h-[500px] bg-muted">
                <div ref={mapRef} className="absolute inset-0" />
                {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-muted">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-sm text-muted-foreground">Loading map...</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in Google Maps
                </a>
            </div>
        </div>
    );
}

// Extend Window interface for TypeScript
declare global {
    interface Window {
        google?: typeof google;
    }
}

