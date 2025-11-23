'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';


export default function SeedPage() {
    const sessionResult = useSession();
    const { data: session, status } = sessionResult || { data: null, status: 'loading' };
    const router = useRouter();
    const [cities, setCities] = useState<any[]>([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [newCityName, setNewCityName] = useState('');
    const [useNewCity, setUseNewCity] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [rateLimitError, setRateLimitError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchCities();
        }
    }, [status]);

    const fetchCities = async () => {
        try {
            const response = await fetch('/api/admin/cities');
            const data = await response.json();
            if (data.success) {
                setCities(data.cities);
            }
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        }
    };

    const startSeeding = async () => {
        const cityName = useNewCity ? newCityName.trim() : selectedCity;
        
        if (!cityName) {
            alert(useNewCity ? 'Please enter a city name' : 'Please select a city');
            return;
        }

        setSeeding(true);
        setLogs([]);
        setRateLimitError(null);
        addLog(`Starting seeding for ${cityName}...`);

        try {
            const response = await fetch('/api/admin/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cityName }),
            });

            const data = await response.json();

            if (data.success) {
                addLog(`✅ Seeding completed!`);
                addLog(`   City: ${data.cityName}`);
                addLog(`   Destinations created: ${data.destinationsCreated}`);
                
                // Add detailed logs if available
                if (data.logs && Array.isArray(data.logs)) {
                    data.logs.forEach((log: string) => addLog(log));
                }
                
                // Refresh cities list
                await fetchCities();
                
                // Reset form
                setNewCityName('');
                setSelectedCity('');
                setUseNewCity(false);
            } else {
                if (data.error?.includes('Rate limit')) {
                    setRateLimitError(
                        `Rate limit exceeded. Please wait ${data.waitMinutes || 0} minutes before trying again.`
                    );
                }
                addLog(`❌ Seeding failed: ${data.error}`);
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
        } finally {
            setSeeding(false);
        }
    };

    const addLog = (message: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-4xl">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Seed Destinations</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Automatically fetch and add destinations for a city using Google Maps
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
                    {/* Toggle between existing and new city */}
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => {
                                setUseNewCity(false);
                                setNewCityName('');
                            }}
                            disabled={seeding}
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                                !useNewCity
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                            } disabled:opacity-50`}
                        >
                            Select Existing City
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setUseNewCity(true);
                                setSelectedCity('');
                            }}
                            disabled={seeding}
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                                useNewCity
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300'
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                            } disabled:opacity-50`}
                        >
                            Add New City
                        </button>
                    </div>

                    {useNewCity ? (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Enter City Name
                            </label>
                            <input
                                type="text"
                                value={newCityName}
                                onChange={(e) => setNewCityName(e.target.value)}
                                disabled={seeding}
                                placeholder="e.g., Mumbai, Delhi, Bangalore"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                The system will search for this city and create it if it doesn't exist.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium mb-2">Select City</label>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                disabled={seeding}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Choose a city...</option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.name}>
                                        {city.name}, {city.state}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {rateLimitError && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                {rateLimitError}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={startSeeding}
                        disabled={seeding || (useNewCity ? !newCityName.trim() : !selectedCity)}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {seeding ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Seeding...
                            </span>
                        ) : (
                            'Start Seeding'
                        )}
                    </button>
                </div>

                {logs.length > 0 && (
                    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Logs</h3>
                        <div className="space-y-1 font-mono text-sm text-gray-400 max-h-96 overflow-y-auto">
                            {logs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
