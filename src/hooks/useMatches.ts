import { useState } from 'react'
import { Match, Profile } from '@/types'

const initialMatches: Match[] = [
  {
    id: '1',
    name: 'Emma',
    age: 27,
    image: '/placeholder.svg?height=400&width=300',
    location: 'Chicago, IL',
    lastMessage: 'Hey, how are you?',
    timestamp: new Date().toISOString(),
    bio: 'Adventure seeker and coffee enthusiast',
    interests: ['Hiking', 'Photography', 'Travel']
  },
  {
    id: '2',
    name: 'James',
    age: 30,
    image: '/placeholder.svg?height=400&width=300',
    location: 'San Francisco, CA',
    lastMessage: 'Want to grab coffee sometime?',
    timestamp: new Date().toISOString(),
    bio: 'Foodie and amateur chef',
    interests: ['Cooking', 'Wine tasting', 'Yoga']
  },
  // Add more matches...
]

export default function useMatches() {
  const [matches, setMatches] = useState(initialMatches)

  const addMatch = (profile: Profile) => {
    const newMatch: Match = {
      id: profile.id,
      name: profile.name,
      age: profile.age,
      image: profile.image,
      location: profile.location,
      lastMessage: '',
      timestamp: new Date().toISOString(),
      bio: profile.bio,
      interests: profile.interests
    }
    setMatches((prevMatches) => [newMatch, ...prevMatches])
  }

  return {
    matches,
    addMatch,
  }
}