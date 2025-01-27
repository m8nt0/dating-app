import { useState } from 'react'
import { Notification } from '@/types'

const initialNotifications: Notification[] = [
  {
    id: '1',
    content: 'You have a new match!',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    content: 'Emma sent you a message',
    timestamp: new Date().toISOString(),
    read: true,
  },
  // Add more notifications...
]

export default function useNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const addNotification = (content: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications((prevNotifications) => [newNotification, ...prevNotifications])
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    )
  }

  return {
    notifications,
    addNotification,
    markAsRead,
  }
}