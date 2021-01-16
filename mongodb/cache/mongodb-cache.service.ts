import { Collection } from 'mongodb'
import { DI } from '../../core/di'
import { MongodbService } from '../'
import { CacheService } from '../../cache'


export class MongodbCacheService<K, V> extends CacheService<K, V> {
    protected mongodbService = DI.get(MongodbService)


    constructor(
        protected collectionName: string
    ) {
        super()
    }

    public async cached(key: K, cb: () => V, ttl: number = 60): Promise<V> {
        let value = await this.get(key)
        if (value === undefined) {
            value = await cb()
            await this.set(key, value, ttl)
        }

        return value
    }

    public async clear(): Promise<void> {
        const collection = await this.getStore()
        await collection.deleteMany({})
    }

    public async get(key: K): Promise<V | undefined> {
        const collection = await this.getStore()
        const _key = this.makeKey(key)
        const result = await collection.findOne({_id: _key})
        if (result && Date.now() > result?.expires.getTime()) {
            return undefined
        }

        return result ? result.data : undefined
    }

    public async remove(key: K): Promise<void> {
        await (await this.getStore()).deleteOne({_id: this.makeKey(key)}, {j: true})
    }

    public async set(key: K, data: V, ttl: number = 60): Promise<void> {
        await (await this.getStore()).updateOne(
            {_id: this.makeKey(key)},
            {
                $set: {
                    data: data,
                    expires: new Date(Date.now() + (ttl * 1000)),
                    created: new Date(),
                },
            },
            {upsert: true, j: true},
        )
    }

    public async getStore(): Promise<Collection> {
        return (await this.mongodbService.getDb(this.context as any)).collection(this.collectionName)
    }

    protected makeKey(key: K): string {
        return [this.keyPrefix, String(key)].filter(Boolean).join(this.keySeparator)
    }
}
