import { Serializer } from './serializer'


export class ObjectSerializer<Model> extends Serializer<Model> {

    constructor(
        private readonly modelClass
    ) {
        super()
    }

    public serialize(data: Model): object {
        return JSON.parse(JSON.stringify(data))
    }

    public deserialize(data: object): Model {
        return Object.setPrototypeOf(data, this.modelClass.prototype)
    }
}
