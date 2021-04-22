export interface ConfigFeatureProviderInterface {
    setProperties(properties: Record<string, any>): this

    getProperties(): Record<string, any>

    do(...args: any[]): Promise<any>
}
