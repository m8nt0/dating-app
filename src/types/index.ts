export interface User {
    id: string
    name: string
    age: number
    image: string
    bio: string
    location: string
    interests: string[]
    isPremium: boolean
}

export interface Profile {
    id: string
    name: string
    age: number
    image: string
    bio: string
    location: string
    interests: string[]
}

export interface Match extends Profile {
    lastMessage: string
    timestamp: string
    users: Profile[]
}

export interface Message {
    id: string
    senderId: string
    senderName: string
    senderImage: string
    content: string
    timestamp: string
}

export interface Notification {
    id: string
    content: string
    timestamp: string
    read: boolean
}