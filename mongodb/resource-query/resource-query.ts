import { Cursor } from 'mongodb'
import { Strings } from '../../core/helper'
import { ResourceQuery, ResourceQueryInterface, ResourceQueryMapper } from '../../resource/resource-query'
import { ResourceQueryFieldsInterface, ResourceQueryFilterInterface, ResourceQuerySortInterface } from './'


export const FILTERS = {
    eq: '$eq',
    ne: '$ne',
    lt: '$lt',
    lte: '$lte',
    gt: '$gt',
    gte: '$gte',
    in: '$in',
    nin: '$nin',
    regex: '$regex',
}

export class MongodbResourceQuery extends ResourceQuery {
    public operationSignList() {
        return {
            ...super.operationSignList(),
            $eq: '=',
            $ne: '&ne;',
            $lt: '<',
            $lte: '&le;',
            $gt: '>',
            $gte: '&ge;',
            $in: '=',
            $nin: '&ne;',
            $regex: '&thickapprox;',
        }
    }


    public transformCursorByQuery(
        query: ResourceQueryInterface,
        cursor: any,
        schemaFormatter: ResourceQueryMapper = new ResourceQueryMapper({}),
        applyLimitAndSkip: boolean = true,
    ): any {
        if (query.filter) {
            cursor.filter(this.transformFilter(query.filter, schemaFormatter))
        }

        if (query.sort) {
            cursor.sort(this.transformSort(query.sort))
        }

        if (query.fields) {
            cursor.project(this.transformFields(query.fields))
        }

        if (applyLimitAndSkip) {
            this.applyLimitAndSkip(cursor, query)
        }

        return cursor
    }

    public prepareFilter(
        query: ResourceQueryInterface,
        resourceQueryMapper = new ResourceQueryMapper({}),
    ) {
        if (query.filter) {
            return this.transformFilter(query.filter, resourceQueryMapper)
        }

        return {}
    }

    public applySort(cursor: Cursor<any>, query: ResourceQueryInterface) {
        if (query.sort) {
            cursor.sort(this.transformSort(query.sort))
        }
    }

    public applyFields(cursor: Cursor<any>, query: ResourceQueryInterface) {
        if (query.fields) {
            cursor.project(this.transformFields(query.fields))
        }
    }

    public applyLimit(cursor: Cursor<any>, query: ResourceQueryInterface) {
        let limit = parseInt(<any> query.limit) || 20
        if (limit < 0) {
            limit = 1
        }

        cursor.limit(limit)
    }

    public applySkip(cursor: Cursor<any>, query: ResourceQueryInterface) {
        let offset = parseInt(<any> query.offset) || 0
        if (offset < 0) {
            offset = 0
        }

        cursor.skip(offset)
    }

    public applyLimitAndSkip(
        cursor: Cursor<any>,
        query: ResourceQueryInterface,
    ) {
        let limit = parseInt(<any> query.limit) || 20
        if (limit < 0) {
            limit = 1
        }

        if (limit > 1_000) {
            limit = 1_000
        }

        let offset = parseInt(<any> query.offset) || 0
        if (offset < 0) {
            offset = 0
        }

        cursor
            .limit(limit)
            .skip(offset)
    }

    public transformSort(sort: ResourceQuerySortInterface): Record<string, any> {
        const result = {}

        Object
            .keys(sort)
            .forEach(key => (result[key] = isNaN(Number(sort[key])) ? sort[key] : parseInt(<any> sort[key]))) // "isNaN(sort[key])" avoid parse int for ".sort( { score: { $meta: "textScore" } } )"

        return result
    }

    public transformFields(fields: ResourceQueryFieldsInterface): Record<string, any> {
        const result = {}

        Object
            .keys(fields)
            .forEach(key => (result[key] = isNaN(Number(fields[key])) ? fields[key] : parseInt(<any> fields[key]))) // "isNaN(fields[key])" avoid parse int for ".project( { score: { $meta: "textScore" } } )"

        return result
    }

    public transformFilter(filter: ResourceQueryFilterInterface, schemaFormatter: ResourceQueryMapper): Record<string, any> {
        const result = {}

        Object.entries(filter).forEach(
            ([fieldName, fieldFilters]) => {
                if (fieldName[0] === '$' || fieldFilters instanceof RegExp) {
                    // using standard mongodb operators
                    result[fieldName] = fieldFilters
                } else if (Array.isArray(fieldFilters)) {
                    result[fieldName] = {
                        $in: fieldFilters,
                    }
                } else if (typeof fieldFilters === 'string' && fieldFilters.includes(',')) {
                    result[fieldName] = {
                        $in: fieldFilters.split(',').map(Strings.trim).filter(Boolean).slice(0, 1000),
                    }
                } else if (typeof fieldFilters === 'object' && fieldFilters !== null) {
                    Object.entries(fieldFilters || {}).forEach(
                        ([fieldFilterOperator, fieldFilterValue]) => {
                            if (fieldFilterOperator in FILTERS) {
                                result[fieldName] = {
                                    ...result[fieldName],
                                    // @ts-expect-error
                                    [FILTERS[fieldFilterOperator]]: schemaFormatter.formatField(fieldFilterValue, fieldName, {logger}),
                                }
                            } else if (fieldFilterOperator === 'like') {
                                result[fieldName] = {
                                    ...result[fieldName],
                                    $regex: fieldFilterValue.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
                                    $options: 'i',
                                }
                            } else {
                                result[fieldName] = {
                                    ...result[fieldName],
                                    // @ts-expect-error
                                    [fieldFilterOperator]: schemaFormatter.formatField(fieldFilterValue, fieldName, {logger}),
                                }
                            }
                        },
                    )
                } else {
                    // @ts-expect-error
                    result[fieldName] = schemaFormatter.formatField(fieldFilters, fieldName, {logger})
                }
            },
        )

        return result
    }
}
