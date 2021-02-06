import { ObjectSerializer, ResponseEnvelopeInterface, SerializerInterface, Service } from '@cerioom/core'
import { Readable } from 'stream'
import { ResourceQueryInterface, ResourceQueryMapper } from '../resource-query'
import { InsertManyOptionsInterface } from './insert-many-options.interface'
import { InsertManyResultInterface } from './insert-many-result.interface'
import { RemoveManyResultInterface } from './remove-many-result.interface'
import {
    CommonOptions,
    FilterQuery,
    FindOneAndUpdateOption,
    FindOneOptions,
    ReplaceOneOptions,
    RepositoryInterface,
    UpdateQuery,
} from './repository.interface'
import { UpdateManyResultInterface } from './update-many-result.interface'

export type RepositoryConstructorOptions<Model> = {modelClass: any, serializer?: SerializerInterface<Model>, resourceQueryMapper?: ResourceQueryMapper}

export abstract class Repository<Model> extends Service implements RepositoryInterface<Model> {
    protected readonly modelClass: any
    protected serializer: SerializerInterface<Model>
    protected resourceQueryMapper?: ResourceQueryMapper

    protected constructor(opts: RepositoryConstructorOptions<Model>) {
        super()

        this.modelClass = opts.modelClass
        if (!this.modelClass) {
            throw new Error('Model was not defined')
        }

        if (typeof opts.modelClass.getResourceQueryMapper === 'function') {
            this.resourceQueryMapper = opts.modelClass.getResourceQueryMapper()
        } else if (opts.resourceQueryMapper) {
            this.resourceQueryMapper = opts.resourceQueryMapper
        } else {
            this.resourceQueryMapper = new ResourceQueryMapper()
        }

        if (typeof opts.modelClass.getSerializer === 'function') {
            this.serializer = opts.modelClass.getSerializer()
        } else if (opts.serializer) {
            this.serializer = opts.serializer
        } else {
            this.serializer = new ObjectSerializer<Model>(this.modelClass)
        }

        this.emit('constructed', {repository: this, modelClass: this.modelClass})
    }

    public abstract count(filter: FilterQuery<Model>, options: CommonOptions | undefined): Promise<number>

    public abstract export(query: ResourceQueryInterface, options: (FindOneOptions<Model> & {transform?: (document: Model) => any}) | undefined): Promise<Readable>

    public abstract find(filter: FilterQuery<Model>, options: FindOneOptions<Model> | undefined): Promise<Readable>

    public abstract findOne(filter: FilterQuery<Model>, options: FindOneOptions<Model> | undefined): Promise<Model | null>

    public abstract findOneAndUpdate(filter: FilterQuery<Model>, update: UpdateQuery<Model & {updated?: Date}>, options: (FindOneAndUpdateOption<Model> & {autoCreate?: boolean}) | undefined): Promise<Model>

    public abstract getCollection(): Promise<any>

    public abstract getConnection(): Promise<any>

    public abstract getNamespace(): Promise<any>

    // todo public abstract insertOne(entity: Model, options: InsertOneOptionsInterface | undefined): Promise<InsertOneResultInterface<Model>>

    public abstract insert(entities: Model[], options: InsertManyOptionsInterface | undefined): Promise<InsertManyResultInterface>

    public abstract list(query: ResourceQueryInterface, unlimited: boolean | undefined, options: FindOneOptions<Model> | undefined): Promise<Omit<ResponseEnvelopeInterface, 'data'> & {data: Model[]}>

    public abstract remove(filter: FilterQuery<Model>, options: CommonOptions | undefined): Promise<RemoveManyResultInterface>

    public abstract update(filter: FilterQuery<Model>, update: UpdateQuery<Model & {updated?: Date}>, options: (ReplaceOneOptions & {autoCreate?: boolean}) | undefined): Promise<UpdateManyResultInterface>
}
