/**
 * User Card Component
 * 
 * A framework-agnostic implementation of a user profile card component
 * that can be adapted to different frontend frameworks.
 */

import { Profile } from '../../../protocol/api/IProfile';

export interface UserCardOptions {
  /**
   * Show detailed information or just basic info
   */
  detailed?: boolean;
  
  /**
   * Show action buttons (like, pass, etc.)
   */
  showActions?: boolean;
  
  /**
   * Show compatibility score
   */
  showCompatibility?: boolean;
  
  /**
   * Custom CSS classes
   */
  customClasses?: {
    container?: string;
    header?: string;
    body?: string;
    footer?: string;
  };
  
  /**
   * Event handlers
   */
  onLike?: (userId: string) => void;
  onPass?: (userId: string) => void;
  onSuperLike?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export interface UserCardData {
  /**
   * User profile data
   */
  profile: Partial<Profile>;
  
  /**
   * Compatibility score (0-1)
   */
  compatibilityScore?: number;
  
  /**
   * Match status
   */
  matchStatus?: 'none' | 'pending' | 'matched';
  
  /**
   * Shared interests
   */
  sharedInterests?: string[];
  
  /**
   * Distance in kilometers
   */
  distance?: number;
  
  /**
   * Online status
   */
  isOnline?: boolean;
  
  /**
   * Last active timestamp
   */
  lastActive?: Date;
}

/**
 * User Card Component
 */
export class UserCard {
  private options: UserCardOptions;
  private data: UserCardData;
  private element: HTMLElement | null = null;
  
  /**
   * Create a new user card instance
   */
  constructor(data: UserCardData, options: UserCardOptions = {}) {
    this.data = data;
    this.options = {
      detailed: false,
      showActions: true,
      showCompatibility: true,
      ...options
    };
  }
  
  /**
   * Render the user card as HTML
   */
  render(): HTMLElement {
    const { profile } = this.data;
    
    // Create container element
    const container = document.createElement('div');
    container.className = `user-card ${this.options.customClasses?.container || ''}`;
    container.dataset.userId = profile.id || '';
    
    // Create header
    const header = document.createElement('div');
    header.className = `user-card-header ${this.options.customClasses?.header || ''}`;
    
    // Add profile photo
    if (profile.photos && profile.photos.length > 0) {
      const photo = document.createElement('img');
      photo.src = profile.photos[0].url;
      photo.alt = `${profile.displayName || profile.username}'s photo`;
      photo.className = 'user-card-photo';
      header.appendChild(photo);
    }
    
    container.appendChild(header);
    
    // Create body
    const body = document.createElement('div');
    body.className = `user-card-body ${this.options.customClasses?.body || ''}`;
    
    // Add name and age
    const nameAge = document.createElement('h3');
    const age = profile.dateOfBirth ? this.calculateAge(new Date(profile.dateOfBirth)) : '';
    nameAge.textContent = `${profile.displayName || profile.username}${age ? `, ${age}` : ''}`;
    body.appendChild(nameAge);
    
    // Add location if available
    if (profile.location?.city) {
      const location = document.createElement('p');
      location.className = 'user-card-location';
      location.textContent = `${profile.location.city}${profile.location.country ? `, ${profile.location.country}` : ''}`;
      body.appendChild(location);
    }
    
    // Add distance if available
    if (this.data.distance !== undefined) {
      const distance = document.createElement('p');
      distance.className = 'user-card-distance';
      distance.textContent = `${Math.round(this.data.distance)} km away`;
      body.appendChild(distance);
    }
    
    // Add bio if detailed view
    if (this.options.detailed && profile.bio) {
      const bio = document.createElement('p');
      bio.className = 'user-card-bio';
      bio.textContent = profile.bio;
      body.appendChild(bio);
    }
    
    // Add compatibility score if available and enabled
    if (this.options.showCompatibility && this.data.compatibilityScore !== undefined) {
      const compatibility = document.createElement('div');
      compatibility.className = 'user-card-compatibility';
      
      const score = Math.round(this.data.compatibilityScore * 100);
      compatibility.innerHTML = `
        <div class="compatibility-label">Match</div>
        <div class="compatibility-score">${score}%</div>
      `;
      
      body.appendChild(compatibility);
    }
    
    // Add shared interests if available and detailed view
    if (this.options.detailed && this.data.sharedInterests && this.data.sharedInterests.length > 0) {
      const interests = document.createElement('div');
      interests.className = 'user-card-interests';
      
      const title = document.createElement('h4');
      title.textContent = 'Shared Interests';
      interests.appendChild(title);
      
      const list = document.createElement('ul');
      this.data.sharedInterests.forEach(interest => {
        const item = document.createElement('li');
        item.textContent = interest;
        list.appendChild(item);
      });
      
      interests.appendChild(list);
      body.appendChild(interests);
    }
    
    container.appendChild(body);
    
    // Create footer with actions if enabled
    if (this.options.showActions) {
      const footer = document.createElement('div');
      footer.className = `user-card-footer ${this.options.customClasses?.footer || ''}`;
      
      // Pass button
      const passBtn = document.createElement('button');
      passBtn.className = 'user-card-action pass';
      passBtn.innerHTML = '<span>✕</span>';
      passBtn.addEventListener('click', () => {
        if (this.options.onPass && profile.id) {
          this.options.onPass(profile.id);
        }
      });
      
      // Like button
      const likeBtn = document.createElement('button');
      likeBtn.className = 'user-card-action like';
      likeBtn.innerHTML = '<span>♥</span>';
      likeBtn.addEventListener('click', () => {
        if (this.options.onLike && profile.id) {
          this.options.onLike(profile.id);
        }
      });
      
      // Super like button
      const superLikeBtn = document.createElement('button');
      superLikeBtn.className = 'user-card-action super-like';
      superLikeBtn.innerHTML = '<span>★</span>';
      superLikeBtn.addEventListener('click', () => {
        if (this.options.onSuperLike && profile.id) {
          this.options.onSuperLike(profile.id);
        }
      });
      
      footer.appendChild(passBtn);
      footer.appendChild(likeBtn);
      footer.appendChild(superLikeBtn);
      
      container.appendChild(footer);
    }
    
    this.element = container;
    return container;
  }
  
  /**
   * Update the user card data
   */
  update(data: Partial<UserCardData>): void {
    this.data = { ...this.data, ...data };
    if (this.element) {
      const newElement = this.render();
      this.element.replaceWith(newElement);
      this.element = newElement;
    }
  }
  
  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }
}

/**
 * Create a user card factory for specific frameworks
 */
export function createUserCardAdapter<T>(
  renderer: (card: UserCard, container: HTMLElement | string) => T
) {
  return (data: UserCardData, options: UserCardOptions = {}, container: HTMLElement | string) => {
    const card = new UserCard(data, options);
    return renderer(card, container);
  };
}
