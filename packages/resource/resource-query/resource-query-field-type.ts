import { Util } from '@cerioom/core'
import { UnexpectedFieldTypeError } from './unexpected-field-type.error'


const regexUtcDate = /\b[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]+)?(Z)?\b/


export type ResourceQueryMapperType<T = any> = (value: any, name: string) => T

export const DateField: ResourceQueryMapperType<Date> = (value: any, name: string) => {
    if (value instanceof Date) {
        return value
    }

    if (regexUtcDate.test(value)) {
        return new Date(value)
    }

    throw new UnexpectedFieldTypeError().setData({name: name, value: value})
}

export const DateArrayField: ResourceQueryMapperType<Date[]> = (value: any[], name: string) => {
    return value.map(v => DateField(v, name))
}


export const EnumField = (expectedEnumType: any) => {
    return (value: any, name: string) => {
        if (value in expectedEnumType) {
            return value
        }

        throw new UnexpectedFieldTypeError().setData({name: name, value: value})
    }
}

export const EnumArrayField = (expectedEnumType: any) => {
    return (value: any, name: string) => {
        return value.map(v => {
            if (v in expectedEnumType) {
                return v
            }

            throw new UnexpectedFieldTypeError().setData({name: name, value: v})
        })
    }
}


export const StringField: ResourceQueryMapperType<string> = (value: any, name: string) => {
    return String(value)
}

export const StringArrayField: ResourceQueryMapperType<string[]> = (value: any[], name: string) => {
    return value.map(v => StringField(v, name))
}


export const NumberField: ResourceQueryMapperType<number> = (value: any, name: string) => {
    if (typeof value === 'number' || typeof value === 'string') {
        return Number(value)
    }

    throw new UnexpectedFieldTypeError().setData({name: name, value: value})
}

export const NumberArrayField: ResourceQueryMapperType<number[]> = (value: any[], name: string) => {
    return value.map(v => NumberField(v, name))
}


export const BooleanField: ResourceQueryMapperType<boolean> = (value: any, name: string) => {
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        value === null
    ) {
        return Util.toBoolean(value)
    }

    throw new UnexpectedFieldTypeError().setData({name: name, value: value})
}

export const BooleanArrayField: ResourceQueryMapperType<boolean[]> = (value: any[], name: string) => {
    return value.map(v => BooleanField(v, name))
}

export type ResourceQueryPropertyType =
    typeof DateField |
    typeof DateArrayField |
    typeof EnumField |
    typeof EnumArrayField |
    typeof StringField |
    typeof StringArrayField |
    typeof NumberField |
    typeof NumberArrayField |
    typeof BooleanField |
    typeof BooleanArrayField
