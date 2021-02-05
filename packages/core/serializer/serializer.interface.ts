export interface SerializerInterface<Model> {
    serialize: (data: Model) => any
    deserialize: (data: any) => Model
}
