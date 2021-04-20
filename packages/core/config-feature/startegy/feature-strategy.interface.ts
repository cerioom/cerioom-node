import { FeatureProviderConfigInterface } from '../feature-provider-config.interface'


export interface FeatureStrategyInterface {
    getProviderConfig(opts?: any): FeatureProviderConfigInterface
}
