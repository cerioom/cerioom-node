import { ResourceQueryMapperType } from './resource-query-field-type'


export type ResourceQueryMapperSchema<Model> = {
    [key in keyof Model]?: ResourceQueryMapperType
}

export class ResourceQueryMapper<Model = any> {
    constructor(
        protected schema: ResourceQueryMapperSchema<Model>,
    ) {
    }

    public has(field: string): boolean {
        return field in this.schema
    }

    public format(input: object): any {
        const result = {}

        for (const [field, value] of Object.entries(input)) {
            if (this.schema[field]) {
                result[field] = this.schema[field](value, field)
            } else {
                result[field] = value
            }
        }
        return result
    }

    public formatField(value: any, field: string): any {
        if (this.schema[field]) {
            return this.schema[field](value, field)
        }
        return value
    }
}
