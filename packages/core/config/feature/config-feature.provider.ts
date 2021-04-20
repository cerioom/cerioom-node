import { ConfigFeatureProviderInterface } from './config-feature-provider.interface'


interface ConfigFeatureProviderConstructor {
    new (opts: any): ConfigFeatureProviderInterface
    readonly prototype: ConfigFeatureProviderInterface
}

export let ConfigFeatureProvider: ConfigFeatureProviderConstructor;
