'use client'

import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"
import MainLayout from '@/components/layout/MainLayout'
import Sidebar from '@/components/layout/Sidebar'
import ProfileSidebar from '@/components/layout/ProfileSidebar'
import MainContent from '@/components/layout/MainContent'
import MatchAnimation from '@/components/features/MatchAnimation'
import MatchDetails from '@/components/features/MatchDetails'
import useProfiles from '@/hooks/useProfiles'
import useMatches from '@/hooks/useMatches'
import useMessages from '@/hooks/useMessages'
import useNotifications from '@/hooks/useNotifications'
import useUser from '@/hooks/useUser'
import { Profile, Match } from '@/types'

export default function DatingApp() {
  const [activeTab, setActiveTab] = useState("discover")
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isProfileSidebarVisible, setIsProfileSidebarVisible] = useState(false)
  const [sidebarContent, setSidebarContent] = useState<'navigation' | 'matches' | 'messages'>('navigation')
  const [showMatch, setShowMatch] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const { toast } = useToast()
  const { currentUser, setCurrentUser, editProfile } = useUser()
  const { profiles, currentProfileIndex, setCurrentProfileIndex, handleSwipe } = useProfiles()
  const { matches, addMatch } = useMatches()
  const { messages, sendMessage } = useMessages()
  const { notifications, addNotification } = useNotifications()

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
    if (isProfileSidebarVisible) setIsProfileSidebarVisible(false)
  }

  const toggleProfileSidebar = () => {
    setIsProfileSidebarVisible(!isProfileSidebarVisible)
    if (isSidebarVisible) setIsSidebarVisible(false)
  }

  const handleOpenMatchDetails = (match: Profile) => {
    setSelectedMatch(match)
  }

  const handleCloseMatchDetails = () => {
    setSelectedMatch(null)
  }

  const handleLike = async () => {
    await handleSwipe(1)
    const newMatch = profiles[currentProfileIndex]
    addMatch(newMatch)
    setShowMatch(true)
    setTimeout(() => setShowMatch(false), 1500)
    toast({
      title: "It's a match!",
      description: `You matched with ${newMatch.name}!`,
    })
    addNotification(`You matched with ${newMatch.name}!`)
  }

  const handleMatchFound = (match: Match) => {
    addMatch(match.users[1])
    setShowMatch(true)
    setTimeout(() => setShowMatch(false), 1500)
    toast({
      title: "It's a match!",
      description: `You matched with ${match.users[1].name}!`,
    })
    addNotification(`You matched with ${match.users[1].name}!`)
  }

  const handleMessageMatch = (matchId: string) => {
    // Implement logic to open chat with the matched user
    console.log(`Opening chat with match ID: ${matchId}`)
    setSidebarContent('messages')
    setIsSidebarVisible(true)
  }

  return (
    <MainLayout
      onToggleSidebar={toggleSidebar}
      onToggleProfileSidebar={toggleProfileSidebar}
      notifications={notifications}
      isSidebarVisible={isSidebarVisible}
      isProfileSidebarVisible={isProfileSidebarVisible}
      isMobile={isMobile}
    >
      <div className="flex h-screen overflow-hidden">
        {isSidebarVisible && (
        //   <div className="flex-shrink-0 w-80 overflow-hidden">
            <Sidebar
              isVisible={isSidebarVisible}
              onClose={toggleSidebar}
              content={sidebarContent}
              setContent={setSidebarContent}
              matches={matches}
              messages={messages}
              isMobile={isMobile}
            />
        //   </div>
        )}
        <div className="flex-grow overflow-hidden">
          <MainContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profiles={profiles}
            currentProfileIndex={currentProfileIndex}
            handleSwipe={handleSwipe}
            handleLike={handleLike}
            matches={matches}
            messages={messages}
            currentUser={currentUser}
            onOpenMatchDetails={handleOpenMatchDetails}
            onMatchFound={handleMatchFound}
            onMessageMatch={handleMessageMatch}
          />
        </div>
        {isProfileSidebarVisible && (
        //   <div className="flex-shrink-0 w-80 overflow-hidden">
            <ProfileSidebar
              isVisible={isProfileSidebarVisible}
              onClose={toggleProfileSidebar}
              currentUser={currentUser}
              onEditProfile={editProfile}
              isMobile={isMobile}
            />
        //   </div>
        )}
      </div>
      {showMatch && (
        <MatchAnimation
          currentUser={currentUser}
          matchedProfile={profiles[currentProfileIndex]}
          onClose={() => setShowMatch(false)}
        />
      )}
      {selectedMatch && (
        <MatchDetails
          match={selectedMatch}
          onClose={handleCloseMatchDetails}
          onMessage={(matchId) => {
            setActiveTab("messages")
            handleMessageMatch(matchId)
          }}
        />
      )}
    </MainLayout>
  )
}