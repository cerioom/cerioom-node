import { RuntimeError } from '../../../error'
import { ConfigFeatureProviderDefInterface } from '../config-feature-provider-def.interface'
import { StrategyInterface } from './strategy.interface'


export abstract class Strategy implements StrategyInterface {

    constructor(
        protected providers: Array<ConfigFeatureProviderDefInterface>,
    ) {
    }

    public getProviderConfig(opts?: any): ConfigFeatureProviderDefInterface {
        throw new RuntimeError('Not Implemented')
    }
}
