import { Service } from '../core/service'
import { CacheStoreInterface } from './cache-store.interface'
import { CacheInterface } from './cache.interface'


export abstract class CacheService<K, V> extends Service implements CacheInterface<K, V> {
    protected keyPrefix = ''
    protected keySeparator = ':'


    public abstract async clear(): Promise<void>

    public abstract async get(key: K): Promise<V | undefined>

    public abstract async remove(key: K): Promise<void>

    public abstract async set(key: K, data: V, ttl: number | undefined): Promise<void>

    public abstract getStore(): CacheStoreInterface

    public abstract async cached(key: K, cb, ttl?: number): Promise<V>

    public configure(options?: {keyPrefix?: string, keySeparator?: string}): this {
        this.keyPrefix = options?.keyPrefix ?? ''
        this.keySeparator = options?.keySeparator ?? ':'
        return this
    }

    protected abstract makeKey(key: K): any
}
