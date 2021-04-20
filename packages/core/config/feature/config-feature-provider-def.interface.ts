export interface ConfigFeatureProviderDefInterface {
    provider: string
    properties: {
        [key: string]: string | string[] | number | boolean | object
    }
}
