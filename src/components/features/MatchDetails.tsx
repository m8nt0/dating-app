import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MatchDetailsProps {
  match: {
    id: number
    name: string
    age: number
    image: string
    bio: string
    interests: string[]
    location: string
    about?: string
    lookingFor?: string
    jobTitle?: string
    company?: string
    school?: string
    height?: string
    zodiacSign?: string
  } | null
  onClose: () => void
  onMessage: (matchId: number) => void
}

export default function EnhancedMatchDetails({ match, onClose, onMessage }: MatchDetailsProps) {
  const [currentSection, setCurrentSection] = useState<'about' | 'interests'>('about')

  if (!match) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-card text-card-foreground rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="relative">
          <img
            src={match.image}
            alt={match.name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 rounded-full bg-background/50 hover:bg-background/75"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{match.name}, {match.age}</h2>
            <Badge variant="secondary">{match.location}</Badge>
          </div>
          <p className="text-muted-foreground mb-4">{match.jobTitle} {match.company ? `at ${match.company}` : ''}</p>
          <div className="flex space-x-2 mb-6">
            <Button
              variant={currentSection === 'about' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('about')}
            >
              About
            </Button>
            <Button
              variant={currentSection === 'interests' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('interests')}
            >
              Interests
            </Button>
          </div>
          <ScrollArea className="h-48 rounded-md border p-4">
            {currentSection === 'about' ? (
              <div className="space-y-4">
                <p>{match.bio}</p>
                {match.about && (
                  <div>
                    <h3 className="font-semibold">About me</h3>
                    <p>{match.about}</p>
                  </div>
                )}
                {match.lookingFor && (
                  <div>
                    <h3 className="font-semibold">Looking for</h3>
                    <p>{match.lookingFor}</p>
                  </div>
                )}
                {(match.school || match.height || match.zodiacSign) && (
                  <div className="grid grid-cols-2 gap-2">
                    {match.school && (
                      <div>
                        <h3 className="font-semibold">School</h3>
                        <p>{match.school}</p>
                      </div>
                    )}
                    {match.height && (
                      <div>
                        <h3 className="font-semibold">Height</h3>
                        <p>{match.height}</p>
                      </div>
                    )}
                    {match.zodiacSign && (
                      <div>
                        <h3 className="font-semibold">Zodiac Sign</h3>
                        <p>{match.zodiacSign}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {match.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-between mt-6">
            <Button variant="outline" size="lg" className="w-[48%]" onClick={onClose}>
              <X className="mr-2 h-4 w-4" /> Close
            </Button>
            <Button variant="default" size="lg" className="w-[48%]" onClick={() => onMessage(match.id)}>
              <MessageCircle className="mr-2 h-4 w-4" /> Message
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}