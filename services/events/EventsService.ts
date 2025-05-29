/**
 * Events Service
 * 
 * Manages dating events, including creation, discovery, registration,
 * and participation.
 */

import { EventEmitter } from 'events';
import { StorageManager } from '../../core/storage/indexeddb';
import { Event, EventType, EventStatus, EventRegistration, EventFilter } from './types';
import { LocationService } from './LocationService';
import { EventRecommender } from './EventRecommender';

export interface EventsServiceOptions {
  /**
   * Maximum number of events a user can create
   */
  maxUserEvents?: number;
  
  /**
   * Maximum number of events a user can register for
   */
  maxRegistrations?: number;
  
  /**
   * Enable event recommendations
   */
  enableRecommendations?: boolean;
  
  /**
   * Default search radius in kilometers
   */
  defaultSearchRadius?: number;
}

export class EventsService extends EventEmitter {
  private userId: string;
  private storage: StorageManager;
  private locationService: LocationService;
  private eventRecommender: EventRecommender | null = null;
  private options: Required<EventsServiceOptions>;
  private userEvents: Map<string, Event> = new Map();
  private userRegistrations: Map<string, EventRegistration> = new Map();
  
  constructor(userId: string, options: EventsServiceOptions = {}) {
    super();
    this.userId = userId;
    this.options = {
      maxUserEvents: 10,
      maxRegistrations: 20,
      enableRecommendations: true,
      defaultSearchRadius: 50,
      ...options
    };
    
    this.storage = new StorageManager('events');
    this.locationService = new LocationService();
    
    if (this.options.enableRecommendations) {
      this.eventRecommender = new EventRecommender(userId);
    }
  }
  
  /**
   * Initialize the events service
   */
  async initialize(): Promise<void> {
    await this.storage.initialize();
    await this.locationService.initialize();
    
    if (this.eventRecommender) {
      await this.eventRecommender.initialize();
    }
    
    // Load user events and registrations
    await this.loadUserEvents();
    await this.loadUserRegistrations();
  }
  
  /**
   * Create a new event
   */
  async createEvent(eventData: Partial<Event>): Promise<Event> {
    // Check if user has reached the maximum number of events
    if (this.userEvents.size >= this.options.maxUserEvents) {
      throw new Error(`You have reached the maximum number of events (${this.options.maxUserEvents})`);
    }
    
    // Validate event data
    this.validateEventData(eventData);
    
    // Create the event
    const now = new Date().toISOString();
    const event: Event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      title: eventData.title || '',
      description: eventData.description || '',
      type: eventData.type || 'social',
      location: eventData.location || { name: 'TBD' },
      startTime: eventData.startTime || '',
      endTime: eventData.endTime || '',
      capacity: eventData.capacity || 0,
      minAge: eventData.minAge || 18,
      maxAge: eventData.maxAge || 99,
      genderPreference: eventData.genderPreference || 'all',
      tags: eventData.tags || [],
      creatorId: this.userId,
      createdAt: now,
      updatedAt: now,
      status: 'upcoming',
      registrationCount: 0,
      isPrivate: eventData.isPrivate || false,
      coverImageUrl: eventData.coverImageUrl,
      registrationDeadline: eventData.registrationDeadline
    };
    
    // Store the event
    await this.storage.set(`event:${event.id}`, event);
    
    // Add to user events
    this.userEvents.set(event.id, event);
    
    // Add to user's created events list
    await this.storage.addToSet(`user:${this.userId}:created_events`, event.id);
    
    // Emit event created event
    this.emit('event-created', event);
    
    return event;
  }
  
  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    // Get the event
    const event = await this.getEvent(eventId);
    
    // Check if user is the creator
    if (event.creatorId !== this.userId) {
      throw new Error('You can only update events you created');
    }
    
    // Check if event is already completed or cancelled
    if (event.status === 'completed' || event.status === 'cancelled') {
      throw new Error(`Cannot update a ${event.status} event`);
    }
    
    // Validate updates
    this.validateEventData(updates);
    
    // Apply updates
    const updatedEvent: Event = {
      ...event,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Store the updated event
    await this.storage.set(`event:${eventId}`, updatedEvent);
    
    // Update user events
    this.userEvents.set(eventId, updatedEvent);
    
    // Emit event updated event
    this.emit('event-updated', updatedEvent);
    
    return updatedEvent;
  }
  
  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string, reason?: string): Promise<Event> {
    // Get the event
    const event = await this.getEvent(eventId);
    
    // Check if user is the creator
    if (event.creatorId !== this.userId) {
      throw new Error('You can only cancel events you created');
    }
    
    // Check if event is already completed or cancelled
    if (event.status === 'completed') {
      throw new Error('Cannot cancel a completed event');
    }
    
    if (event.status === 'cancelled') {
      return event;
    }
    
    // Update event status
    const updatedEvent: Event = {
      ...event,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
      cancellationReason: reason
    };
    
    // Store the updated event
    await this.storage.set(`event:${eventId}`, updatedEvent);
    
    // Update user events
    this.userEvents.set(eventId, updatedEvent);
    
    // Notify registered users
    await this.notifyRegisteredUsers(eventId, 'event-cancelled', {
      eventId,
      reason
    });
    
    // Emit event cancelled event
    this.emit('event-cancelled', updatedEvent);
    
    return updatedEvent;
  }
  
  /**
   * Get an event by ID
   */
  async getEvent(eventId: string): Promise<Event> {
    // Check if it's in user events
    if (this.userEvents.has(eventId)) {
      return this.userEvents.get(eventId)!;
    }
    
    // Get from storage
    try {
      const event = await this.storage.get(`event:${eventId}`);
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }
      return event as Event;
    } catch (error) {
      throw new Error(`Event ${eventId} not found`);
    }
  }
  
  /**
   * Get events created by the user
   */
  async getCreatedEvents(): Promise<Event[]> {
    return Array.from(this.userEvents.values());
  }
  
  /**
   * Search for events
   */
  async searchEvents(filter: EventFilter = {}): Promise<Event[]> {
    // In a real implementation, this would query a database
    // For now, we'll just simulate this with a simple filter
    
    // Get all events
    const allEvents = await this.getAllEvents();
    
    // Apply filters
    let filteredEvents = allEvents;
    
    // Filter by type
    if (filter.type) {
      filteredEvents = filteredEvents.filter(event => event.type === filter.type);
    }
    
    // Filter by status
    if (filter.status) {
      filteredEvents = filteredEvents.filter(event => event.status === filter.status);
    }
    
    // Filter by date range
    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      filteredEvents = filteredEvents.filter(event => new Date(event.startTime) >= startDate);
    }
    
    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      filteredEvents = filteredEvents.filter(event => new Date(event.startTime) <= endDate);
    }
    
    // Filter by location
    if (filter.location) {
      const { latitude, longitude, radius } = filter.location;
      const searchRadius = radius || this.options.defaultSearchRadius;
      
      filteredEvents = filteredEvents.filter(event => {
        // Skip events without coordinates
        if (!event.location.latitude || !event.location.longitude) {
          return false;
        }
        
        // Calculate distance
        const distance = this.locationService.calculateDistance(
          latitude,
          longitude,
          event.location.latitude,
          event.location.longitude
        );
        
        return distance <= searchRadius;
      });
    }
    
    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        filter.tags!.some(tag => event.tags.includes(tag))
      );
    }
    
    // Filter by capacity
    if (filter.hasAvailableSpots) {
      filteredEvents = filteredEvents.filter(event => 
        event.capacity === 0 || event.registrationCount < event.capacity
      );
    }
    
    // Filter by age range
    if (filter.userAge) {
      filteredEvents = filteredEvents.filter(event => 
        filter.userAge! >= event.minAge && filter.userAge! <= event.maxAge
      );
    }
    
    // Filter by gender preference
    if (filter.userGender && filter.userGender !== 'other') {
      filteredEvents = filteredEvents.filter(event => 
        event.genderPreference === 'all' || event.genderPreference === filter.userGender
      );
    }
    
    // Filter by privacy
    if (!filter.includePrivate) {
      filteredEvents = filteredEvents.filter(event => !event.isPrivate);
    }
    
    // Apply limit
    const limit = filter.limit || 50;
    
    // Sort by date
    filteredEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return filteredEvents.slice(0, limit);
  }
  
  /**
   * Get recommended events for the user
   */
  async getRecommendedEvents(limit: number = 10): Promise<Event[]> {
    if (!this.eventRecommender) {
      // If recommendations are disabled, just return upcoming events
      return this.searchEvents({
        status: 'upcoming',
        limit
      });
    }
    
    // Get recommended event IDs
    const recommendedIds = await this.eventRecommender.getRecommendedEvents(limit);
    
    // Get the events
    const events: Event[] = [];
    for (const id of recommendedIds) {
      try {
        const event = await this.getEvent(id);
        events.push(event);
      } catch (error) {
        // Skip events that couldn't be loaded
      }
    }
    
    return events;
  }
  
  /**
   * Register for an event
   */
  async registerForEvent(eventId: string): Promise<EventRegistration> {
    // Check if user has reached the maximum number of registrations
    if (this.userRegistrations.size >= this.options.maxRegistrations) {
      throw new Error(`You have reached the maximum number of registrations (${this.options.maxRegistrations})`);
    }
    
    // Get the event
    const event = await this.getEvent(eventId);
    
    // Check if event is open for registration
    if (event.status !== 'upcoming') {
      throw new Error(`Cannot register for a ${event.status} event`);
    }
    
    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      throw new Error('Registration deadline has passed');
    }
    
    // Check if event has reached capacity
    if (event.capacity > 0 && event.registrationCount >= event.capacity) {
      throw new Error('Event has reached capacity');
    }
    
    // Check if user is already registered
    const existingRegistration = this.userRegistrations.get(eventId);
    if (existingRegistration) {
      return existingRegistration;
    }
    
    // Create registration
    const now = new Date().toISOString();
    const registration: EventRegistration = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      eventId,
      userId: this.userId,
      status: 'confirmed',
      registeredAt: now,
      updatedAt: now
    };
    
    // Store the registration
    await this.storage.set(`registration:${registration.id}`, registration);
    
    // Add to user registrations
    this.userRegistrations.set(eventId, registration);
    
    // Add to user's registered events list
    await this.storage.addToSet(`user:${this.userId}:registered_events`, eventId);
    
    // Update event registration count
    event.registrationCount++;
    await this.storage.set(`event:${eventId}`, event);
    
    // If this is a user-created event, update the local copy
    if (this.userEvents.has(eventId)) {
      this.userEvents.set(eventId, event);
    }
    
    // Emit event registration event
    this.emit('event-registered', { event, registration });
    
    return registration;
  }
  
  /**
   * Cancel registration for an event
   */
  async cancelRegistration(eventId: string): Promise<void> {
    // Check if user is registered
    const registration = this.userRegistrations.get(eventId);
    if (!registration) {
      return; // Not registered, nothing to do
    }
    
    // Get the event
    const event = await this.getEvent(eventId);
    
    // Check if event has already started
    if (new Date(event.startTime) < new Date()) {
      throw new Error('Cannot cancel registration for an event that has already started');
    }
    
    // Update registration status
    registration.status = 'cancelled';
    registration.updatedAt = new Date().toISOString();
    
    // Store the updated registration
    await this.storage.set(`registration:${registration.id}`, registration);
    
    // Remove from user registrations
    this.userRegistrations.delete(eventId);
    
    // Remove from user's registered events list
    await this.storage.removeFromSet(`user:${this.userId}:registered_events`, eventId);
    
    // Update event registration count
    event.registrationCount = Math.max(0, event.registrationCount - 1);
    await this.storage.set(`event:${eventId}`, event);
    
    // If this is a user-created event, update the local copy
    if (this.userEvents.has(eventId)) {
      this.userEvents.set(eventId, event);
    }
    
    // Emit event registration cancelled event
    this.emit('event-registration-cancelled', { eventId, userId: this.userId });
  }
  
  /**
   * Get registered events
   */
  async getRegisteredEvents(): Promise<Event[]> {
    const events: Event[] = [];
    
    for (const eventId of this.userRegistrations.keys()) {
      try {
        const event = await this.getEvent(eventId);
        events.push(event);
      } catch (error) {
        // Skip events that couldn't be loaded
      }
    }
    
    return events;
  }
  
  /**
   * Get event registrations
   */
  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    // Check if user is the creator
    const event = await this.getEvent(eventId);
    if (event.creatorId !== this.userId) {
      throw new Error('You can only view registrations for events you created');
    }
    
    // Get registrations from storage
    const registrations = await this.storage.getByPrefix(`registration:`) as EventRegistration[];
    
    // Filter by event ID
    return registrations.filter(reg => reg.eventId === eventId);
  }
  
  /**
   * Check in a user to an event
   */
  async checkInUser(eventId: string, userId: string): Promise<void> {
    // Check if user is the creator
    const event = await this.getEvent(eventId);
    if (event.creatorId !== this.userId) {
      throw new Error('You can only check in users for events you created');
    }
    
    // Get all registrations for the event
    const registrations = await this.getEventRegistrations(eventId);
    
    // Find the user's registration
    const registration = registrations.find(reg => reg.userId === userId);
    if (!registration) {
      throw new Error(`User ${userId} is not registered for this event`);
    }
    
    // Update registration status
    registration.status = 'checked-in';
    registration.checkedInAt = new Date().toISOString();
    registration.updatedAt = new Date().toISOString();
    
    // Store the updated registration
    await this.storage.set(`registration:${registration.id}`, registration);
    
    // Emit event check-in event
    this.emit('event-check-in', { eventId, userId });
  }
  
  /**
   * Mark an event as completed
   */
  async completeEvent(eventId: string): Promise<Event> {
    // Get the event
    const event = await this.getEvent(eventId);
    
    // Check if user is the creator
    if (event.creatorId !== this.userId) {
      throw new Error('You can only complete events you created');
    }
    
    // Check if event is already completed or cancelled
    if (event.status === 'completed') {
      return event;
    }
    
    if (event.status === 'cancelled') {
      throw new Error('Cannot complete a cancelled event');
    }
    
    // Update event status
    const updatedEvent: Event = {
      ...event,
      status: 'completed',
      updatedAt: new Date().toISOString()
    };
    
    // Store the updated event
    await this.storage.set(`event:${eventId}`, updatedEvent);
    
    // Update user events
    this.userEvents.set(eventId, updatedEvent);
    
    // Emit event completed event
    this.emit('event-completed', updatedEvent);
    
    return updatedEvent;
  }
  
  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    this.removeAllListeners();
    
    if (this.eventRecommender) {
      await this.eventRecommender.dispose();
    }
  }
  
  // Private helper methods
  
  /**
   * Load user events from storage
   */
  private async loadUserEvents(): Promise<void> {
    try {
      // Get user's created event IDs
      const eventIds = await this.storage.getSet(`user:${this.userId}:created_events`) as string[];
      
      // Load each event
      for (const eventId of eventIds) {
        try {
          const event = await this.storage.get(`event:${eventId}`);
          if (event) {
            this.userEvents.set(eventId, event as Event);
          }
        } catch (error) {
          console.error(`Failed to load event ${eventId}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to load user events:', error);
    }
  }
  
  /**
   * Load user registrations from storage
   */
  private async loadUserRegistrations(): Promise<void> {
    try {
      // Get user's registered event IDs
      const eventIds = await this.storage.getSet(`user:${this.userId}:registered_events`) as string[];
      
      // Load each registration
      for (const eventId of eventIds) {
        try {
          // Find registration for this event and user
          const registrations = await this.storage.getByPrefix(`registration:`) as EventRegistration[];
          const registration = registrations.find(
            reg => reg.eventId === eventId && reg.userId === this.userId
          );
          
          if (registration && registration.status === 'confirmed') {
            this.userRegistrations.set(eventId, registration);
          }
        } catch (error) {
          console.error(`Failed to load registration for event ${eventId}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to load user registrations:', error);
    }
  }
  
  /**
   * Get all events
   */
  private async getAllEvents(): Promise<Event[]> {
    try {
      return await this.storage.getByPrefix('event:') as Event[];
    } catch (error) {
      console.error('Failed to get all events:', error);
      return [];
    }
  }
  
  /**
   * Validate event data
   */
  private validateEventData(eventData: Partial<Event>): void {
    // Check required fields for new events
    if (!eventData.id && (!eventData.title || !eventData.startTime)) {
      throw new Error('Event title and start time are required');
    }
    
    // Validate start and end times
    if (eventData.startTime && eventData.endTime) {
      const startTime = new Date(eventData.startTime);
      const endTime = new Date(eventData.endTime);
      
      if (isNaN(startTime.getTime())) {
        throw new Error('Invalid start time');
      }
      
      if (isNaN(endTime.getTime())) {
        throw new Error('Invalid end time');
      }
      
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
    }
    
    // Validate capacity
    if (eventData.capacity !== undefined && eventData.capacity < 0) {
      throw new Error('Capacity cannot be negative');
    }
    
    // Validate age range
    if (eventData.minAge !== undefined && eventData.minAge < 18) {
      throw new Error('Minimum age cannot be less than 18');
    }
    
    if (eventData.maxAge !== undefined && eventData.maxAge < eventData.minAge!) {
      throw new Error('Maximum age cannot be less than minimum age');
    }
    
    // Validate registration deadline
    if (eventData.registrationDeadline && eventData.startTime) {
      const registrationDeadline = new Date(eventData.registrationDeadline);
      const startTime = new Date(eventData.startTime);
      
      if (isNaN(registrationDeadline.getTime())) {
        throw new Error('Invalid registration deadline');
      }
      
      if (registrationDeadline > startTime) {
        throw new Error('Registration deadline must be before start time');
      }
    }
  }
  
  /**
   * Notify registered users about an event update
   */
  private async notifyRegisteredUsers(
    eventId: string,
    notificationType: string,
    data: any
  ): Promise<void> {
    // Get all registrations for the event
    const registrations = await this.getEventRegistrations(eventId);
    
    // Emit notification events for each registered user
    for (const registration of registrations) {
      if (registration.status === 'confirmed') {
        this.emit('user-notification', {
          userId: registration.userId,
          type: notificationType,
          data
        });
      }
    }
  }
}
