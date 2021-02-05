import { Serializer } from './serializer'


export class JsonSerializer extends Serializer<string> {

    constructor(private readonly options: {
        reviver?: (key: any, value: any) => any
        replacer?: (key: string, value: any) => any
        space?: number
    } = {}) {
        super()
    }

    public serialize(data: any) {
        return JSON.stringify(data, this.options.replacer, this.options.space)
    }

    public deserialize(data: string): any {
        return JSON.parse(data, this.options.reviver)
    }
}
