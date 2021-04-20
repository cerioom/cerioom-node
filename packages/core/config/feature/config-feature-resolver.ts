import { RuntimeError } from '../../error'
import { ConfigInterface } from '../index'
import { ConfigFeatureProviderRegistry } from './config-feature-provider.registry'
import { ConfigFeatureProviderInterface } from './config-feature-provider.interface'
import { ConfigFeatureInterface } from './config-feature.interface'
import { StrategyInterface, FirstStrategy, LastStrategy, RandomStrategy } from './startegy'


export class ConfigFeatureResolver {
    public constructor(
        protected config: ConfigInterface,
        protected registry: ConfigFeatureProviderRegistry,
    ) {
    }

    public resolve(key: string, opts?: any): ConfigFeatureProviderInterface {
        const featureConfig = this.config.get<ConfigFeatureInterface>(key)
        if (!featureConfig) {
            throw new RuntimeError(`Feature config not found by key "${key}"`)
        }

        let strategy: StrategyInterface
        switch (featureConfig.strategy) {
            case 'random':
                strategy = new RandomStrategy(featureConfig.providers)
                break
            case 'first':
                strategy = new FirstStrategy(featureConfig.providers)
                break
            case 'last':
                strategy = new LastStrategy(featureConfig.providers)
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
