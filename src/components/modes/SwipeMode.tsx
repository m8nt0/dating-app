import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Profile } from '@/types'
import { X, Heart, Zap, Undo } from 'lucide-react'

interface SwipeModeProps {
  profiles: Profile[]
  currentProfileIndex: number
  handleSwipe: (direction: number) => void
  handleLike: () => void
}

export default function SwipeMode({ profiles, currentProfileIndex, handleSwipe, handleLike }: SwipeModeProps) {
  const currentProfile = profiles[currentProfileIndex]

  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        key={currentProfile.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = offset.x > 100 ? 1 : offset.x < -100 ? -1 : 0
          if (swipe !== 0) handleSwipe(swipe)
        }}
      >
        <Card>
          <CardContent className="p-0">
            <img
              src={currentProfile.image}
              alt={currentProfile.name}
              className="w-full h-[400px] object-cover rounded-t-xl"
            />
            <div className="p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{currentProfile.name}, {currentProfile.age}</h2>
                <Badge>{currentProfile.location}</Badge>
              </div>
              <p className="mt-2 text-muted-foreground">{currentProfile.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {currentProfile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">{interest}</Badge>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button size="icon" variant="outline" onClick={() => handleSwipe(-1)}>
                  <Undo className="h-6 w-6" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleSwipe(-1)}>
                  <X className="h-6 w-6" />
                </Button>
                <Button size="icon" variant="default" onClick={handleLike}>
                  <Heart className="h-6 w-6" />
                </Button>
                <Button size="icon" variant="outline">
                  <Zap className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}