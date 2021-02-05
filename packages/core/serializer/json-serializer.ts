import { Serializer } from './serializer'


export class JsonSerializer<Model> extends Serializer<Model> {

    constructor(private readonly options: {
        reviver?: (key: any, value: any) => any
        replacer?: (key: string, value: any) => any
        space?: number
    } = {}) {
        super()
    }

    public serialize(data: Model): string {
        return JSON.stringify(data, this.options.replacer, this.options.space)
    }

    public deserialize(data: string): Model {
        return JSON.parse(data, this.options.reviver)
    }
}
