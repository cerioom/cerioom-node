import { FormatterInterface } from './formatter.interface'


export class ObjectFormatter implements FormatterInterface<object> {

    constructor(private readonly modelClass) {
    }

    public serialize(data: object): any {
        return JSON.parse(JSON.stringify(data))
    }

    public deserialize(data: object): any {
        return Object.setPrototypeOf(data, this.modelClass.prototype)
    }
}
