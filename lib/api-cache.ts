/**
 * Client-side API cache utility
 * Caches API responses during navigation, clears on hard reload
 * Uses sessionStorage which persists during navigation but clears on browser close/reload
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class ApiCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes default
    private readonly maxCacheSize = 100; // Maximum number of cached entries

    constructor() {
        // Load cache from sessionStorage on initialization
        this.loadFromSessionStorage();
        
        // Save to sessionStorage before page unload
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.saveToSessionStorage();
            });
            
            // Also save periodically (every 30 seconds)
            setInterval(() => {
                this.saveToSessionStorage();
            }, 30000);
        }
    }

    /**
     * Generate cache key from URL and options
     */
    private getCacheKey(url: string, options?: RequestInit): string {
        const method = options?.method || 'GET';
        const body = options?.body ? JSON.stringify(options.body) : '';
        return `${method}:${url}:${body}`;
    }

    /**
     * Check if cache entry is still valid
     */
    private isValid(entry: CacheEntry<any>): boolean {
        return Date.now() - entry.timestamp < entry.ttl;
    }

    /**
     * Get cached data if available and valid
     */
    get<T>(url: string, options?: RequestInit): T | null {
        const key = this.getCacheKey(url, options);
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (!this.isValid(entry)) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Store data in cache
     */
    set<T>(url: string, data: T, options?: RequestInit, ttl?: number): void {
        const key = this.getCacheKey(url, options);
        
        // Enforce max cache size (remove oldest entries)
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
        });

        // Save to sessionStorage
        this.saveToSessionStorage();
    }

    /**
     * Clear specific cache entry
     */
    clear(url: string, options?: RequestInit): void {
        const key = this.getCacheKey(url, options);
        this.cache.delete(key);
        this.saveToSessionStorage();
    }

    /**
     * Clear all cache
     */
    clearAll(): void {
        this.cache.clear();
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('api-cache');
        }
    }

    /**
     * Clear expired entries
     */
    clearExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp >= entry.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Save cache to sessionStorage
     */
    private saveToSessionStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            // Clear expired entries before saving
            this.clearExpired();

            const cacheData = Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                ...entry,
            }));

            sessionStorage.setItem('api-cache', JSON.stringify(cacheData));
        } catch (error) {
            // sessionStorage might be full or unavailable
            console.warn('Failed to save API cache to sessionStorage:', error);
        }
    }

    /**
     * Load cache from sessionStorage
     */
    private loadFromSessionStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            const cached = sessionStorage.getItem('api-cache');
            if (!cached) return;

            const cacheData: Array<{ key: string; data: any; timestamp: number; ttl: number }> = 
                JSON.parse(cached);

            // Only load entries that are still valid
            const now = Date.now();
            for (const item of cacheData) {
                if (now - item.timestamp < item.ttl) {
                    this.cache.set(item.key, {
                        data: item.data,
                        timestamp: item.timestamp,
                        ttl: item.ttl,
                    });
                }
            }
        } catch (error) {
            // Invalid cache data or sessionStorage unavailable
            console.warn('Failed to load API cache from sessionStorage:', error);
            sessionStorage.removeItem('api-cache');
        }
    }
}

// Singleton instance
const apiCache = new ApiCache();

/**
 * Cached fetch wrapper
 * Automatically caches GET requests and retrieves from cache when available
 */
export async function cachedFetch<T = any>(
    url: string,
    options?: RequestInit,
    cacheOptions?: {
        ttl?: number; // Time to live in milliseconds
        skipCache?: boolean; // Skip cache for this request
        forceCache?: boolean; // Force cache even for non-GET requests
    }
): Promise<T> {
    // Only cache GET requests by default, unless forceCache is true
    const isGetRequest = !options?.method || options.method === 'GET';
    const shouldCache = (isGetRequest || cacheOptions?.forceCache) && !cacheOptions?.skipCache;

    // Try to get from cache first
    if (shouldCache) {
        const cached = apiCache.get<T>(url, options);
        if (cached !== null) {
            return cached;
        }
    }

    // Make the actual fetch request
    const response = await fetch(url, options);
    
    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache successful responses
    if (shouldCache && response.ok) {
        apiCache.set(url, data, options, cacheOptions?.ttl);
    }

    return data as T;
}

/**
 * Clear cache for specific URL
 */
export function clearApiCache(url: string, options?: RequestInit): void {
    apiCache.clear(url, options);
}

/**
 * Clear all API cache
 */
export function clearAllApiCache(): void {
    apiCache.clearAll();
}

/**
 * Get cache instance (for advanced usage)
 */
export function getApiCache() {
    return apiCache;
}

