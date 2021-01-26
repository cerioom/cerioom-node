import { ContextInterface } from '@cerioom/core'
import { ResourceQueryMapperType } from './resource-query-field-type'


export type ResourceQueryMapperSchema<Model> = {
    [key in keyof Model]?: ResourceQueryMapperType
}

export class ResourceQueryMapper<Model = any> {
    constructor(
        protected schema: ResourceQueryMapperSchema<Model>,
    ) {
    }

    public format(input: object, ctx: ContextInterface): any {
        const result = {}

        for (const [key, value] of Object.entries(input)) {
            if (this.schema[key]) {
                result[key] = this.schema[key](value, key, ctx)
            } else {
                result[key] = value
            }
        }
        return result
    }

    public formatField(value: any, name: string, ctx: ContextInterface): any {
        if (this.schema[name]) {
            return this.schema[name](value, name, ctx)
        }
        return value
    }
}
