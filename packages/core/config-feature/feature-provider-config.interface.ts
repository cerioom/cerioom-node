export interface FeatureProviderConfigInterface {
    provider: string
    properties: {
        [key: string]: string | string[] | number | boolean | object
    }
}
