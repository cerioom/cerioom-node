export interface RbacPermissionInterface {
    roles(): string[]

    resource(): string;

    attributes(): string[];

    granted(): boolean;

    filter(data: any): any;
}
