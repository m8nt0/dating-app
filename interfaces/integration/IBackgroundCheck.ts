// Identity verification service interface

interface IIdentityVerification {
    verifyIdentity(user: any): Promise<any>;
    getIdentityVerification(id: any): Promise<any>;
    getIdentityVerifications(): Promise<any[]>;
    getIdentityVerificationByUser(user: any): Promise<any[]>;
    getIdentityVerificationByDate(date: any): Promise<any[]>;
    getIdentityVerificationByType(type: any): Promise<any[]>;
    getIdentityVerificationByStatus(status: any): Promise<any[]>;
}


