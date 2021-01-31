import { RbacPermissionInterface } from './rbac-permission.interface'


export interface RbacPermissionServiceInterface {
    permission(roles: string[], resource: string, action?: string, data?: object): Promise<RbacPermissionInterface>

    toJSON(permission: RbacPermissionInterface): any

    toString(permission: RbacPermissionInterface): string
}
