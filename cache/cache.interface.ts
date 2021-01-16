export interface CacheInterface<K, V> {
    configure: (options?: {keyPrefix?: string, keySeparator?: string}) => void
    set: (key: K, data: V, ttl?: number) => Promise<void>
    get: (key: K) => Promise<V | undefined>
    remove: (key: K) => Promise<void>
    clear: () => Promise<void>
    cached: (key: K, cb, ttl?: number) => Promise<V>
}
