import { CacheService } from './'
import LRU from 'lru-cache'


export class LruCacheService extends CacheService {
    protected store: LRU<string, any>

    constructor(opts?: {
        max: number
        length: (n, key) => number
        dispose: (key, n) => void
        maxAge: number
    }) {
        super()
        this.store = new LRU(opts)
    }

    public async clear(): Promise<void> {
        this.store.reset()
    }

    public async get<K, V>(key: K): Promise<V | undefined> {
        return this.store.get(this.makeKey(key))
    }

    public async remove<K>(key: K): Promise<void> {
        this.store.del(this.makeKey(key))
    }

    /**
     * @param key
     * @param data
     * @param ttl in seconds
     */
    public async set<K, V>(key: K, data: V, ttl?: number): Promise<void> {
        this.store.set(this.makeKey(key), data, ttl ? ttl * 1000 : undefined)
    }

    /**
     * @param key
     * @param cb
     * @param ttl in seconds
     */
    public async cached<K, V>(key: K, cb: () => V, ttl = 60): Promise<V | unknown> {
        let value = await this.get(key)
        if (value === undefined) {
            value = await cb()
            await this.set(key, value, ttl)
        }

        this.log.debug({key: key}, 'cached')
        return value
    }

    public getStore(): LRU<string, any> {
        return this.store
    }

    protected makeKey<K>(key: K): string {
        return [this.keyPrefix, String(key)].filter(Boolean).join(this.keySeparator)
    }
}
