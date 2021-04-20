import { ConfigFeatureProviderDefInterface } from './config-feature-provider-def.interface'


export interface ConfigFeatureInterface {
    strategy: string
    providers: Array<ConfigFeatureProviderDefInterface>
}
