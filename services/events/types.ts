/**
 * Events Service Types
 * 
 * Common type definitions for the events service.
 */

/**
 * Event type
 */
export type EventType = 'social' | 'activity' | 'dining' | 'workshop' | 'game' | 'travel' | 'other';

/**
 * Event status
 */
export type EventStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';

/**
 * Event location
 */
export interface EventLocation {
  /**
   * Location name
   */
  name: string;
  
  /**
   * Location address
   */
  address?: string;
  
  /**
   * Location city
   */
  city?: string;
  
  /**
   * Location state/province
   */
  state?: string;
  
  /**
   * Location country
   */
  country?: string;
  
  /**
   * Location postal code
   */
  postalCode?: string;
  
  /**
   * Location latitude
   */
  latitude?: number;
  
  /**
   * Location longitude
   */
  longitude?: number;
  
  /**
   * Is virtual location
   */
  isVirtual?: boolean;
  
  /**
   * Virtual meeting URL
   */
  virtualMeetingUrl?: string;
}

/**
 * Gender preference
 */
export type GenderPreference = 'all' | 'male' | 'female' | 'other';

/**
 * Event interface
 */
export interface Event {
  /**
   * Event ID
   */
  id: string;
  
  /**
   * Event title
   */
  title: string;
  
  /**
   * Event description
   */
  description: string;
  
  /**
   * Event type
   */
  type: EventType;
  
  /**
   * Event location
   */
  location: EventLocation;
  
  /**
   * Event start time
   */
  startTime: string;
  
  /**
   * Event end time
   */
  endTime: string;
  
  /**
   * Event capacity (0 for unlimited)
   */
  capacity: number;
  
  /**
   * Minimum age requirement
   */
  minAge: number;
  
  /**
   * Maximum age requirement
   */
  maxAge: number;
  
  /**
   * Gender preference
   */
  genderPreference: GenderPreference;
  
  /**
   * Event tags
   */
  tags: string[];
  
  /**
   * Event creator ID
   */
  creatorId: string;
  
  /**
   * Event creation timestamp
   */
  createdAt: string;
  
  /**
   * Event last update timestamp
   */
  updatedAt: string;
  
  /**
   * Event status
   */
  status: EventStatus;
  
  /**
   * Current registration count
   */
  registrationCount: number;
  
  /**
   * Is private event
   */
  isPrivate: boolean;
  
  /**
   * Event cover image URL
   */
  coverImageUrl?: string;
  
  /**
   * Registration deadline
   */
  registrationDeadline?: string;
  
  /**
   * Cancellation reason (if cancelled)
   */
  cancellationReason?: string;
}

/**
 * Registration status
 */
export type RegistrationStatus = 'confirmed' | 'cancelled' | 'checked-in' | 'no-show';

/**
 * Event registration
 */
export interface EventRegistration {
  /**
   * Registration ID
   */
  id: string;
  
  /**
   * Event ID
   */
  eventId: string;
  
  /**
   * User ID
   */
  userId: string;
  
  /**
   * Registration status
   */
  status: RegistrationStatus;
  
  /**
   * Registration timestamp
   */
  registeredAt: string;
  
  /**
   * Last update timestamp
   */
  updatedAt: string;
  
  /**
   * Check-in timestamp (if checked in)
   */
  checkedInAt?: string;
  
  /**
   * Cancellation reason (if cancelled)
   */
  cancellationReason?: string;
}

/**
 * Event filter options
 */
export interface EventFilter {
  /**
   * Filter by event type
   */
  type?: EventType;
  
  /**
   * Filter by event status
   */
  status?: EventStatus;
  
  /**
   * Filter by start date
   */
  startDate?: string;
  
  /**
   * Filter by end date
   */
  endDate?: string;
  
  /**
   * Filter by location
   */
  location?: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
  };
  
  /**
   * Filter by tags
   */
  tags?: string[];
  
  /**
   * Filter by available spots
   */
  hasAvailableSpots?: boolean;
  
  /**
   * Filter by user age
   */
  userAge?: number;
  
  /**
   * Filter by user gender
   */
  userGender?: GenderPreference;
  
  /**
   * Include private events
   */
  includePrivate?: boolean;
  
  /**
   * Maximum number of results
   */
  limit?: number;
} 