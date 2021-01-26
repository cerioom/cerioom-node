import { ResourceQueryFilterInterface } from '@cerioom/resource'
import { UpdateQuery } from 'mongodb'


export { ResourceQueryFilterInterface, ResourceQueryFilterOperatorInterface } from '@cerioom/resource'

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
