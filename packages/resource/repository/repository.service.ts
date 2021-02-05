import { FormatterInterface, ObjectFormatter, ResponseEnvelopeInterface, Serializer, SerializerInterface, Service } from '@cerioom/core'
import { Readable } from 'stream'
import { ResourceQueryInterface } from '../resource-query'
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


export abstract class Repository<M> extends Service implements RepositoryInterface<M> {
    protected readonly modelClass: any
    protected serializer: SerializerInterface<M>

    protected constructor(opts: {modelClass: any, formatter?: FormatterInterface}) {
        super()

        if (!opts.modelClass) {
            throw new Error('Model was not defined')
        }

        this.modelClass = opts.modelClass
        const formatter = opts.formatter ?? new ObjectFormatter(this.modelClass)
        this.serializer = new Serializer(formatter)

        this.emit('constructed', {repository: this, modelClass: this.modelClass})
    }

    public abstract count(filter: FilterQuery<M>, options: CommonOptions | undefined): Promise<number>

    public abstract export(query: ResourceQueryInterface, options: (FindOneOptions<M> & {transform?: (document: M) => any}) | undefined): Promise<Readable>

    public abstract find(filter: FilterQuery<M>, options: FindOneOptions<M> | undefined): Promise<Readable>

    public abstract findOne(filter: FilterQuery<M>, options: FindOneOptions<M> | undefined): Promise<M | null>

    public abstract findOneAndUpdate(filter: FilterQuery<M>, update: UpdateQuery<M & {updated?: Date}>, options: (FindOneAndUpdateOption<M> & {autoCreate?: boolean}) | undefined): Promise<M>

    public abstract getCollection(): Promise<any>

    public abstract getConnection(): Promise<any>

    public abstract getNamespace(): Promise<any>

    public abstract insert(entities: M[], options: InsertManyOptionsInterface | undefined): Promise<InsertManyResultInterface>

    public abstract list(query: ResourceQueryInterface, unlimited: boolean | undefined, options: FindOneOptions<M> | undefined): Promise<Omit<ResponseEnvelopeInterface, 'data'> & {data: M[]}>

    public abstract remove(filter: FilterQuery<M>, options: CommonOptions | undefined): Promise<RemoveManyResultInterface>

    public abstract update(filter: FilterQuery<M>, update: UpdateQuery<M & {updated?: Date}>, options: (ReplaceOneOptions & {autoCreate?: boolean}) | undefined): Promise<UpdateManyResultInterface>
}
