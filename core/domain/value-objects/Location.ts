// Georgraphic location with privacy levels

export class Location {
  private readonly latitude: number;
  private readonly longitude: number;
  private readonly city: string;
  private readonly country: string;
  private readonly postalCode: string;

  private constructor(
    latitude: number,
    longitude: number,
    city: string,
    country: string,
    postalCode: string
  ) {
    this.validateCoordinates(latitude, longitude);
    this.latitude = latitude;
    this.longitude = longitude;
    this.city = city;
    this.country = country;
    this.postalCode = postalCode;
  }

  static create(
    latitude: number,
    longitude: number,
    city: string,
    country: string,
    postalCode: string
  ): Location {
    return new Location(latitude, longitude, city, country, postalCode);
  }

  getLatitude(): number {
    return this.latitude;
  }

  getLongitude(): number {
    return this.longitude;
  }

  getCity(): string {
    return this.city;
  }

  getCountry(): string {
    return this.country;
  }

  getPostalCode(): string {
    return this.postalCode;
  }

  getCoordinates(): [number, number] {
    return [this.latitude, this.longitude];
  }

  distanceTo(other: Location): number {
    // Haversine formula for calculating distance between two points on a sphere
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(other.latitude - this.latitude);
    const dLon = this.toRad(other.longitude - this.longitude);
    const lat1 = this.toRad(this.latitude);
    const lat2 = this.toRad(other.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  isWithinRadius(other: Location, radiusKm: number): boolean {
    return this.distanceTo(other) <= radiusKm;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private validateCoordinates(latitude: number, longitude: number): void {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }
  }

  isValid(): boolean {
    return (
      this.latitude >= -90 &&
      this.latitude <= 90 &&
      this.longitude >= -180 &&
      this.longitude <= 180 &&
      this.city.length > 0 &&
      this.country.length > 0 &&
      this.postalCode.length > 0
    );
  }

  equals(other: Location): boolean {
    if (!(other instanceof Location)) {
      return false;
    }

    return (
      this.latitude === other.latitude &&
      this.longitude === other.longitude &&
      this.city === other.city &&
      this.country === other.country &&
      this.postalCode === other.postalCode
    );
  }

  toString(): string {
    return `${this.city}, ${this.country} (${this.latitude}, ${this.longitude})`;
  }
} 