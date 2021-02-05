import { SerializerInterface } from './serializer.interface'

export abstract class Serializer<Model = any> implements SerializerInterface<Model> {
    public abstract serialize(data: Model): any
    public abstract deserialize(data: any): Model
}
