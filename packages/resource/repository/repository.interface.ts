import { ResponseEnvelopeInterface, SerializerInterface, ServiceInterface } from '@cerioom/core'
import { Readable } from 'stream'
import { ResourceQueryInterface } from '../resource-query'
import { InsertManyOptionsInterface } from './insert-many-options.interface'
import { InsertManyResultInterface } from './insert-many-result.interface'
import { RemoveManyResultInterface } from './remove-many-result.interface'
import { UpdateManyResultInterface } from './update-many-result.interface'


export type FilterQuery<T> = { [P in keyof T]?: any } & {[key: string]: any}
export type UpdateQuery<T> = { [P in keyof T]?: any } & {[key: string]: any}

export interface CommonOptions {
    [key: string]: any
}

export interface ReplaceOneOptions {
    [key: string]: any
}

export interface FindOneOptions<T> {
    [key: string]: { [P in keyof T]: any }
}

export interface FindOneAndUpdateOption<T> {
    [key: string]: { [P in keyof T]: any }
}


export interface RepositoryInterface<Model> extends ServiceInterface {
    // todo new (opts: {modelClass: any, serializer?: SerializerInterface<Model>, resourceQueryMapper?: ResourceQueryMapper}): RepositoryInterface<Modelodel>
    getModelClass: () => any
    getConnection: () => Promise<any>
    getNamespace: () => Promise<any>
    getCollection: () => Promise<any>
    getSerializer: () => SerializerInterface<Model>
    insert: (entities: Model[], options?: InsertManyOptionsInterface) => Promise<InsertManyResultInterface>
    findOne: (filter: FilterQuery<Model>, options?: FindOneOptions<Model>) => Promise<Model | null>
    find: (filter: FilterQuery<Model>, options?: FindOneOptions<Model>) => Promise<Readable>
    list: (query: ResourceQueryInterface, unlimited?: boolean, options?: FindOneOptions<Model>) => Promise<Omit<ResponseEnvelopeInterface, 'data'> & {data: Model[]}>
    export: (query: ResourceQueryInterface, options?: FindOneOptions<Model> & {transform?: (document: Model) => any}) => Promise<Readable>
    count: (filter: FilterQuery<Model>, options?: CommonOptions) => Promise<number>
    update: (filter: FilterQuery<Model>, update: UpdateQuery<Model & {updated?: Date}>, options?: ReplaceOneOptions & {autoCreate?: boolean}) => Promise<UpdateManyResultInterface>
    findOneAndUpdate: (filter: FilterQuery<Model>, update: UpdateQuery<Model & {updated?: Date}>, options?: FindOneAndUpdateOption<Model> & {autoCreate?: boolean}) => Promise<Model>
    remove: (filter: FilterQuery<Model>, options?: CommonOptions) => Promise<RemoveManyResultInterface>
}
