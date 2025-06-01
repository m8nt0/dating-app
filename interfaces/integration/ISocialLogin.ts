// Social media authentication interface

interface ISocialLogin {
    login(user: any): Promise<any>;
    logout(user: any): Promise<any>;
}
