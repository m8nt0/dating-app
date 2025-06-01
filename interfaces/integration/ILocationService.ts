// Geolocation service interface

interface ILocationService {
    getLocation(ip: string): Promise<any>;
    getLocationByUser(user: any): Promise<any>;
    getLocationByDate(date: any): Promise<any>;
    getLocationByType(type: any): Promise<any>;
    getLocationByStatus(status: any): Promise<any>;
}