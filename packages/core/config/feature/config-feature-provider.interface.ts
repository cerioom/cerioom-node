export interface ConfigFeatureProviderInterface {
    setProperties(properties: Record<string, any>): this

    getProperties(): Record<string, any>
}
