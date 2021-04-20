export interface FeatureProviderInterface {
    setProperties(properties: Record<string, any>): this

    getProperties(): Record<string, any>
}
