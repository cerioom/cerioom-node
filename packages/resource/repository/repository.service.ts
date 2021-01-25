import { Readable } from 'stream'
import { ResponseEnvelopeInterface } from '../../core/response-envelope.interface'
import { Serializer, SerializerInterface } from '../../core/serializer'
import { FormatterInterface } from '../../core/serializer/formatter.interface'
import { ObjectFormatter } from '../../core/serializer/object.formatter'
import { Service } from '../../core/service'
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
    protected readonly serializer: SerializerInterface<M>

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

    public abstract async count(filter: FilterQuery<M>, options: CommonOptions | undefined): Promise<number>

    public abstract async export(query: ResourceQueryInterface, options: (FindOneOptions<M> & {transform?: (document: M) => any}) | undefined): Promise<Readable>

    public abstract async find(filter: FilterQuery<M>, options: FindOneOptions<M> | undefined): Promise<Readable>

    public abstract async findOne(filter: FilterQuery<M>, options: FindOneOptions<M> | undefined): Promise<M | null>

    public abstract async findOneAndUpdate(filter: FilterQuery<M>, update: UpdateQuery<M & {updated?: Date}>, options: (FindOneAndUpdateOption<M> & {autoCreate?: boolean}) | undefined): Promise<M>

    public abstract async getCollection(): Promise<any>

    public abstract async getConnection(): Promise<any>

    public abstract async getNamespace(): Promise<any>

    public abstract async insert(entities: M[], options: InsertManyOptionsInterface | undefined): Promise<InsertManyResultInterface>

    public abstract async list(query: ResourceQueryInterface, unlimited: boolean | undefined, options: FindOneOptions<M> | undefined): Promise<Omit<ResponseEnvelopeInterface, 'data'> & {data: M[]}>

    public abstract async remove(filter: FilterQuery<M>, options: CommonOptions | undefined): Promise<RemoveManyResultInterface>

    public abstract async update(filter: FilterQuery<M>, update: UpdateQuery<M & {updated?: Date}>, options: (ReplaceOneOptions & {autoCreate?: boolean}) | undefined): Promise<UpdateManyResultInterface>
}
