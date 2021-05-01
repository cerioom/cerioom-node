import { RuntimeError } from '../../error'
import { ConfigFeatureProviderDefInterface, ConfigInterface } from '../index'
import { ConfigFeatureProviderRegistry } from './config-feature-provider-registry'
import { ConfigFeatureInterface } from './config-feature.interface'
import { ConfigFeatureProviderInterface } from './provider/config-feature-provider.interface'
import { FirstStrategy, LastStrategy, RandomStrategy, StrategyInterface } from './startegy'


/**
 * **Example:**
 * ```ts
 * class TestProvider extends ConfigFeatureProvider {
 *     public async do(): Promise<any> {
 *         return 'done!'
 *     }
 * }
 *
 * const config = new Config({
 *     "namespace": {
 *         "feature1": {
 *             // ConfigFeatureInterface
 *             "strategy": "first", // random|first|last|fallback|roundrobin
 *             "providers": [{
 *                 // ConfigFeatureProviderDefInterface
 *                 "provider": "testProvider", // LoggerProvider|
 *                 "properties": {
 *                     "key": "value1" // string|array|boolean|number
 *                 }
 *             }]
 *         }
 *     }
 * })
 * const registry = new ConfigFeatureProviderRegistry().set('testProvider', TestProvider)
 * const configFeatureResolver = new ConfigFeatureResolver(config, registry)
 * const provider = await configFeatureResolver.getProvider('namespace.feature1')
 * provider.getProperties() // {key: 'value1'}
 * await provider.do() // 'done!'
 * ```
 */
export class ConfigFeatureResolver {
    public constructor(
        protected config: ConfigInterface,
        protected registry: ConfigFeatureProviderRegistry,
    ) {
    }

    public async getProviderConfig(key: string, opts?: any): Promise<ConfigFeatureProviderDefInterface> {
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
                if (typeof featureConfig.strategy === 'function') {
                    try {
                        strategy = featureConfig.strategy(featureConfig.providers)
                    } catch (e) {
                        throw new RuntimeError(`Unknown feature strategy "${featureConfig.strategy}"`).setCause(e)
                    }
                } else {
                    throw new RuntimeError(`Unknown feature strategy "${featureConfig.strategy}"`)
                }
        }

        const providerConfig = await strategy.getProviderConfig(opts)
        if (providerConfig === null) {
            throw new RuntimeError('Provider config not found')
        }
        return providerConfig
    }

    public async getProvider(key: string, opts?: any): Promise<ConfigFeatureProviderInterface> {
        const providerConfig = await this.getProviderConfig(key, opts)

        const featureProviderClass = this.registry.get(providerConfig.provider)
        if (!featureProviderClass) {
            throw new RuntimeError('Provider was not registered')
        }

        const featureProvider = new featureProviderClass(opts)
        featureProvider.setProperties(providerConfig.properties)

        return featureProvider
    }
}
