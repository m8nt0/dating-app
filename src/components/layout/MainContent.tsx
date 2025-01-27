import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Profile, Match, Message } from '@/types'
import SwipeMode from '@/components/modes/SwipeMode'
import VideoSpeedDatingMode from '@/components/modes/VideoSpeedDatingMode'
import QuestionAnswerMode from '@/components/modes/QuestionAnswerMode'
import ExploreMapMode from '@/components/modes/ExploreMapMode'
import ActivityFeedMode from '@/components/modes/ActivityFeedMode'
import VoiceFirstMode from '@/components/modes/VoiceFirstMode'
import DateIdeasMode from '@/components/modes/DateIdeasMode'
import GroupMatchMode from '@/components/modes/GroupMatchMode'
import HiddenCrushMode from '@/components/modes/HiddenCrushMode'
import HobbiesMode from '@/components/modes/HobbiesMode'
import AIMatchSuggestionsMode from '@/components/modes/AIMatchSuggestionsMode'
import { Home, Video, HelpCircle, Map, Activity, Mic, Calendar, Users, Heart, Briefcase, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface MainContentProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  profiles: Profile[]
  currentProfileIndex: number
  handleSwipe: (direction: number) => void
  handleLike: () => void
  matches: Match[]
  messages: Message[]
  currentUser: Profile
  onOpenMatchDetails: (match: Profile) => void
}

export default function MainContent({
  activeTab,
  setActiveTab,
  profiles,
  currentProfileIndex,
  handleSwipe,
  handleLike,
  matches,
  messages,
  currentUser,
  onOpenMatchDetails
}: MainContentProps) {
  const [activeMode, setActiveMode] = useState('swipe')
  const navRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const modes = [
    { id: 'swipe', icon: Home, label: 'Swipe' },
    { id: 'video', icon: Video, label: 'Video Speed' },
    { id: 'qa', icon: HelpCircle, label: 'Q&A' },
    { id: 'map', icon: Map, label: 'Explore Map' },
    { id: 'activity', icon: Activity, label: 'Activity Feed' },
    { id: 'voice', icon: Mic, label: 'Voice-First' },
    { id: 'date-ideas', icon: Calendar, label: 'Date Ideas' },
    { id: 'group', icon: Users, label: 'Group Match' },
    { id: 'hidden-crush', icon: Heart, label: 'Hidden Crush' },
    { id: 'hobbies', icon: Briefcase, label: 'Match Hobbies' },
    // { id: 'ai', icon: Sparkles, label: 'AI Suggestions' },
  ]

  useEffect(() => {
    const handleResize = () => {
      if (navRef.current) {
        const isScrollable = navRef.current.scrollWidth > navRef.current.clientWidth
        navRef.current.style.justifyContent = isScrollable ? 'flex-start' : 'center'
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const checkScroll = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
      };

      checkScroll();
      scrollContainer.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);

      return () => {
        scrollContainer.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleMatchFound = (match: Match) => {
    // Logic to handle a match found
    console.log("Match found:", match);
    // You can add more logic here, like updating state or showing a toast
  };

  const handleMessageMatch = (matchId: string) => {
    // Logic to handle messaging a match
    console.log("Message match with ID:", matchId);
    // You can add more logic here, like navigating to a chat screen
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeMode === 'swipe' && (
              <SwipeMode
                profiles={profiles}
                currentProfileIndex={currentProfileIndex}
                handleSwipe={handleSwipe}
                handleLike={handleLike}
              />
            )}
            {activeMode === 'video' && <VideoSpeedDatingMode currentUser={currentUser} onMatchFound={handleMatchFound} />}
            {activeMode === 'qa' && <QuestionAnswerMode currentUser={currentUser} onMatchFound={handleMatchFound} />}
            {activeMode === 'map' && <ExploreMapMode currentUser={currentUser} onMatchFound={handleMatchFound} />}
            {activeMode === 'activity' && <ActivityFeedMode currentUser={currentUser} onMatchFound={handleMatchFound} />}
            {activeMode === 'voice' && <VoiceFirstMode currentUser={currentUser} onMatchFound={handleMatchFound} />}
            {activeMode === 'date-ideas' && <DateIdeasMode currentUser={currentUser} onMatchFound={handleMatchFound} />}
            {activeMode === 'group' && <GroupMatchMode currentUser={currentUser} onMatchFound={handleMatchFound} />}
            {activeMode === 'hidden-crush' && <HiddenCrushMode currentUser={currentUser} onMatchFound={handleMatchFound} />}
            {activeMode === 'hobbies' && <HobbiesMode currentUser={currentUser} onMatchFound={handleMatchFound} onMessageMatch={handleMessageMatch} />}
            {activeMode === 'ai' && <AIMatchSuggestionsMode currentUser={currentUser} onMatchFound={handleMatchFound} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <nav className="sticky bottom-0 w-full bg-background border-t">
        <div className="relative flex items-center">
          

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide py-2 px-4 gap-2 scroll-smooth flex-grow justify-center items-center"
          >
            {modes.map((mode) => (
              <Button
                key={mode.id}
                variant={activeMode === mode.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveMode(mode.id)}
                className="flex flex-col items-center flex-shrink-0 h-16 w-24"
              >
                <mode.icon className="h-5 w-5" />
                <span className="text-xs mt-1 whitespace-nowrap">{mode.label}</span>
              </Button>
            ))}
          </div>

          
        </div>
      </nav>
    </div>
  )
}