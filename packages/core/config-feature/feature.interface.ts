import { FeatureProviderConfigInterface } from './feature-provider-config.interface'


export interface FeatureInterface {
    strategy: string
    providers: Array<FeatureProviderConfigInterface>
}
