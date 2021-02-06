import { DI, ResponseEnvelopeInterface, RuntimeError } from '@cerioom/core'
import {
    InsertManyResultInterface,
    RemoveManyResultInterface,
    Repository as BaseRepository,
    RepositoryInterface,
    ResourceQueryFilterInterface,
    ResourceQueryInterface,
    UpdateManyResultInterface,
    RepositoryConstructorOptions
} from '@cerioom/resource'
import * as _ from 'lodash'
import {
    CollectionInsertOneOptions,
    CommonOptions,
    Cursor,
    Db,
    FilterQuery,
    FindOneAndUpdateOption,
    FindOneOptions,
    MongoCallback,
    MongoError,
    ReplaceOneOptions,
    UpdateOneOptions,
    UpdateQuery,
} from 'mongodb'
import { MongodbService } from '../'
import { MongodbResourceQuery } from '../resource-query'


export abstract class Repository<Model> extends BaseRepository<Model> implements RepositoryInterface<Model> {
    protected readonly collectionName: string
    protected mongodbService = DI.get(MongodbService)
    protected mongodbResourceQuery = DI.get(MongodbResourceQuery)

    protected constructor(opts: RepositoryConstructorOptions<Model> & {collectionName?: string}) {
        super(opts)
        this.collectionName = opts.collectionName ?? _.camelCase(opts.modelClass.constructor.name)
    }

    public async count(filter: ResourceQueryFilterInterface<Model>, options?: CommonOptions): Promise<number> {
        const opts = Object.assign({}, options)
        if (!opts.session) {
            opts.session = (await this.getConnection()).startSession()
        }

        try {
            const db = await this.getNamespace()
            await this.emit('pre:count', {repository: this, filter: filter, options: opts})
            const result = await db.collection(this.collectionName).countDocuments(filter, opts)
            await this.emit('post:count', {repository: this, filter: filter, result: result, options: opts})
            return result
        } catch (err) {
            await this.emit('error:count', {repository: this, error: err, filter: filter, options: opts})
            this.log.error({error: RuntimeError.toJSON(err)})
            throw new RuntimeError().setCause(err)
        } finally {
            opts.session?.endSession()
        }
    }

    public async export(query: ResourceQueryInterface<Model>, options?: FindOneOptions<Model> & {transform?: (document: Model) => any}): Promise<Cursor> {
        const opts: FindOneOptions<any> = Object.assign({}, options)
        try {
            this.log.debug({action: 'export', tenant: {id: this.context.tenant.id}, collection: this.collectionName, query: query})

            const db = await this.getNamespace()
            await this.emit('pre:export', {repository: this, query: query, opts: opts})
            const cursor = db.collection(this.collectionName, opts)
                .find(this.mongodbResourceQuery.makeFilter(query, this.resourceQueryMapper), opts)
            this.mongodbResourceQuery?.applyFields(cursor, query)
            this.mongodbResourceQuery?.applySort(cursor, query)
            this.mongodbResourceQuery?.applySkip(cursor, query)

            if (query.limit) {
                this.mongodbResourceQuery?.applyLimit(cursor, query)
            }

            return cursor.stream(options).on('end', async () => {
                await this.emit('post:export', {repository: this, query: query, opts: opts})
            })
        } catch (err) {
            await this.emit('error:export', {repository: this, error: err, query: query, options: options})
            this.log.error({error: RuntimeError.toJSON(err)})
            throw new RuntimeError().setCause(err)
        }
    }

    public async find(filter: ResourceQueryFilterInterface<Model>, options?: FindOneOptions<Model>): Promise<Cursor> {
        const opts: FindOneOptions<any> = Object.assign({}, options)
        if (!opts.session) {
            opts.session = (await this.getConnection()).startSession()
        }

        try {
            const db = await this.getNamespace()

            await this.emit('pre:find', {repository: this, filter: filter, options: opts})
            const cursor = db.collection(this.collectionName)
                .find(filter, opts)
                .comment(this.context.requestId ? `requestId=${this.context.requestId}` : '')
            await this.emit('post:find', {repository: this, records: cursor, options: opts})

            return this.overrideCursor(cursor, opts).on('end', async () => {
                await this.emit('post:find', {repository: this, cursor: cursor, opts: opts})
            })

        } catch (err) {
            await this.emit('error:find', {repository: this, error: err, filter: filter, options: opts})
            this.log.error({error: RuntimeError.toJSON(err)})
            opts.session?.endSession()
            throw new RuntimeError().setCause(err)
        }
    }

    public async findOne(filter: ResourceQueryFilterInterface<Model>, options?: FindOneOptions<Model>): Promise<Model | null> {
        const opts: FindOneOptions<any> = Object.assign({}, options)
        if (!opts.session) {
            opts.session = (await this.getConnection()).startSession()
        }

        try {
            const db = await this.getNamespace()
            await this.emit('pre:findOne', {repository: this, filter: filter, options: opts})
            const record = await db.collection(this.collectionName).findOne(filter, opts)
            if (!record) {
                return null
            }

            const result = await this.serializer.deserialize(record)
            await this.emit('post:findOne', {repository: this, records: [result], options: opts})
            return result
        } catch (err) {
            await this.emit('error:findOne', {repository: this, error: err, filter: filter, options: opts})
            this.log.error({error: RuntimeError.toJSON(err)})
            throw new RuntimeError().setCause(err)
        } finally {
            opts.session?.endSession()
        }
    }

    public async findOneAndUpdate(filter: FilterQuery<Model>, update: UpdateQuery<Model & {updated?: Date}>, options?: FindOneAndUpdateOption<Model> & {autoCreate?: boolean}): Promise<Model> {
        const opts: FindOneAndUpdateOption<any> = Object.assign({}, options)
        if (!opts.session) {
            opts.session = (await this.getConnection()).startSession()
        }

        // todo
        // filter = serialize(filter).bind(this)

        try {
            if (!('autoCreate' in opts)) {
                // @ts-expect-error
                opts.autoCreate = true
            }

            if (update.$set) {
                update.$set = this.serializer.serialize(<Model> update.$set)
            }
            if (update.$set?.updated) { // todo
                // @ts-expect-error
                update.$set.updated = new Date()
            }
            // @ts-expect-error
            if (opts.autoCreate && update.$set?.created) {
                // @ts-expect-error
                update.$setOnInsert = {...update.$setOnInsert, created: new Date()}
                // @ts-expect-error
                delete update.$set.created
            }
            const db = await this.getNamespace()
            await this.emit('pre:findOneAndUpdate', {repository: this, filter: filter, update: update, options: opts})
            const {value} = await db.collection(this.collectionName).findOneAndUpdate(filter, update, opts)
            await this.emit('post:findOneAndUpdate', {repository: this, value: value, options: opts})

            if (value) {
                return this.serializer.deserialize(value)
            }

            return value
        } catch (err) {
            await this.emit('error:findOneAndUpdate', {repository: this, error: err, filter: filter, update: update, options: opts})
            this.log.error({error: RuntimeError.toJSON(err)})
            throw new RuntimeError().setCause(err)
        } finally {
            opts.session?.endSession()
        }
    }

    public async getCollection(): Promise<any> {
        return (await this.getNamespace()).collection(this.collectionName)
    }

    public async getConnection(): Promise<any> {
        return await this.mongodbService.getConnection(this.context)
    }

    public async getNamespace(): Promise<Db> {
        return await this.mongodbService.getDb(this.context)
    }

    public async insert(entities: Model[], options?: CollectionInsertOneOptions): Promise<InsertManyResultInterface> {
        const opts = Object.assign({}, options)
        if (!opts.session) {
            opts.session = (await this.getConnection()).startSession()
        }

        try {
            const db = await this.getNamespace()
            const records = entities.map(this.serializer.serialize.bind(this.serializer))
            await this.emit('pre:insert', {repository: this, records: records, options: opts})
            const {insertedCount, insertedIds} = await db.collection(this.collectionName).insertMany(records, opts)
            await this.emit('post:insert', {
                repository: this,
                records: records,
                insertedCount: insertedCount,
                insertedIds: insertedIds,
                options: opts,
            })
            return {insertedCount: insertedCount, insertedIds: insertedIds}
        } catch (err) {
            await this.emit('error:insert', {repository: this, error: err, options: opts})
            this.log.error({error: RuntimeError.toJSON(err)})
            throw err
        } finally {
            opts.session?.endSession()
        }
    }

    public async list(query: ResourceQueryInterface, unlimited?: boolean, options?: FindOneOptions<Model>): Promise<Omit<ResponseEnvelopeInterface, 'data'> & {data: Model[]}> {
        const opts: FindOneOptions<any> = Object.assign({}, options)
        if (!opts.session) {
            opts.session = (await this.getConnection()).startSession()
        }

        try {
            this.log.debug({
                action: 'list',
                tenant: {id: this.context.tenant.id},
                collection: this.collectionName,
                unlimited: unlimited,
                query: query,
            })

            const db = await this.getNamespace()
            await this.emit('pre:list', {repository: this, query: query, unlimited: unlimited, options: opts})
            const cursor = db.collection(this.collectionName, opts)
                .find(this.mongodbResourceQuery.makeFilter(query, this.resourceQueryMapper), opts)
            this.mongodbResourceQuery.applyFields(cursor, query)
            this.mongodbResourceQuery.applySort(cursor, query)

            if (unlimited) {
                if (query.limit) {
                    this.mongodbResourceQuery.applyLimit(cursor, query)
                }

                if (query.offset) {
                    this.mongodbResourceQuery.applySkip(cursor, query)
                }
            } else {
                this.mongodbResourceQuery.applyLimitAndSkip(cursor, query)
            }

            const [records, total] = await Promise.all([
                cursor.toArray(),
                cursor.count(false),
            ])

            opts.session?.endSession()
            await this.emit('post:list', {repository: this, records: records, total: total, options: opts})
            const data: Model[] = records.map(this.serializer.deserialize.bind(this.serializer))
            return {data: data, meta: {total: total}}
        } catch (err) {
            await this.emit('error:list', {repository: this, error: err, query: query, unlimited: unlimited, options: opts})
            this.log.error({error: RuntimeError.toJSON(err)})
            throw new RuntimeError().setCause(err)
        } finally {
            opts.session?.endSession()
        }
    }

    public async remove(filter: FilterQuery<Model>, options?: CommonOptions): Promise<RemoveManyResultInterface> {
        const opts = Object.assign({}, options)
        if (!opts.session) {
            opts.session = (await this.getConnection()).startSession()
        }

        try {
            const db = await this.getNamespace()
            // todo
            // filter = serialize(filter).bind(this)
            await this.emit('pre:remove', {repository: this, filter: filter, options: opts})
            const result = await db.collection(this.collectionName).deleteMany(filter, opts)
            await this.emit('post:remove', {repository: this, result: result, options: opts})
            const {result: {n}, deletedCount} = result
            return {deletedCount: deletedCount ?? n ?? 0}
        } catch (err) {
            await this.emit('error:remove', {repository: this, error: err, filter: filter, options: opts})
            this.log.error({error: RuntimeError.toJSON(err)})
            throw new RuntimeError().setCause(err)
        } finally {
            opts.session?.endSession()
        }
    }

    public async update(filter: FilterQuery<Model>, update: UpdateQuery<Model & {updated?: Date}>, options?: ReplaceOneOptions & {autoCreate?: boolean}): Promise<UpdateManyResultInterface> {
        const opts = Object.assign({}, options)
        if (!opts.session) {
            opts.session = (await this.getConnection()).startSession()
        }

        try {
            const db = await this.getNamespace()

            // todo
            // filter = serialize.bind(this.serializer)(filter)

            if (!('autoCreate' in opts)) {
                opts.autoCreate = true
            }

            if (update.$set) {
                update.$set = this.serializer.serialize.bind(this.serializer)(update.$set)
            }
            if (update.$set?.updated) {
                // @ts-expect-error
                update.$set.updated = new Date()
            }
            if (opts.autoCreate && update.$set?.created) {
                // @ts-expect-error
                update.$setOnInsert = {...update.$setOnInsert, created: new Date()}
                // @ts-expect-error
                delete update.$set.created
            }
            await this.emit('pre:update', {repository: this, filter: filter, update: update, options: opts})
            const {modifiedCount, upsertedCount} = await db.collection(this.collectionName)
                .updateMany(filter, update, options as UpdateOneOptions)
            await this.emit('post:update', {
                repository: this,
                filter: filter,
                update: update,
                opts: opts,
                modifiedCount: modifiedCount,
                upsertedCount: upsertedCount,
            })
            return {modifiedCount: modifiedCount, upsertedCount: upsertedCount}
        } catch (err) {
            await this.emit('error:update', {repository: this, error: err, filter: filter, update: update, options: opts})
            this.log.error({error: RuntimeError.toJSON(err)})
            throw new RuntimeError().setCause(err)
        } finally {
            opts.session?.endSession()
        }
    }

    protected overrideCursor(cursor: Cursor<Model>, options): Cursor<Model> {
        const cursorToArray = cursor.toArray
        cursor.toArray = function(callback?: MongoCallback<any[]>) {
            if (!callback) {
                return cursorToArray.call(this).then((results: any[]) => {
                    options.session.endSession()
                    return results.map(this.serializer.deserialize.bind(this.serializer))
                })
            }

            cursorToArray.call(this, (error: MongoError, records: any[]): void => {
                options.session.endSession()
                if (error) {
                    return
                }

                return callback(error, records.map(this.serializer.deserialize.bind(this.serializer)))
            })
        }

        const cursorNext = cursor.next
        // @ts-expect-error
        cursor.next = (callback: any/* MongoCallback<EntityName | null> | null */): any /* Promise<EntityName | null> | void */ => {
            if (callback) {
                return cursorNext.call(this).then((result: any) => {
                    options.session.endSession()

                    if (!result) {
                        return result
                    }

                    return this.serializer.deserialize(result)
                })
            }

            cursorNext.call(this, (error: MongoError, result: any): void => {
                options.session.endSession()

                if (error || !result) {
                    callback(error, result)
                    return
                }

                return callback(error, this.serializer.deserialize(result))
            })
        }

        return cursor
    }
}
