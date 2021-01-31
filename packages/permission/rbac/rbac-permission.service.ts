import { RbacPermissionServiceInterface } from './rbac-permission-service.interface'
import { RbacPermissionInterface } from './rbac-permission.interface'


export abstract class RbacPermissionService implements RbacPermissionServiceInterface {
    public abstract permission(roles: string[], resource: string, action?: string, data?: object): Promise<RbacPermissionInterface>

    public abstract toJSON(permission: RbacPermissionInterface): any

    public abstract toString(permission: RbacPermissionInterface): string
}
