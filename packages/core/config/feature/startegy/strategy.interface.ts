import { ConfigFeatureProviderDefInterface } from '../config-feature-provider-def.interface'


export interface StrategyInterface {
    getProviderConfig(opts?: any): Promise<ConfigFeatureProviderDefInterface>
}
