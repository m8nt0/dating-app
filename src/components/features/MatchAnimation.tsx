import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User, Profile } from '@/types'

interface MatchAnimationProps {
  currentUser: User
  matchedProfile: Profile
  onClose: () => void
}

export default function MatchAnimation({ currentUser, matchedProfile, onClose }: MatchAnimationProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-background p-8 rounded-lg text-center"
      >
        <h2 className="text-2xl font-bold mb-4">It&apos;s a Match!</h2>
        <div className="flex justify-center items-center space-x-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={currentUser.image} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <Heart className="w-12 h-12 text-red-500" />
          <Avatar className="w-24 h-24">
            <AvatarImage src={matchedProfile.image} alt={matchedProfile.name} />
            <AvatarFallback>{matchedProfile.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <p className="mt-4 text-lg">You and {matchedProfile.name} have liked each other!</p>
        <div className="mt-6 space-x-4">
          <Button onClick={onClose}>Keep Swiping</Button>
          <Button variant="outline">Send a Message</Button>
        </div>
      </motion.div>
    </div>
  )
}