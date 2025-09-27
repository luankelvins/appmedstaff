export interface ChatUser {
  id: string
  name: string
  avatar?: string
  role: string
  department: string
  isOnline: boolean
  lastSeen?: string
}

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  receiverId?: string
  channelId?: string
  type: 'text' | 'image' | 'file' | 'system'
  timestamp: string
  edited?: boolean
  editedAt?: string
  replyTo?: string
  reactions?: ChatReaction[]
  attachments?: ChatAttachment[]
  readBy?: string[]
}

export interface ChatReaction {
  emoji: string
  userId: string
  timestamp: string
}

export interface ChatAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface ChatChannel {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'direct'
  members: string[]
  admins: string[]
  createdBy: string
  createdAt: string
  lastMessage?: ChatMessage
  unreadCount?: number
}

export interface ChatConversation {
  id: string
  participants: string[]
  type: 'direct' | 'group'
  name?: string
  lastMessage?: ChatMessage
  unreadCount?: number
  createdAt: string
  updatedAt: string
}

export interface ChatFilter {
  search?: string
  type?: 'all' | 'direct' | 'channels' | 'unread'
  department?: string
  dateFrom?: string
  dateTo?: string
}

export interface ChatStats {
  totalMessages: number
  totalConversations: number
  totalChannels: number
  onlineUsers: number
  unreadMessages: number
}

export interface TypingIndicator {
  userId: string
  conversationId: string
  timestamp: string
}

export interface ChatNotification {
  id: string
  type: 'message' | 'mention' | 'channel_invite'
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  read: boolean
}