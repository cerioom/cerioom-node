import { ContextInterface, Util } from '@cerioom/core'
import { UnexpectedFieldTypeError } from './unexpected-field-type.error'


const regexUtcDate = /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]+)?(Z)?\b/


export type ResourceQueryMapperType<T = any> = (value: any, name: string, context: ContextInterface) => T

export const DateField: ResourceQueryMapperType<Date> = (value: any, name: string) => {
    if (value instanceof Date) {
        return value
    }

    if (regexUtcDate.test(value)) {
        return new Date(value)
    }

    throw new UnexpectedFieldTypeError()
}

export const EnumField = (expectedEnumType: any) => {
    return (value: any, name: string) => {
        if (value in expectedEnumType) {
            return value
        }

        throw new UnexpectedFieldTypeError()
    }
}

export const StringField: ResourceQueryMapperType<string> = (value: any, name: string) => {
    return String(value)
}

export const NumberField: ResourceQueryMapperType<number> = (value: any, name: string) => {
    if (typeof value === 'number' || typeof value === 'string') {
        return Number(value)
    }

    throw new UnexpectedFieldTypeError()
}

export const BooleanField: ResourceQueryMapperType<boolean> = (value: any, name: string) => {
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        value === null
    ) {
        return Util.toBoolean(value)
    }

    throw new UnexpectedFieldTypeError()
}

export type ResourceQueryPropertyType =
    typeof DateField |
    typeof EnumField |
    typeof StringField |
    typeof NumberField |
    typeof BooleanField
