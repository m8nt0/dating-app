'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Profile, Match } from '@/types'
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Video, Mic, MicOff, VideoOff } from 'lucide-react'

interface VideoSpeedDatingModeProps {
  currentUser: Profile
  onMatchFound: (match: Match) => void
}

export default function VideoSpeedDatingMode({ currentUser, onMatchFound }: VideoSpeedDatingModeProps) {
  const [isInSession, setIsInSession] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [isLoading, setIsLoading] = useState(false)
  const [currentMatch, setCurrentMatch] = useState<Profile | null>(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isInSession && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      endSession()
    }
    return () => clearInterval(timer)
  }, [isInSession, timeLeft])

  const startSession = async () => {
    setIsLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsInSession(true)
      setTimeLeft(120)
      await findMatch()
    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast({
        title: "Error",
        description: "Unable to access camera and microphone. Please check your permissions.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const findMatch = async () => {
    // Simulating API call to find a match
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const mockMatch: Profile = {
      id: '2',
      name: 'Jane Doe',
      age: 28,
      image: 'https://example.com/jane-doe.jpg',
      bio: 'Love traveling and photography',
      location: 'New York, NY',
      interests: ['Photography', 'Travel', 'Cooking'],
    }
    setCurrentMatch(mockMatch)
    setIsLoading(false)
  }

  const endSession = () => {
    setIsInSession(false)
    setCurrentMatch(null)
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  const handleNextMatch = () => {
    setTimeLeft(120)
    findMatch()
  }

  const toggleVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const videoTrack = (videoRef.current.srcObject as MediaStream)
        .getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoOn(!isVideoOn)
    }
  }

  const toggleAudio = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const audioTrack = (videoRef.current.srcObject as MediaStream)
        .getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsAudioOn(!isAudioOn)
    }
  }

  const handleLike = () => {
    if (currentMatch) {
      const newMatch: Match = {
        id: `${currentUser.id}-${currentMatch.id}`,
        users: [currentUser, currentMatch],
        timestamp: new Date().toISOString(),
        lastMessage: '',
        name: currentMatch.name,
        age: currentMatch.age,
        image: currentMatch.image,
        bio: currentMatch.bio,
        location: currentMatch.location,
        interests: currentMatch.interests,
      }
      onMatchFound(newMatch)
      toast({
        title: "It's a match!",
        description: `You and ${currentMatch.name} liked each other!`,
      })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Video Speed Dating</h2>
          {!isInSession ? (
            <div>
              <p className="mb-4">Ready to meet new people? Start a video speed dating session!</p>
              <Button onClick={startSession} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
                Start Session
              </Button>
            </div>
          ) : (
            <div>
              <div className="aspect-video bg-gray-200 mb-4 rounded-lg overflow-hidden relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {currentMatch && (
                  <div className="absolute bottom-2 left-2">
                    <Avatar className="w-12 h-12 border-2 border-white">
                      <AvatarImage src={currentMatch.image} alt={currentMatch.name} />
                      <AvatarFallback>{currentMatch.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button size="icon" variant="secondary" onClick={toggleVideo}>
                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="secondary" onClick={toggleAudio}>
                    {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {currentMatch && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{currentMatch.name}, {currentMatch.age}</h3>
                  <p className="text-sm text-muted-foreground">{currentMatch.location}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentMatch.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <p className="mb-2">Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
              <div className="flex justify-between">
                <Button variant="outline" onClick={endSession}>End Session</Button>
                <Button onClick={handleLike}>Like</Button>
                <Button onClick={handleNextMatch} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Next Match'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}