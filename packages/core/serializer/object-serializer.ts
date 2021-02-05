import { Serializer } from './serializer'


export class ObjectSerializer extends Serializer<object> {

    constructor(
        private readonly modelClass
    ) {
        super()
    }

    public serialize(data: object): any {
        return JSON.parse(JSON.stringify(data))
    }

    public deserialize(data: object): any {
        return Object.setPrototypeOf(data, this.modelClass.prototype)
    }
}
