'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { CATEGORIES } from '@/lib/constants';


interface Destination {
    id: number;
    name: string;
    slug: string;
    category: string;
    shortSummary?: string;
    imageUrl?: string;
    isActive: boolean;
    latitude?: number;
    longitude?: number;
    cityDestinations: Array<{
        city: { id: number; name: string; slug: string };
    }>;
}

interface City {
    id: number;
    name: string;
    slug: string;
}

export default function DestinationsPage() {
    const sessionResult = useSession();
    const { data: session, status } = sessionResult || { data: null, status: 'loading' };
    const router = useRouter();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
    });
    const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newDestination, setNewDestination] = useState({
        name: '',
        slug: '',
        category: '',
        shortSummary: '',
        imageUrl: '',
        latitude: '',
        longitude: '',
        cityId: '',
    });
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchDestinations();
            fetchCities();
        }
    }, [status, search, categoryFilter, pagination.page]);

    const fetchDestinations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (categoryFilter) params.append('category', categoryFilter);
            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());

            const response = await fetch(`/api/admin/destinations?${params}`);
            const data = await response.json();
            if (data.success) {
                setDestinations(data.destinations);
                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total,
                        pages: data.pagination.pages,
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch destinations:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                return data.url;
            }
            throw new Error(data.error || 'Upload failed');
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Image upload failed. Please use a URL instead.');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const deleteSelected = async () => {
        if (!confirm(`Delete ${selectedIds.length} destination(s)?`)) return;

        try {
            const response = await fetch(`/api/admin/destinations?ids=${selectedIds.join(',')}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setSelectedIds([]);
                fetchDestinations();
            }
        } catch (error) {
            console.error('Failed to delete destinations:', error);
        }
    };

    const bulkUpdateStatus = async (isActive: boolean) => {
        if (!confirm(`${isActive ? 'Activate' : 'Deactivate'} ${selectedIds.length} destination(s)?`)) return;

        try {
            const response = await fetch('/api/admin/destinations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds, updates: { isActive } }),
            });
            if (response.ok) {
                setSelectedIds([]);
                fetchDestinations();
            }
        } catch (error) {
            console.error('Failed to update destinations:', error);
        }
    };

    const createDestination = async () => {
        if (!newDestination.name || !newDestination.slug || !newDestination.category || !newDestination.cityId) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/api/admin/destinations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDestination),
            });

            const data = await response.json();
            if (data.success) {
                setIsCreating(false);
                setNewDestination({
                    name: '',
                    slug: '',
                    category: '',
                    shortSummary: '',
                    imageUrl: '',
                    latitude: '',
                    longitude: '',
                    cityId: '',
                });
                fetchDestinations();
            } else {
                alert(data.error || 'Failed to create destination');
            }
        } catch (error) {
            console.error('Failed to create destination:', error);
            alert('Failed to create destination');
        }
    };

    const updateDestination = async (id: number, updates: Partial<Destination>) => {
        try {
            const response = await fetch('/api/admin/destinations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });
            if (response.ok) {
                setEditingDestination(null);
                fetchDestinations();
            }
        } catch (error) {
            console.error('Failed to update destination:', error);
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
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
                        <h2 className="text-2xl font-bold">Destinations</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage all destinations in the system
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {selectedIds.length > 0 && (
                            <>
                                <button
                                    onClick={() => bulkUpdateStatus(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Activate {selectedIds.length}
                                </button>
                                <button
                                    onClick={() => bulkUpdateStatus(false)}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Deactivate {selectedIds.length}
                                </button>
                                <button
                                    onClick={deleteSelected}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Delete {selectedIds.length}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            + New Destination
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search destinations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.emoji} {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Destinations Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === destinations.length && destinations.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIds(destinations.map(d => d.id));
                                            } else {
                                                setSelectedIds([]);
                                            }
                                        }}
                                        className="rounded"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    City
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
                            {destinations.map((dest) => (
                                <tr key={dest.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(dest.id)}
                                            onChange={() => toggleSelection(dest.id)}
                                            className="rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {dest.imageUrl && (
                                                <img
                                                    src={dest.imageUrl}
                                                    alt={dest.name}
                                                    className="w-12 h-12 rounded object-cover"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{dest.name}</div>
                                                {dest.shortSummary && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                        {dest.shortSummary}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {CATEGORIES.find(c => c.value === dest.category)?.label || dest.category}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {dest.cityDestinations[0]?.city.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${dest.isActive
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                                }`}
                                        >
                                            {dest.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => setEditingDestination(dest)}
                                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} destinations
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.pages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.pages - 2) {
                                        pageNum = pagination.pages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                            className={`px-4 py-2 rounded-lg border ${
                                                pagination.page === pageNum
                                                    ? 'bg-primary-600 text-white border-primary-600'
                                                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {isCreating && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4">Create New Destination</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={newDestination.name}
                                        onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Slug *</label>
                                    <input
                                        type="text"
                                        value={newDestination.slug}
                                        onChange={(e) => setNewDestination({ ...newDestination, slug: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        placeholder="e.g., mysore-palace"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">City *</label>
                                    <select
                                        value={newDestination.cityId}
                                        onChange={(e) => setNewDestination({ ...newDestination, cityId: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select a city</option>
                                        {cities.map(city => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <select
                                        value={newDestination.category}
                                        onChange={(e) => setNewDestination({ ...newDestination, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select a category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.emoji} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Short Summary *</label>
                                    <textarea
                                        value={newDestination.shortSummary}
                                        onChange={(e) => setNewDestination({ ...newDestination, shortSummary: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={newDestination.latitude}
                                        onChange={(e) => setNewDestination({ ...newDestination, latitude: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={newDestination.longitude}
                                        onChange={(e) => setNewDestination({ ...newDestination, longitude: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Image</label>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = await handleImageUpload(file);
                                                    if (url) {
                                                        setNewDestination({ ...newDestination, imageUrl: url });
                                                    }
                                                }
                                            }}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                            disabled={uploadingImage}
                                        />
                                        {uploadingImage && <p className="text-sm text-gray-500">Uploading...</p>}
                                        <input
                                            type="text"
                                            placeholder="Or enter image URL"
                                            value={newDestination.imageUrl}
                                            onChange={(e) => setNewDestination({ ...newDestination, imageUrl: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => {
                                            setIsCreating(false);
                                            setNewDestination({
                                                name: '',
                                                slug: '',
                                                category: '',
                                                shortSummary: '',
                                                imageUrl: '',
                                                latitude: '',
                                                longitude: '',
                                                cityId: '',
                                            });
                                        }}
                                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createDestination}
                                        className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white"
                                    >
                                        Create Destination
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingDestination && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-4">Edit Destination</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={editingDestination.name}
                                        onChange={(e) => setEditingDestination({ ...editingDestination, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={editingDestination.category}
                                        onChange={(e) => setEditingDestination({ ...editingDestination, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.emoji} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Short Summary</label>
                                    <textarea
                                        value={editingDestination.shortSummary || ''}
                                        onChange={(e) => setEditingDestination({ ...editingDestination, shortSummary: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Image</label>
                                    <div className="space-y-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = await handleImageUpload(file);
                                                    if (url) {
                                                        setEditingDestination({ ...editingDestination, imageUrl: url });
                                                    }
                                                }
                                            }}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                            disabled={uploadingImage}
                                        />
                                        {uploadingImage && <p className="text-sm text-gray-500">Uploading...</p>}
                                        <input
                                            type="text"
                                            placeholder="Or enter image URL"
                                            value={editingDestination.imageUrl || ''}
                                            onChange={(e) => setEditingDestination({ ...editingDestination, imageUrl: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <select
                                        value={editingDestination.isActive ? 'active' : 'inactive'}
                                        onChange={(e) => setEditingDestination({ ...editingDestination, isActive: e.target.value === 'active' })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setEditingDestination(null)}
                                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => updateDestination(editingDestination.id, editingDestination)}
                                        className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
