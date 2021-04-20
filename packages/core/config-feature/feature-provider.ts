import { FeatureProviderInterface } from './feature-provider.interface'


interface FeatureProviderConstructor {
    new (opts: any): FeatureProviderInterface
    readonly prototype: FeatureProviderInterface
}

export let FeatureProvider: FeatureProviderConstructor;
