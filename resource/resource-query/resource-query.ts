import { Strings } from '../../core/helper'
import { ResourceQueryInterface } from './resource-query.interface'


export class ResourceQuery implements ResourceQueryInterface {

    public flatten(filter: any): object[] {
        let fields = []
        for (const field of Object.keys(filter)) {
            fields = fields.concat(this.parseOneElement(field, filter[field]))
        }

        return fields
    }

    public getOperationSign(op: string) {
        return this.operationSignList()[op]
    }

    protected parseOneElement(field, value): any {
        if (typeof value === 'boolean') {
            return [{
                field,
                op: this.getOperationSign('eq'),
                value: String(value),
                type: 'boolean',
            }]
        } else if (Array.isArray(value)) {
            return [{
                field,
                op: this.getOperationSign('eq'),
                value: value.join(', '),
                type: 'array',
            }]
        } else if (Strings.isDate(value)) {
            const d = new Date(value)
            const hours = d.getHours()
            const minutes = d.getMinutes()
            const month = d.getMonth() + 1
            const day = d.getDate()
            const YYYY = d.getFullYear()
            const MM = month > 9 ? month : `0${month}`
            const DD = day > 9 ? day : `0${day}`
            const HH = hours > 9 ? hours : `0${hours}`
            const mm = minutes > 9 ? minutes : `0${minutes}`
            const format = (['0000', '2359'].includes(`${HH}${mm}`)) ? `${YYYY}-${MM}-${DD}` : `${YYYY}-${MM}-${DD} ${HH}:${mm}`
            return [{
                field,
                op: this.getOperationSign('eq'),
                value: format,
                type: 'date',
            }]
        } else if (Number.isInteger(Number(value))) {
            return [{
                field,
                op: this.getOperationSign('eq'),
                value: String(value),
                type: 'number',
            }]
        } else if (typeof value !== 'string' && Object.keys(value).length) {
            const fields: any[] = []
            for (const op of Object.keys(value)) {
                const res = this.parseOneElement(op, value[op])
                for (const row of res) {
                    fields.push({field, op: this.getOperationSign(op), value: row.value, type: row.type})
                }
            }
            return fields
        } else {
            return [{
                field,
                op: this.getOperationSign('eq'),
                value: String(value),
                type: 'string',
            }]
        }
    }

    protected operationSignList(): Record<string, string> {
        return {
            eq: '=',
            ne: '&ne;',
            lt: '<',
            lte: '&le;',
            gt: '>',
            gte: '&ge;',
            nin: '&ne;',
            in: '=',
            regex: '&thickapprox;',
            like: '&thickapprox;',
        }
    }
}
