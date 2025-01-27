import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Match, Message } from '@/types'

interface SidebarProps {
  isVisible: boolean
  onClose: () => void
  content: 'navigation' | 'matches' | 'messages'
  setContent: (content: 'navigation' | 'matches' | 'messages') => void
  matches: Match[]
  messages: Message[]
  isMobile: boolean
}

export default function Sidebar({ isVisible, onClose, content, setContent, matches, messages, isMobile }: SidebarProps) {
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
      const width = startWidth + e.clientX - startX
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

  if (!isVisible) return null

  const handleNavigation = (direction: 'back' | 'forward') => {
    const contentOrder = ['navigation', 'matches', 'messages']
    const currentIndex = contentOrder.indexOf(content)
    let newIndex

    if (direction === 'back') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex
    } else {
      newIndex = currentIndex < contentOrder.length - 1 ? currentIndex + 1 : currentIndex
    }

    setContent(contentOrder[newIndex] as 'navigation' | 'matches' | 'messages')
  }

  return (
    <div 
      ref={sidebarRef}
      className={`bg-background border-r ${isMobile ? "fixed inset-y-14 left-0 right-0 z-50" : "relative"}`}
      style={{ width: isMobile ? '100%' : sidebarWidth, height: '100%' }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => handleNavigation('back')}>
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Navigate back</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleNavigation('forward')}>
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Navigate forward</span>
            </Button>
          </div>
          <h2 className="text-xl font-semibold">
            {content === 'navigation' ? 'Navigation' : content === 'matches' ? 'Matches' : 'Messages'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {content === 'navigation' && (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold mb-2">Matches</h3>
                <div className="space-y-2">
                  {matches.slice(0, 5).map((match) => (
                    <div key={match.id} className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={match.image} alt={match.name} />
                        <AvatarFallback>{match.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{match.name}</span>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-2 w-full" onClick={() => setContent('matches')}>
                  View all matches
                </Button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">Messages</h3>
                <div className="space-y-2">
                  {messages.slice(0, 5).map((message) => (
                    <div key={message.id} className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.senderImage} alt={message.senderName} />
                        <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{message.senderName}</p>
                        <p className="text-xs text-muted-foreground truncate">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-2 w-full" onClick={() => setContent('messages')}>
                  View all messages
                </Button>
              </div>
            </>
          )}
          {content === 'matches' && (
            <div className="p-4">
              <h3 className="font-semibold mb-4">All Matches</h3>
              <div className="grid grid-cols-2 gap-4">
                {matches.map((match) => (
                  <Card key={match.id} className="cursor-pointer">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={match.image} alt={match.name} />
                        <AvatarFallback>{match.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="mt-2 font-medium">{match.name}</h3>
                      <p className="text-sm text-muted-foreground">{match.location}</p>
                      <Button className="mt-2" size="sm">
                        Message
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {content === 'messages' && (
            <div className="p-4">
              <h3 className="font-semibold mb-4">All Messages</h3>
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className="cursor-pointer hover:bg-accent">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={message.senderImage} alt={message.senderName} />
                        <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-semibold">{message.senderName}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
      {!isMobile && (
        <div
          ref={resizeRef}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-border hover:bg-primary/50"
          aria-hidden="true"
        />
      )}
    </div>
  )
}