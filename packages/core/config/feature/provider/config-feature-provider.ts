import { Service } from '../../../service'
import { ConfigFeatureProviderInterface } from './config-feature-provider.interface'


export abstract class ConfigFeatureProvider extends Service implements ConfigFeatureProviderInterface {
    protected properties: Record<string, any>

    public constructor(opts: any) {
        super()
    }

    public abstract do(...args: any[]): Promise<any>

    public setProperties(properties: Record<string, any>): this {
        this.properties = properties
        return this
    }

    public getProperties(): Record<string, any> {
        return this.properties
    }
}
