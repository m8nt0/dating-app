import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Camera, Edit, LogOut, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User } from '@/types'

interface ProfileSidebarProps {
  isVisible: boolean
  onClose: () => void
  currentUser: User
  onEditProfile: (updatedUser: User) => void
  isMobile: boolean
}

export default function ProfileSidebar({ isVisible, onClose, currentUser, onEditProfile, isMobile }: ProfileSidebarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(currentUser)
  const [sidebarWidth, setSidebarWidth] = useState('33.33%')
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sidebar = sidebarRef.current
    const resizeHandle = resizeRef.current
    let isResizing = false
    let startX: number
    let startWidth: number

    const onMouseDown = (e: MouseEvent) => {
      isResizing = true
      startX = e.clientX
      startWidth = sidebar?.offsetWidth || 0
    }

    const onMouseUp = () => {
      isResizing = false
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const width = startWidth - (e.clientX - startX)
      const parentWidth = sidebar?.parentElement?.offsetWidth || 0
      const widthPercentage = (width / parentWidth) * 100
      setSidebarWidth(`${Math.min(Math.max(widthPercentage, 33.33), 50)}%`)
    }

    resizeHandle?.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseMove)

    return () => {
      resizeHandle?.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  const handleSaveProfile = () => {
    onEditProfile(editedUser)
    setIsEditing(false)
  }

  if (!isVisible) return null;

  return (
    <div 
      ref={sidebarRef}
      className={`bg-background border-l ${isMobile ? "fixed inset-0 z-50" : "relative"}`}
      style={{ width: isMobile ? '100%' : sidebarWidth, height: '100%' }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Close profile</span>
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={editedUser.image} />
                <AvatarFallback>{editedUser.name[0]}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="sm">
                  <Camera className="h-4 w-4 mr-2" /> Change Photo
                </Button>
              )}
            </div>
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={editedUser.age}
                    onChange={(e) => setEditedUser({ ...editedUser, age: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editedUser.bio}
                    onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editedUser.location}
                    onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {editedUser.interests.map((interest, index) => <Badge key={index} variant="secondary">
                        {interest}
                        <button
                          className="ml-1 text-xs"
                          onClick={() => setEditedUser({
                            ...editedUser,
                            interests: editedUser.interests.filter((_, i) => i !== index)
                          })}
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    <Input
                      placeholder="Add interest"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const newInterest = (e.target as HTMLInputElement).value.trim();
                          if (newInterest) {
                            setEditedUser((prev) => ({
                              ...prev,
                              interests: [...prev.interests, newInterest]
                            }));
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{currentUser.name}, {currentUser.age}</h2>
                <p className="text-sm text-muted-foreground">{currentUser.location}</p>
                <p className="text-sm">{currentUser.bio}</p>
                <div>
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentUser.interests.map((interest, index) => (
                      <Badge key={index}>{interest}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
            {isEditing ? (
              <Button className="w-full" onClick={handleSaveProfile}>
                <Save className="mr-2 h-4 w-4" /> Save Profile
              </Button>
            ) : (
              <Button className="w-full" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            )}
            <Button variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </div>
        </ScrollArea>
      </div>
      {!isMobile && (
        <div
          ref={resizeRef}
          className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-border hover:bg-primary/50"
          aria-hidden="true"
        />
      )}
    </div>
  )
}