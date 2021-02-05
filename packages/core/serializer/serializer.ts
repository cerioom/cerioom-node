import { SerializerInterface } from './serializer.interface'

export abstract class Serializer<Target = any> implements SerializerInterface<Target> {
    public abstract serialize(data: any): Target
    public abstract deserialize(data: Target): any
}
