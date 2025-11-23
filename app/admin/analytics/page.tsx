'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

// Lazy load heavy chart components
const AnalyticsCharts = dynamic(() => import('@/components/admin/AnalyticsCharts'), {
    loading: () => (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 h-96 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 h-96 animate-pulse" />
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 h-96 animate-pulse" />
            </div>
        </div>
    ),
    ssr: false,
});

interface AnalyticsData {
    visitTrends: Array<{ date: string; count: number }>;
    topDestinations: Array<{ id: number; name: string; views: number }>;
    topCities: Array<{ id: number; name: string; views: number }>;
    categoryStats: Array<{ category: string; _count: number }>;
}


export default function AnalyticsPage() {
    const sessionResult = useSession();
    const { data: session, status } = sessionResult || { data: null, status: 'loading' };
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchAnalytics();
        }
    }, [status, days]);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`/api/admin/analytics?days=${days}`);
            const result = await response.json();
            if (result.success) {
                // Transform the data for charts
                const visitTrends = (result.data.visitTrends as any[]).map((item: any) => {
                    // Handle date - it might be a string in YYYY-MM-DD format or a Date object
                    let dateStr = item.date;
                    if (dateStr instanceof Date) {
                        dateStr = dateStr.toISOString().split('T')[0];
                    }
                    // Parse the date string and format it
                    const date = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
                    return {
                        date: isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        count: Number(item.count) || 0,
                    };
                }).filter(item => item.date !== 'Invalid Date');

                const topDestinations = (result.data.topDestinations as any[]).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    views: Number(item.views),
                }));

                const topCities = (result.data.topCities as any[]).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    views: Number(item.views),
                }));

                const categoryStats = result.data.categoryStats.map((item: any) => ({
                    category: item.category,
                    _count: item._count,
                }));

                setData({
                    visitTrends,
                    topDestinations,
                    topCities,
                    categoryStats,
                });
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
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
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Insights into your website performance
                        </p>
                    </div>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                </div>

                {data && (
                    <>
                        <AnalyticsCharts
                            visitTrends={data.visitTrends}
                            topDestinations={data.topDestinations}
                            topCities={data.topCities}
                            categoryStats={data.categoryStats}
                        />

                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Page Views</div>
                                <div className="text-2xl font-bold">
                                    {data.visitTrends.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top Destination</div>
                                <div className="text-lg font-semibold">
                                    {data.topDestinations[0]?.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {data.topDestinations[0]?.views || 0} views
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top City</div>
                                <div className="text-lg font-semibold">
                                    {data.topCities[0]?.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {data.topCities[0]?.views || 0} views
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

