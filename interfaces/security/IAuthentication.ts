// User authentication interface

interface IAuthentication {
    login(user: any): Promise<any>;
    logout(user: any): Promise<any>;
    register(user: any): Promise<any>;
    resetPassword(user: any): Promise<any>;
    changePassword(user: any): Promise<any>;
}
