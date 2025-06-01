// Weather data integration interface

// Im not sure if we need weather interface

interface IWeatherService {
    getWeather(location: string): Promise<any>;
    getWeatherByUser(user: any): Promise<any[]>;
    getWeatherByDate(date: any): Promise<any[]>;
}