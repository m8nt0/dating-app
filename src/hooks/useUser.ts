import { useState } from 'react'
import { User } from '@/types'

const initialUser: User = {
  id: 'currentUserId',
  name: 'John Doe',
  age: 30,
  image: '/placeholder.svg?height=400&width=300',
  bio: 'Software developer and fitness enthusiast',
  location: 'New York, NY',
  interests: ['Coding', 'Gym', 'Reading'],
  isPremium: false,
}

export default function useUser() {
  const [currentUser, setCurrentUser] = useState(initialUser)

  const editProfile = (updatedUser: Partial<User>) => {
    setCurrentUser((prevUser) => ({ ...prevUser, ...updatedUser }))
  }

  const upgradeToPremium = () => {
    setCurrentUser((prevUser) => ({ ...prevUser, isPremium: true }))
  }

  return {
    currentUser,
    setCurrentUser,
    editProfile,
    upgradeToPremium,
  }
}