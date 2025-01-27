//////VOICE FIRST MODE//////
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Profile, Match } from '@/types'
import { Mic, MicOff, Play, Pause, SkipForward, Heart } from 'lucide-react'

interface VoiceFirstModeProps {
  currentUser: Profile
  onMatchFound: (match: Match) => void
}

export default function VoiceFirstMode({ currentUser, onMatchFound }: VoiceFirstModeProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentMatch, setCurrentMatch] = useState<Profile | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    findMatch()
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      audioRef.current.addEventListener('ended', handleEnded)
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate)
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audioRef.current.removeEventListener('ended', handleEnded)
      }
    }
  }, [audioURL])

  const findMatch = async () => {
    // Simulating API call to find a match
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockMatch: Profile = {
      id: '3',
      name: 'Alex Johnson',
      age: 29,
      image: 'https://example.com/alex-johnson.jpg',
      bio: 'Music lover and concert enthusiast',
      location: 'Los Angeles, CA',
      interests: ['Music', 'Concerts', 'Guitar'],
    }
    setCurrentMatch(mockMatch)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable)
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Error",
        description: "Unable to access microphone. Please check your permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleDataAvailable = (event: BlobEvent) => {
    const audioBlob = new Blob([event.data], { type: 'audio/webm' })
    const audioUrl = URL.createObjectURL(audioBlob)
    setAudioURL(audioUrl)
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
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

  const handleNextMatch = () => {
    setAudioURL(null)
    findMatch()
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Voice First Dating</h2>
          {currentMatch && (
            <div className="mb-4">
              <Avatar className="w-20 h-20 mx-auto mb-2">
                <AvatarImage src={currentMatch.image} alt={currentMatch.name} />
                <AvatarFallback>{currentMatch.name[0]}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold text-center">{currentMatch.name}, {currentMatch.age}</h3>
              <p className="text-sm text-muted-foreground text-center">{currentMatch.location}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {currentMatch.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </div>
          )}
          {!audioURL ? (
            <div className="text-center">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className="mb-4"
              >
                {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Record a short message to introduce yourself!
              </p>
            </div>
          ) : (
            <div>
              <audio ref={audioRef} src={audioURL} />
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
                </span>
                <span className="text-sm">
                  {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
                </span>
              </div>
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSliderChange}
                className="mb-4"
              />
              <div className="flex justify-center space-x-4">
                <Button size="icon" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="icon" onClick={handleLike}>
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" onClick={handleNextMatch}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}