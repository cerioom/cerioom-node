import { CacheService } from './'
import LRU from 'lru-cache'


export class LruCacheService<V = any> extends CacheService<string, V> {
    protected store: LRU<string, V>

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

    public async get(key: string): Promise<V | undefined> {
        return this.store.get(this.makeKey(key))
    }

    public async remove(key: string): Promise<void> {
        this.store.del(this.makeKey(key))
    }

    public async set(key: string, data: V, ttl?: number): Promise<void> {
        this.store.set(this.makeKey(key), data, ttl ? ttl * 1000 : undefined)
    }

    public async cached(key: string, cb: () => V, ttl: number = 60): Promise<V> {
        let value = await this.get(this.makeKey(key))
        if (value === undefined) {
            value = await cb()
            await this.set(this.makeKey(key), value, ttl)
        }

        this.log.debug({key: key}, 'cached')
        return value
    }

    public getStore(): LRU<string, V> {
        return this.store
    }

    protected makeKey(key: string): string {
        return [this.keyPrefix, String(key)].filter(Boolean).join(this.keySeparator)
    }
}
