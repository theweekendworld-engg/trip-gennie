'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';


export default function AdminDashboard() {
    const sessionResult = useSession();
    const { data: session, status } = sessionResult || { data: null, status: 'loading' };
    const router = useRouter();
    const [stats, setStats] = useState({
        totalCities: 0,
        totalDestinations: 0,
        totalVisits: 0,
        todayVisits: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchStats();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats', {
                credentials: 'include', // Include cookies for authentication
            });
            const data = await response.json();
            
            if (!response.ok) {
                const errorMsg = data.error || 'Unknown error';
                console.error('Stats API error:', errorMsg);
                setError(errorMsg);
                return;
            }
            
            if (data.success && data.stats) {
                setStats(data.stats);
                setError(null);
            } else {
                console.error('Stats API returned unsuccessful response:', data);
                setError('Failed to load stats');
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <AdminLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!session) {
        return (
            <AdminLayout>
                <div className="space-y-8">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-yellow-800 dark:text-yellow-200">
                            Please log in to view the dashboard.
                        </p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            Welcome back, {session.user?.name || session.user?.email || 'Admin'}!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Loading dashboard data...
                        </p>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Welcome Message */}
                <div>
                    <h2 className="text-2xl font-bold mb-2">
                        Welcome back, {session?.user?.name || session?.user?.email || 'Admin'}!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Here's what's happening with TripGennie today.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200">
                            {error}
                        </p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Cities"
                        value={stats.totalCities}
                        icon="🏙️"
                        color="blue"
                    />
                    <StatsCard
                        title="Total Destinations"
                        value={stats.totalDestinations}
                        icon="🏞️"
                        color="green"
                    />
                    <StatsCard
                        title="Total Visits"
                        value={stats.totalVisits}
                        icon="👥"
                        color="purple"
                    />
                    <StatsCard
                        title="Today's Visits"
                        value={stats.todayVisits}
                        icon="📊"
                        color="orange"
                    />
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <QuickActionCard
                            title="Seed New City"
                            description="Add destinations for a new city"
                            icon="🌱"
                            href="/admin/seed"
                        />
                        <QuickActionCard
                            title="Manage Cities"
                            description="View and edit all cities"
                            icon="🏙️"
                            href="/admin/cities"
                        />
                        <QuickActionCard
                            title="View Analytics"
                            description="See detailed analytics"
                            icon="📈"
                            href="/admin/analytics"
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatsCard({ title, value, icon, color }: {
    title: string;
    value: number;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        </div>
    );
}

function QuickActionCard({ title, description, icon, href }: {
    title: string;
    description: string;
    icon: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
        >
            <div className="text-3xl mb-3">{icon}</div>
            <h4 className="font-semibold mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </a>
    );
}

