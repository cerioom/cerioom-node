import { Strings } from '@cerioom/core'
import { ResourceQuery, ResourceQueryInterface, ResourceQueryMapper } from '@cerioom/resource'
import { Cursor } from 'mongodb'
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


    public buildCursorByQuery(
        query: ResourceQueryInterface,
        cursor: any,
        resourceQueryMapper: ResourceQueryMapper = new ResourceQueryMapper({}),
        applyLimitAndSkip = true,
    ): any {
        if (query.filter) {
            cursor.filter(this.buildFilter(query.filter, resourceQueryMapper))
        }

        if (query.sort) {
            cursor.sort(this.buildSort(query.sort))
        }

        if (query.fields) {
            cursor.project(this.buildFields(query.fields))
        }

        if (applyLimitAndSkip) {
            this.applyLimitAndSkip(cursor, query)
        }

        return cursor
    }

    public makeFilter(
        query: ResourceQueryInterface,
        resourceQueryMapper = new ResourceQueryMapper({}),
    ) {
        if (query.filter) {
            return this.buildFilter(query.filter, resourceQueryMapper)
        }

        return {}
    }

    public applySort(cursor: Cursor<any>, query: ResourceQueryInterface) {
        if (query.sort) {
            cursor.sort(this.buildSort(query.sort))
        }
    }

    public applyFields(cursor: Cursor<any>, query: ResourceQueryInterface) {
        if (query.fields) {
            cursor.project(this.buildFields(query.fields))
        }
    }

    public applyLimit(cursor: Cursor<any>, query: ResourceQueryInterface) {
        let limit = parseInt(<any> query.limit, 10) || 20
        if (limit < 0) {
            limit = 1
        }

        cursor.limit(limit)
    }

    public applySkip(cursor: Cursor<any>, query: ResourceQueryInterface) {
        let offset = parseInt(<any> query.offset, 10) || 0
        if (offset < 0) {
            offset = 0
        }

        cursor.skip(offset)
    }

    public applyLimitAndSkip(
        cursor: Cursor<any>,
        query: ResourceQueryInterface,
    ) {
        let limit = parseInt(<any> query.limit, 10) || 20
        if (limit < 0) {
            limit = 1
        }

        if (limit > 1_000) {
            limit = 1_000
        }

        let offset = parseInt(<any> query.offset, 10) || 0
        if (offset < 0) {
            offset = 0
        }

        cursor
            .limit(limit)
            .skip(offset)
    }

    public buildSort(sort: ResourceQuerySortInterface): Record<string, any> {
        const result = {}

        Object
            .keys(sort)
            .forEach(key => (result[key] = isNaN(Number(sort[key])) ? sort[key] : parseInt(<any> sort[key], 10)))

        return result
    }

    public buildFields(fields: ResourceQueryFieldsInterface): Record<string, any> {
        const result = {}

        Object
            .keys(fields)
            .forEach(key => (result[key] = isNaN(Number(fields[key])) ? fields[key] : parseInt(<any> fields[key], 10)))

        return result
    }

    public buildFilter(filter: ResourceQueryFilterInterface, resourceQueryMapper: ResourceQueryMapper): Record<string, any> {
        const result = {}

        Object
            .entries(filter)
            .filter(([field]) => resourceQueryMapper.has(field))
            .forEach(
                ([field, filters]) => {
                    if (field[0] === '$' || filters instanceof RegExp) {
                        // using standard mongodb operators
                        result[field] = filters
                    } else if (Array.isArray(filters)) {
                        result[field] = {
                            $in: filters,
                        }
                    } else if (typeof filters === 'string' && filters.includes(',')) {
                        result[field] = {
                            $in: filters.split(',').map(Strings.trim).filter(Boolean).slice(0, 1000),
                        }
                    } else if (typeof filters === 'object' && filters !== null) {
                        Object.entries(filters || {}).forEach(
                            ([operator, value]) => {
                                if (operator in FILTERS) {
                                    result[field] = {
                                        ...result[field],
                                        [FILTERS[operator]]: resourceQueryMapper.formatField(value, field),
                                    }
                                } else if (operator === 'like') {
                                    result[field] = {
                                        ...result[field],
                                        $regex: value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
                                        $options: 'i',
                                    }
                                } else {
                                    result[field] = {
                                        ...result[field],
                                        [operator]: resourceQueryMapper.formatField(value, field),
                                    }
                                }
                            },
                        )
                    } else {
                        result[field] = resourceQueryMapper.formatField(filters, field)
                    }
                },
            )

        return result
    }
}
