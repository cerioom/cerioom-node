import { ConfigInterface } from '../config'
import { RuntimeError } from '../error'
import { FeatureProviderRegistry } from './feature-provider-registry'
import { FeatureProviderInterface } from './feature-provider.interface'
import { FeatureInterface } from './feature.interface'
import { FeatureStrategyInterface } from './startegy/feature-strategy.interface'
import { FirstFeatureStrategy } from './startegy/first-feature-strategy'
import { LastFeatureStrategy } from './startegy/last-feature-strategy'
import { RandomFeatureStrategy } from './startegy/random-feature-strategy'


export class FeatureResolver {
    public constructor(
        protected config: ConfigInterface,
        protected registry: FeatureProviderRegistry,
    ) {
    }

    public resolve(key: string, opts?: any): FeatureProviderInterface {
        const featureConfig = this.config.get<FeatureInterface>(key)
        if (!featureConfig) {
            throw new RuntimeError(`Feature config not found by key "${key}"`)
        }

        let strategy: FeatureStrategyInterface
        switch (featureConfig.strategy) {
            case 'random':
                strategy = new RandomFeatureStrategy(featureConfig.providers)
                break
            case 'first':
                strategy = new FirstFeatureStrategy(featureConfig.providers)
                break
            case 'last':
                strategy = new LastFeatureStrategy(featureConfig.providers)
                break
            default:
                throw new RuntimeError('Unknown feature strategy')
        }

        const providerConfig = strategy.getProviderConfig(opts)
        if (providerConfig === null) {
            throw new RuntimeError('Provider config not found')
        }

        const featureProviderClass = this.registry.get(providerConfig.provider)
        if (!featureProviderClass) {
            throw new RuntimeError('Provider was not registered')
        }

        const featureProvider = new featureProviderClass(opts)
        featureProvider.setProperties(providerConfig.properties)

        return featureProvider
    }
}
