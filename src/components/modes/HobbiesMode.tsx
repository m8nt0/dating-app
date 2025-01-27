//////HOBBIES MODE//////
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Profile, Match } from '@/types'
import { Search, Heart, X, MessageCircle } from 'lucide-react'

interface HobbiesModeProps {
  currentUser: Profile
  onMatchFound: (match: Match) => void
  onMessageMatch: (matchId: string) => void
}

export default function HobbiesMode({ currentUser, onMatchFound, onMessageMatch }: HobbiesModeProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [matches, setMatches] = useState<Profile[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (searchTerm) {
      searchMatches()
    } else {
      setMatches([])
    }
  }, [searchTerm])

  const searchMatches = async () => {
    // Simulating API call to search for matches based on hobbies
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockMatches: Profile[] = [
      {
        id: '4',
        name: 'Emma Wilson',
        age: 27,
        image: 'https://example.com/emma-wilson.jpg',
        bio: 'Passionate about photography and travel',
        location: 'San Francisco, CA',
        interests: ['Photography', 'Travel', 'Hiking'],
      },
      {
        id: '5',
        name: 'Michael Brown',
        age: 30,
        image: 'https://example.com/michael-brown.jpg',
        bio: 'Avid reader and coffee enthusiast',
        location: 'Seattle, WA',
        interests: ['Reading', 'Coffee', 'Writing'],
      },
    ]
    setMatches(mockMatches.filter(match => 
      match.interests.some(interest => 
        interest.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ))
  }

  const handleLike = (match: Profile) => {
    const newMatch: Match = {
      id: `${currentUser.id}-${match.id}`,
      users: [currentUser, match],
      timestamp: new Date().toISOString(),
      lastMessage: '',
      name: match.name,
      age: match.age,
      image: match.image,
      bio: match.bio,
      location: match.location,
      interests: match.interests,
    }
    onMatchFound(newMatch)
    toast({
      title: "It's a match!",
      description: `You and ${match.name} liked each other!`,
    })
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Match by Hobbies</h2>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search for hobbies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          {matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((match) => (
                <Card key={match.id}>
                  <CardContent className="p-4 flex items-center">
                    <Avatar className="w-16 h-16 mr-4">
                      <AvatarImage src={match.image} alt={match.name} />
                      <AvatarFallback>{match.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold">{match.name}, {match.age}</h3>
                      <p className="text-sm text-muted-foreground">{match.location}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {match.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="icon" variant="default" onClick={() => handleLike(match)}>
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => onMessageMatch(match.id)}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchTerm ? (
            <p className="text-center text-muted-foreground">No matches found for "{searchTerm}"</p>
          ) : (
            <p className="text-center text-muted-foreground">Start searching for hobbies to find matches!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}