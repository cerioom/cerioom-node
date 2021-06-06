import { Service } from '@cerioom/core'
import { CacheStoreInterface } from './cache-store.interface'
import { CacheInterface } from './cache.interface'


export abstract class CacheService extends Service implements CacheInterface {
    protected keyPrefix = ''
    protected keySeparator = ':'


    public abstract clear(): Promise<void>

    public abstract get<K, V>(key: K): Promise<V | undefined>

    public abstract remove<K>(key: K): Promise<void>

    public abstract set<K, V>(key: K, data: V, ttl: number | undefined): Promise<void>

    public abstract getStore(): CacheStoreInterface

    public abstract cached<K, V>(key: K, cb: () => V, ttl?: number | undefined): Promise<V | unknown>

    public configure(options?: {keyPrefix?: string, keySeparator?: string}): this {
        this.keyPrefix = options?.keyPrefix ?? ''
        this.keySeparator = options?.keySeparator ?? ':'
        return this
    }

    protected abstract makeKey<K>(key: K): any
}
