import { useState } from 'react'
import { Message } from '@/types'

const initialMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    senderName: 'Emma',
    senderImage: '/placeholder.svg?height=400&width=300',
    content: 'Hey, how are you?',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    senderId: '3',
    senderName: 'James',
    senderImage: '/placeholder.svg?height=400&width=300',
    content: 'Want to grab coffee sometime?',
    timestamp: new Date().toISOString(),
  },
  // Add more messages...
]

export default function useMessages() {
  const [messages, setMessages] = useState(initialMessages)

  const sendMessage = (content: string, recipientId: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'currentUserId', // Replace with actual current user ID
      senderName: 'You',
      senderImage: '/placeholder.svg?height=400&width=300', // Replace with actual current user image
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages((prevMessages) => [newMessage, ...prevMessages])
  }

  return {
    messages,
    sendMessage,
  }
}