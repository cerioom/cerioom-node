import { Config } from '../config'
import { ConfigFeatureProviderDefInterface } from './config-feature-provider-def.interface'
import { ConfigFeatureProviderRegistry } from './config-feature-provider-registry'
import { ConfigFeatureResolver } from './config-feature-resolver'
import { ConfigFeatureProvider } from './provider/config-feature-provider'
import { Strategy } from './startegy'


describe('config-feature-resolver', () => {
    it('get provider by strategy', async () => {
        class TestProvider extends ConfigFeatureProvider {
            public async do(): Promise<any> {
                return 'done!'
            }
        }

        const config = new Config({
            'namespace': {
                'feature1': {
                    'strategy': 'first',
                    'providers': [{
                        'provider': 'testProvider',
                        'properties': {
                            'key': 'value1',
                        },
                    }, {
                        'provider': 'testProvider',
                        'properties': {
                            'key': 'value2',
                        },
                    }],
                },
                'feature2': {
                    'strategy': 'first',
                    'providers': [{
                        'provider': 'testProvider',
                        'properties': {
                            'key': 'value3',
                        },
                    }],
                },
            },
        })

        const registry = new ConfigFeatureProviderRegistry().set('testProvider', TestProvider)
        const configFeatureResolver = new ConfigFeatureResolver(config, registry)
        const provider = await configFeatureResolver.getProvider('namespace.feature1')
        expect(provider.getProperties()).toEqual({key: 'value1'})
        expect(await provider.do()).toBe('done!')
    })

    it('get provider by custom strategy', async () => {
        class TestStrategy extends Strategy {
            public async getProviderConfig(opts?: any): Promise<ConfigFeatureProviderDefInterface> {
                return this.providers[0]
            }
        }

        class TestProvider extends ConfigFeatureProvider {
            public async do(): Promise<any> {
                return 'done!'
            }
        }

        const config = new Config({
            'namespace': {
                'feature1': {
                    'strategy': (providers: ConfigFeatureProviderDefInterface[]) => new TestStrategy(providers),
                    'providers': [{
                        'provider': 'testProvider',
                        'properties': {
                            'key': 'value1',
                        },
                    }],
                },
            },
        })

        const registry = new ConfigFeatureProviderRegistry().set('testProvider', TestProvider)
        const configFeatureResolver = new ConfigFeatureResolver(config, registry)
        const provider = await configFeatureResolver.getProvider('namespace.feature1')
        expect(provider.getProperties()).toEqual({key: 'value1'})
        expect(await provider.do()).toBe('done!')
    })
})
