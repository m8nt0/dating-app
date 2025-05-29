/**
 * Location Service
 * 
 * Handles location-related functionality, including geocoding,
 * distance calculations, and location suggestions.
 */

import { EventLocation } from './types';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationSearchResult {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates: LocationCoordinates;
  type: 'venue' | 'restaurant' | 'cafe' | 'bar' | 'park' | 'other';
  rating?: number;
  photoUrl?: string;
}

export class LocationService {
  /**
   * Earth radius in kilometers
   */
  private readonly EARTH_RADIUS = 6371;
  
  /**
   * Initialize the location service
   */
  async initialize(): Promise<void> {
    // In a real implementation, this would initialize any necessary APIs or services
    console.log('Location service initialized');
  }
  
  /**
   * Get the user's current location
   */
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    // In a real implementation, this would use the browser's geolocation API
    // For now, we'll just return a simulated location (San Francisco)
    return {
      latitude: 37.7749,
      longitude: -122.4194
    };
  }
  
  /**
   * Search for locations by query
   */
  async searchLocations(query: string, options: {
    near?: LocationCoordinates;
    radius?: number;
    limit?: number;
    types?: string[];
  } = {}): Promise<LocationSearchResult[]> {
    // In a real implementation, this would query a location API like Google Places
    // For now, we'll just return simulated results
    
    // Default options
    const limit = options.limit || 10;
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return simulated results
    return this.getSimulatedSearchResults(query, limit);
  }
  
  /**
   * Geocode an address to coordinates
   */
  async geocodeAddress(address: string): Promise<LocationCoordinates | null> {
    // In a real implementation, this would use a geocoding API
    // For now, we'll just return simulated coordinates
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return simulated coordinates
    return {
      latitude: 37.7749 + (Math.random() * 0.1 - 0.05),
      longitude: -122.4194 + (Math.random() * 0.1 - 0.05)
    };
  }
  
  /**
   * Reverse geocode coordinates to an address
   */
  async reverseGeocode(coordinates: LocationCoordinates): Promise<Partial<EventLocation> | null> {
    // In a real implementation, this would use a reverse geocoding API
    // For now, we'll just return simulated address
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return simulated address
    return {
      name: 'Simulated Location',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94105',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    };
  }
  
  /**
   * Calculate distance between two points using the Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS * c;
  }
  
  /**
   * Get popular venue suggestions
   */
  async getVenueSuggestions(
    coordinates: LocationCoordinates,
    radius: number = 5,
    limit: number = 10
  ): Promise<LocationSearchResult[]> {
    // In a real implementation, this would query a location API
    // For now, we'll just return simulated results
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return simulated results
    return this.getSimulatedVenueSuggestions(limit);
  }
  
  // Private helper methods
  
  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  /**
   * Get simulated search results
   */
  private getSimulatedSearchResults(query: string, limit: number): LocationSearchResult[] {
    const results: LocationSearchResult[] = [
      {
        id: 'venue1',
        name: 'City Park',
        address: '100 Park Ave',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94102',
        coordinates: {
          latitude: 37.7749,
          longitude: -122.4194
        },
        type: 'park',
        rating: 4.5,
        photoUrl: 'https://example.com/photos/park.jpg'
      },
      {
        id: 'venue2',
        name: 'Downtown Cafe',
        address: '200 Market St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94103',
        coordinates: {
          latitude: 37.7831,
          longitude: -122.4075
        },
        type: 'cafe',
        rating: 4.2,
        photoUrl: 'https://example.com/photos/cafe.jpg'
      },
      {
        id: 'venue3',
        name: 'Waterfront Restaurant',
        address: '300 Embarcadero',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94105',
        coordinates: {
          latitude: 37.7955,
          longitude: -122.3937
        },
        type: 'restaurant',
        rating: 4.7,
        photoUrl: 'https://example.com/photos/restaurant.jpg'
      },
      {
        id: 'venue4',
        name: 'Tech Museum',
        address: '400 Howard St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94105',
        coordinates: {
          latitude: 37.7881,
          longitude: -122.3998
        },
        type: 'venue',
        rating: 4.4,
        photoUrl: 'https://example.com/photos/museum.jpg'
      },
      {
        id: 'venue5',
        name: 'Neighborhood Bar',
        address: '500 Valencia St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94110',
        coordinates: {
          latitude: 37.7642,
          longitude: -122.4216
        },
        type: 'bar',
        rating: 4.0,
        photoUrl: 'https://example.com/photos/bar.jpg'
      }
    ];
    
    // Filter by query if provided
    let filteredResults = results;
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredResults = results.filter(result => 
        result.name.toLowerCase().includes(lowerQuery) ||
        result.address.toLowerCase().includes(lowerQuery) ||
        result.city?.toLowerCase().includes(lowerQuery) ||
        result.state?.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply limit
    return filteredResults.slice(0, limit);
  }
  
  /**
   * Get simulated venue suggestions
   */
  private getSimulatedVenueSuggestions(limit: number): LocationSearchResult[] {
    const venues: LocationSearchResult[] = [
      {
        id: 'venue6',
        name: 'Rooftop Lounge',
        address: '600 Mission St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94105',
        coordinates: {
          latitude: 37.7875,
          longitude: -122.4009
        },
        type: 'bar',
        rating: 4.6,
        photoUrl: 'https://example.com/photos/lounge.jpg'
      },
      {
        id: 'venue7',
        name: 'Community Center',
        address: '700 Folsom St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94107',
        coordinates: {
          latitude: 37.7841,
          longitude: -122.3997
        },
        type: 'venue',
        rating: 4.3,
        photoUrl: 'https://example.com/photos/center.jpg'
      },
      {
        id: 'venue8',
        name: 'Beachside Restaurant',
        address: '800 Beach St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94109',
        coordinates: {
          latitude: 37.8066,
          longitude: -122.4194
        },
        type: 'restaurant',
        rating: 4.8,
        photoUrl: 'https://example.com/photos/beach.jpg'
      },
      {
        id: 'venue9',
        name: 'Art Gallery',
        address: '900 Geary St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94109',
        coordinates: {
          latitude: 37.7864,
          longitude: -122.4171
        },
        type: 'venue',
        rating: 4.2,
        photoUrl: 'https://example.com/photos/gallery.jpg'
      },
      {
        id: 'venue10',
        name: 'Coworking Space',
        address: '1000 Market St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94102',
        coordinates: {
          latitude: 37.7822,
          longitude: -122.4108
        },
        type: 'venue',
        rating: 4.5,
        photoUrl: 'https://example.com/photos/coworking.jpg'
      }
    ];
    
    // Apply limit
    return venues.slice(0, limit);
  }
} 