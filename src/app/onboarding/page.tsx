'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    name: '',
    age: 18,
    gender: '',
    interestedIn: '',
    location: '',
    bio: '',
    interests: [] as string[],
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      // Here you would typically call an API to save the user's profile
      console.log('Saving profile:', profile)
      toast({
        title: "Profile created",
        description: "Your profile has been set up successfully!",
      })
      router.push('/app')
    }
  }

  const handleAddInterest = (interest: string) => {
    if (interest && !profile.interests.includes(interest)) {
      setProfile({ ...profile, interests: [...profile.interests, interest] })
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setProfile({ ...profile, interests: profile.interests.filter(i => i !== interest) })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Set Up Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Slider
                  id="age"
                  min={18}
                  max={100}
                  step={1}
                  value={[profile.age]}
                  onValueChange={(value) => setProfile({ ...profile, age: value[0] })}
                />
                <p className="text-sm text-gray-500 text-right">{profile.age} years old</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interestedIn">Interested In</Label>
                <Select onValueChange={(value) => setProfile({ ...profile, interestedIn: value })}>
                  <SelectTrigger id="interestedIn">
                    <SelectValue placeholder="Select who you're interested in" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="everyone">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="Enter your location"
                  required
                />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interests">Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveInterest(interest)}>
                      {interest} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  id="interests"
                  placeholder="Add an interest"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddInterest(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button onClick={handleNext}>
            {step < 4 ? 'Next' : 'Finish'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}