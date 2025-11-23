'use client';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface AnalyticsChartsProps {
    visitTrends: Array<{ date: string; count: number }>;
    topDestinations: Array<{ id: number; name: string; views: number }>;
    topCities: Array<{ id: number; name: string; views: number }>;
    categoryStats: Array<{ category: string; _count: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsCharts({ visitTrends, topDestinations, topCities, categoryStats }: AnalyticsChartsProps) {
    return (
        <>
            {/* Visit Trends Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Visit Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={visitTrends}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                        <XAxis
                            dataKey="date"
                            className="text-gray-600 dark:text-gray-400"
                            tick={{ fill: 'currentColor' }}
                        />
                        <YAxis
                            className="text-gray-600 dark:text-gray-400"
                            tick={{ fill: 'currentColor' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Page Views"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Top Destinations and Cities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Destinations */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-4">Top Destinations</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topDestinations.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                className="text-gray-600 dark:text-gray-400"
                                tick={{ fill: 'currentColor', fontSize: 12 }}
                            />
                            <YAxis
                                className="text-gray-600 dark:text-gray-400"
                                tick={{ fill: 'currentColor' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar dataKey="views" fill="#3b82f6" name="Views" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Cities */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-4">Top Cities</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topCities.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                className="text-gray-600 dark:text-gray-400"
                                tick={{ fill: 'currentColor', fontSize: 12 }}
                            />
                            <YAxis
                                className="text-gray-600 dark:text-gray-400"
                                tick={{ fill: 'currentColor' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar dataKey="views" fill="#10b981" name="Views" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryStats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.category}: ${entry._count}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="_count"
                            >
                                {categoryStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                        {categoryStats.map((item, index) => (
                            <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="font-medium capitalize">{item.category.replace('_', ' ')}</span>
                                </div>
                                <span className="text-gray-600 dark:text-gray-400">{item._count} destinations</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

