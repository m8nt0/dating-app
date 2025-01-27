import { useState } from 'react'
import { Profile } from '@/types'

const initialProfiles: Profile[] = [
  {
    id: '1',
    name: 'Alice',
    age: 28,
    image: '/placeholder.svg?height=400&width=300',
    bio: 'Adventure seeker and coffee enthusiast',
    location: 'New York, NY',
    interests: ['Hiking', 'Photography', 'Travel']
  },
  {
    id: '2',
    name: 'Bob',
    age: 32,
    image: '/placeholder.svg?height=400&width=300',
    bio: 'Foodie and amateur chef',
    location: 'Los Angeles, CA',
    interests: ['Cooking', 'Wine tasting', 'Yoga']
  },
  // Add more profiles...
]

export default function useProfiles() {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)

  const handleSwipe = (direction: number) => {
    if (direction === 1) {
      // Logic for right swipe (like)
      console.log('Liked profile:', profiles[currentProfileIndex])
    } else {
      // Logic for left swipe (dislike)
      console.log('Disliked profile:', profiles[currentProfileIndex])
    }
    setCurrentProfileIndex((prevIndex) => (prevIndex + 1) % profiles.length)
  }

  return {
    profiles,
    currentProfileIndex,
    setCurrentProfileIndex,
    handleSwipe,
  }
}