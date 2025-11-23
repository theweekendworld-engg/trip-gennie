'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';


interface AuditLog {
    id: number;
    action: string;
    entityType: string;
    entityId: number | null;
    changes: any;
    ipAddress: string | null;
    userAgent: string | null;
    timestamp: string;
    adminUser: {
        id: number;
        email: string;
        name: string | null;
    };
}

export default function AuditLogsPage() {
    const sessionResult = useSession();
    const { data: session, status } = sessionResult || { data: null, status: 'loading' };
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        entityType: '',
        startDate: '',
        endDate: '',
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchLogs();
        }
    }, [status, filters, page]);

    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (filters.action) params.append('action', filters.action);
            if (filters.entityType) params.append('entityType', filters.entityType);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await fetch(`/api/admin/audit-logs?${params}`);
            const data = await response.json();
            if (data.success) {
                setLogs(data.logs);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActionColor = (action: string) => {
        if (action.includes('create')) return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
        if (action.includes('update')) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
        if (action.includes('delete')) return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
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
                <div>
                    <h2 className="text-2xl font-bold">Audit Logs</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track all admin actions and changes
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Action</label>
                            <input
                                type="text"
                                placeholder="Filter by action..."
                                value={filters.action}
                                onChange={(e) => {
                                    setFilters({ ...filters, action: e.target.value });
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Entity Type</label>
                            <select
                                value={filters.entityType}
                                onChange={(e) => {
                                    setFilters({ ...filters, entityType: e.target.value });
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                            >
                                <option value="">All Types</option>
                                <option value="city">City</option>
                                <option value="destination">Destination</option>
                                <option value="admin_user">Admin User</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Start Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => {
                                    setFilters({ ...filters, startDate: e.target.value });
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">End Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => {
                                    setFilters({ ...filters, endDate: e.target.value });
                                    setPage(1);
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Admin
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        Entity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        IP Address
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 text-sm">
                                            {formatTimestamp(log.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div>
                                                <div className="font-medium">
                                                    {log.adminUser.name || log.adminUser.email}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {log.adminUser.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}
                                            >
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div>
                                                <div className="font-medium capitalize">
                                                    {log.entityType.replace(/_/g, ' ')}
                                                </div>
                                                {log.entityId && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        ID: {log.entityId}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {log.ipAddress || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Page {page} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

