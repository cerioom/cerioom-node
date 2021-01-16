import { FormatterInterface } from './formatter.interface'
import { SerializerInterface } from './serializer.interface'


export class Serializer<Target = any> implements SerializerInterface<Target> {
    // private _normalizer: DataNormalizer
    private readonly _formatter: FormatterInterface

    constructor(formatter: FormatterInterface<Target>/* , normalizer?: DataNormalizer */) {
        // this.normalizer = normalizer
        this._formatter = formatter
    }

    // set normalizer(normalizer: DataNormalizer) {
    //     this._normalizer = normalizer
    // }
    //
    // get normalizer() {
    //     return this._normalizer
    // }

    public getFormatter() {
        return this._formatter
    }

    public serialize(data: any): Target {
        return this._formatter.serialize(/* this.normalizer ? this.normalizer.normalize(data) : */ data)
    }

    public deserialize(data: Target) {
        const deserialized = this._formatter.deserialize(data)
        return /* this.normalizer ? this.normalizer.denormalize(deserialized) : */deserialized
    }
}
