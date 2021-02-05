import { ResourceQueryMapperType } from './resource-query-field-type'


export type ResourceQueryMapperSchema<Model> = {
    [key in keyof Model]?: ResourceQueryMapperType
}

export class ResourceQueryMapper<Model = any> {
    constructor(
        protected schema: ResourceQueryMapperSchema<Model>,
    ) {
    }

    public format(input: object): any {
        const result = {}

        for (const [key, value] of Object.entries(input)) {
            if (this.schema[key]) {
                result[key] = this.schema[key](value, key)
            } else {
                result[key] = value
            }
        }
        return result
    }

    public formatField(value: any, name: string): any {
        if (this.schema[name]) {
            return this.schema[name](value, name)
        }
        return value
    }
}
