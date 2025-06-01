// Access control interface

interface IAuthorization {
    authorize(user: any): Promise<any>;
    getUserRole(user: any): Promise<string>;
    getUserPermissions(user: any): Promise<string[]>;
    getUserGroups(user: any): Promise<string[]>;
    getUserAccessLevel(user: any): Promise<string>;
    getUserAccessHistory(user: any): Promise<string[]>;
    getUserAccessStatus(user: any): Promise<string>;
}

