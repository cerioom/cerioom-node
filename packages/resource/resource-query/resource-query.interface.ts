export interface ResourceQueryFilterOperatorInterface {
    eq?: string | number | Date | RegExp
    ne?: string | number | Date
    lt?: string | number | Date
    lte?: string | number | Date
    gt?: string | number | Date
    gte?: string | number | Date
    in?: Array<string | number | Date>
    nin?: Array<string | number | Date>
    like?: string
    regexp?: string
}

export type ResourceQueryFilterInterface<P = any> = {
    [T in keyof P]?: ResourceQueryFilterOperatorInterface | string | number | string[] | number[] | boolean | Date | RegExp | null
}

export interface ResourceQuerySortInterface {
    [field: string]: number
}

export interface ResourceQueryFieldsInterface {
    [field: string]: number
}

export interface ResourceQueryInterface<P = any> {
    fields?: ResourceQueryFieldsInterface
    filter?: ResourceQueryFilterInterface<P> | null
    sort?: ResourceQuerySortInterface
    limit?: number
    offset?: number

    [index: string]: any
}

export interface UpdateInterface<P = any> {
    filter: ResourceQueryFilterInterface<P>
    body: any
    limit?: number
    offset?: number
}
