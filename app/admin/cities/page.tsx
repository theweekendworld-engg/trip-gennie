'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';


interface City {
    id: number;
    name: string;
    slug: string;
    state: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
    _count: { cityDestinations: number };
}

export default function CitiesPage() {
    const sessionResult = useSession();
    const { data: session, status } = sessionResult || { data: null, status: 'loading' };
    const router = useRouter();
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchCities();
        }
    }, [status, search]);

    const fetchCities = async () => {
        try {
            const response = await fetch(`/api/admin/cities?search=${search}`);
            const data = await response.json();
            if (data.success) {
                setCities(data.cities);
            }
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteCity = async (id: number) => {
        if (!confirm('Are you sure you want to delete this city?')) return;

        try {
            const response = await fetch(`/api/admin/cities?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchCities();
            }
        } catch (error) {
            console.error('Failed to delete city:', error);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Cities</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage all cities in the system
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search cities..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                </div>

                {/* Cities Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    State
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Destinations
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {cities.map((city) => (
                                <tr key={city.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium">{city.name}</div>
                                            <div className="text-sm text-gray-500">{city.slug}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{city.state}</td>
                                    <td className="px-6 py-4 text-sm">{city._count.cityDestinations}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${city.isActive
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                                }`}
                                        >
                                            {city.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => deleteCity(city.id)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
