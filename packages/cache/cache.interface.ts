export interface CacheInterface {
    configure: (options?: {keyPrefix?: string, keySeparator?: string}) => void
    set: <K, V>(key: K, data: V, ttl?: number) => Promise<void>
    get: <K, V>(key: K) => Promise<V | undefined>
    remove: <K>(key: K) => Promise<void>
    clear: () => Promise<void>
    cached: <K, V>(key: K, cb: () => V, ttl?: number | undefined) => Promise<V | unknown>
}
