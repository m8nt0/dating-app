'use client'

import React from 'react'
import { Profile, Match } from '@/types'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface DateIdeasModeProps {
  currentUser: Profile
  onMatchFound: (match: Match) => void
}

const DateIdeasMode: React.FC<DateIdeasModeProps> = ({ currentUser, onMatchFound }) => {
  const { toast } = useToast()

  const handleMatch = () => {
    // Logic to handle match
    const newMatch: Match = {
      id: `${currentUser.id}-someId`,
      users: [currentUser], // Add other user profiles as needed
      timestamp: new Date().toISOString(),
      lastMessage: '',
      name: currentUser.name,
      age: currentUser.age,
      image: currentUser.image,
      bio: currentUser.bio,
      location: currentUser.location,
      interests: currentUser.interests,
    }
    onMatchFound(newMatch)
    toast({
      title: "It's a match!",
      description: `You matched with ${currentUser.name}!`,
    })
  }

  return (
    <Card>
      <CardContent>
        <h2>Date Ideas Mode</h2>
        <Button onClick={handleMatch}>Match</Button>
      </CardContent>
    </Card>
  )
}

export default DateIdeasMode
