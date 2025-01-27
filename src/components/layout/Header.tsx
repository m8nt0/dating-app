import { Bell, Home, Menu, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Notification } from '@/types'

interface HeaderProps {
  onToggleSidebar: () => void
  onToggleProfileSidebar: () => void
  notifications: Notification[]
}

export default function Header({ onToggleSidebar, onToggleProfileSidebar, notifications }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="w-1/3 flex items-center">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2">
          <Menu className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <Home className="h-6 w-6" />
        </Button>
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
        Lovli
      </h1>
      <div className="flex items-center space-x-4 w-1/3 justify-end">
        <Button variant="ghost" size="icon" onClick={onToggleProfileSidebar}>
          <User className="h-6 w-6" />
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Bell className="h-6 w-6" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[300px]">
              {notifications.map(notification => (
                <div key={notification.id} className="p-2 hover:bg-accent rounded">
                  {notification.content}
                </div>
              ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}