import { Class } from '../../types'
import { ConfigFeatureProvider } from './provider/config-feature-provider'


export class ConfigFeatureProviderRegistry extends Map<string, Class<ConfigFeatureProvider>> {
}
