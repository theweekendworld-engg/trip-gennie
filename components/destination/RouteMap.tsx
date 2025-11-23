'use client';

import { useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { motion } from 'framer-motion';

interface RouteMapProps {
    latitude: number;
    longitude: number;
    destinationName: string;
    cityName?: string;
    cityLatitude?: number;
    cityLongitude?: number;
    routePolyline?: string | null;
    majorWaypoints?: Array<{ name: string; lat: number; lng: number }> | null;
    className?: string;
}

export default function RouteMap({
    latitude,
    longitude,
    destinationName,
    cityName,
    cityLatitude,
    cityLongitude,
    routePolyline,
    majorWaypoints,
    className = '',
}: RouteMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const markersRef = useRef<any[]>([]);
    const polylineRef = useRef<any>(null);

    // Fetch API key from server
    useEffect(() => {
        fetch('/api/maps-key')
            .then(res => res.json())
            .then(data => {
                if (data.apiKey) {
                    setApiKey(data.apiKey);
                } else {
                    setMapError(true);
                }
            })
            .catch(() => {
                setMapError(true);
            });
    }, []);

    useEffect(() => {
        if (!mapRef.current || mapLoaded || !apiKey) return;

        let isMounted = true;

        const initMap = async () => {
            try {
                setOptions({
                    key: apiKey,
                    v: "weekly",
                    libraries: ["places", "marker", "geometry"],
                });

                const { Map, InfoWindow, Polyline } = await importLibrary("maps") as any;
                const { LatLng, LatLngBounds } = await importLibrary("core") as any;
                const { AdvancedMarkerElement, PinElement } = await importLibrary("marker") as any;
                const { encoding } = await importLibrary("geometry") as any;

                if (!isMounted) return;

                const destination = new LatLng(latitude, longitude);

                const map = new Map(mapRef.current as HTMLElement, {
                    center: destination,
                    zoom: 13,
                    mapId: 'DEMO_MAP_ID',
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                });

                mapInstanceRef.current = map;

                // Add destination marker
                const destinationPin = new PinElement({
                    background: '#6366F1',
                    borderColor: '#ffffff',
                    glyphColor: '#ffffff',
                    scale: 1.3,
                });

                const destinationMarker = new AdvancedMarkerElement({
                    map: map,
                    position: destination,
                    title: destinationName,
                    content: destinationPin.element,
                });
                markersRef.current.push(destinationMarker);

                // Add city marker and route if provided
                if (cityName && cityLatitude && cityLongitude) {
                    const city = new LatLng(cityLatitude, cityLongitude);

                    const cityPin = new PinElement({
                        background: '#A855F7',
                        borderColor: '#ffffff',
                        glyphColor: '#ffffff',
                        scale: 1.1,
                    });

                    const cityMarker = new AdvancedMarkerElement({
                        map: map,
                        position: city,
                        title: cityName,
                        content: cityPin.element,
                    });
                    markersRef.current.push(cityMarker);

                    // Draw route polyline if available
                    if (routePolyline) {
                        try {
                            const decodedPath = encoding.decodePath(routePolyline);
                            const route = new Polyline({
                                path: decodedPath,
                                geodesic: true,
                                strokeColor: '#6366F1',
                                strokeOpacity: 0.8,
                                strokeWeight: 4,
                            });
                            route.setMap(map);
                            polylineRef.current = route;

                            // Add waypoint markers if available
                            if (majorWaypoints && majorWaypoints.length > 0) {
                                majorWaypoints.forEach((waypoint: any) => {
                                    const waypointPin = new PinElement({
                                        background: '#10B981',
                                        borderColor: '#ffffff',
                                        glyphColor: '#ffffff',
                                        scale: 0.8,
                                    });

                                    const waypointMarker = new AdvancedMarkerElement({
                                        map: map,
                                        position: new LatLng(waypoint.lat, waypoint.lng),
                                        title: waypoint.name,
                                        content: waypointPin.element,
                                    });
                                    markersRef.current.push(waypointMarker);
                                });
                            }
                        } catch (err) {
                            console.error('Error decoding polyline:', err);
                        }
                    } else {
                        // Fallback to straight line
                        const route = new Polyline({
                            path: [city, destination],
                            geodesic: true,
                            strokeColor: '#6366F1',
                            strokeOpacity: 0.6,
                            strokeWeight: 3,
                        });
                        route.setMap(map);
                        polylineRef.current = route;
                    }

                    // Fit bounds to show all markers
                    const bounds = new LatLngBounds();
                    bounds.extend(city);
                    bounds.extend(destination);
                    if (majorWaypoints) {
                        majorWaypoints.forEach((wp: any) => {
                            bounds.extend(new LatLng(wp.lat, wp.lng));
                        });
                    }
                    map.fitBounds(bounds);
                }

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

        return () => {
            isMounted = false;
            if (markersRef.current) {
                markersRef.current.forEach(marker => {
                    if (marker) marker.map = null;
                });
                markersRef.current = [];
            }
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude, destinationName, cityName, cityLatitude, cityLongitude, routePolyline, majorWaypoints, mapLoaded, apiKey]);

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`card overflow-hidden ${className}`}
        >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-2">🗺️ Route Map</h3>
                <p className="text-sm text-muted-foreground">
                    {routePolyline ? 'Detailed route with waypoints' : 'Direct route'} from {cityName} to {destinationName}
                </p>
            </div>
            <div className="relative w-full h-[500px] bg-muted">
                <div ref={mapRef} className="absolute inset-0" />
                {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-muted">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            <p className="text-sm text-muted-foreground">Loading route...</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span>Origin</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        <span>Destination</span>
                    </div>
                    {majorWaypoints && majorWaypoints.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Waypoints</span>
                        </div>
                    )}
                </div>
                <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${cityLatitude},${cityLongitude}&destination=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Get Directions
                </a>
            </div>
        </motion.div>
    );
}
