import { ResourceQueryPropertyType } from './resource-query-field-type'


export function ResourceQueryField(options: {type: ResourceQueryPropertyType}): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol): void => {
        // todo
    }
}
