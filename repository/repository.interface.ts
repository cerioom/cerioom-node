import { RestqlQueryInterface, RestqlResponseInterface } from '@atriory/common/service/restql.service'
import { Cursor, FilterQuery, FindOneOptions, ReplaceOneOptions, UpdateQuery } from 'mongodb' // todo
import { InsertManyOptionsInterface } from './insert-many-options.interface'
import { InsertManyResultInterface } from './insert-many-result.interface'
import { UpdateManyResultInterface } from './update-many-result.interface'


export interface RepositoryInterface<Model> {
    getDb: () => any
    create: (entities: Model[], options?: InsertManyOptionsInterface) => Promise<InsertManyResultInterface>
    findOne: (filter: FilterQuery<Model>, options?: FindOneOptions<Model>) => Promise<Model | null>
    find: (filter: FilterQuery<Model>, options?: FindOneOptions<Model>) => Promise<Cursor<Model>>
    list: (query: RestqlQueryInterface, unlimited?: boolean, options?: FindOneOptions<Model>) => Promise<Omit<RestqlResponseInterface, 'data'> & {data: Model[]}>
    export: (query: RestqlQueryInterface, options?: FindOneOptions<Model> & {transform?: (document: Model) => any}) => Promise<Cursor>
    update: (filter: FilterQuery<Model>, update: UpdateQuery<Model & {updated?: Date}>, options?: ReplaceOneOptions & {autoCreate?: boolean}) => Promise<UpdateManyResultInterface>
}
