import { UpdateQuery } from 'mongodb'
import { ResourceQueryFilterInterface } from '../../resource/resource-query'

export { ResourceQueryFilterInterface, ResourceQueryFilterOperatorInterface } from '../../resource/resource-query'

export interface ResourceQuerySortInterface {
    [field: string]: number | {$meta: string}
}

export interface ResourceQueryFieldsInterface {
    [field: string]: number | {$meta: string}
}

export interface UpdateInterface<P = any> {
    filter: ResourceQueryFilterInterface<P>
    payload: UpdateQuery<P>
    limit?: number
    offset?: number
}
