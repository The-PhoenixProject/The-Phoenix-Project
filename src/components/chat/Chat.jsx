// Chat.jsx - FIXED: Enhanced with proper notifications and persistent conversations
import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import { chatAPI } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import ChatList from './ChatList'
import Conversation from './Conversation'
import UserProfile from './UserProfile'
import '../../styles/chat-page/Chat.css'

const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="40"%3E?%3C/text%3E%3C/svg%3E'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const getAvatarUrl = (avatar, API = API_URL) => {
  if (!avatar) return DEFAULT_AVATAR
  if (typeof avatar !== 'string') return DEFAULT_AVATAR
  if (avatar.startsWith('http')) return avatar
  if (avatar.startsWith('/uploads')) return `${API}${avatar}`
  if (avatar.startsWith('uploads/')) return `${API}/${avatar}`
  return avatar
}

function Chat() {
  const location = useLocation()
  const { token, currentUser } = useAuth()
  const socketRef = useRef(null)
  
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileTab, setProfileTab] = useState('summary')
  const [showArchived, setShowArchived] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [pinnedChats, setPinnedChats] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  
  // ✅ NEW: Notification state
  const [notifications, setNotifications] = useState([])
  const [showNotificationBadge, setShowNotificationBadge] = useState(false)
  const [notificationSound] = useState(new Audio('/notification.mp3')) // Add this sound file to your public folder
  
  const [chatListWidth, setChatListWidth] = useState(350)
  const [profileWidth, setProfileWidth] = useState(320)
  const [_isResizingChatList, _setIsResizingChatList] = useState(false)
  const [_isResizingProfile, _setIsResizingProfile] = useState(false)
  
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1024)

  // Track if we've handled navigation
  const hasHandledNavigation = useRef(false)

  // ✅ FIX #1: Add or update conversation in sidebar function
  const addOrUpdateConversation = useCallback((conversationData) => {
    console.log('📝 Adding/updating conversation in sidebar:', conversationData.id)
    
    setConversations(prev => {
      const exists = prev.some(conv => String(conv.id) === String(conversationData.id))
      
      if (exists) {
        // Update existing conversation
        return prev.map(conv => 
          String(conv.id) === String(conversationData.id)
            ? { 
                ...conv, 
                ...conversationData,
                avatar: getAvatarUrl(conversationData.avatar),
                status: onlineUsers.has(conversationData.userId) ? 'Online' : 'Offline'
              }
            : conv
        )
      } else {
        // Add new conversation at the top
        return [
          {
            ...conversationData,
            avatar: getAvatarUrl(conversationData.avatar),
            status: onlineUsers.has(conversationData.userId) ? 'Online' : 'Offline',
            messages: conversationData.messages || [],
            pinnedMessages: conversationData.pinnedMessages || [],
            deletedForMeMessages: conversationData.deletedForMeMessages || [],
            unread: 0,
            archived: false,
            isActive: false
          },
          ...prev
        ]
      }
    })
  }, [onlineUsers])

  // ✅ NEW: Show notification badge for unread messages
  useEffect(() => {
    const hasUnread = conversations.some(conv => 
      !showArchived && 
      conv.archived !== true && 
      conv.unread > 0 && 
      (!selectedChat || conv.id !== selectedChat.id)
    )
    setShowNotificationBadge(hasUnread)
  }, [conversations, selectedChat, showArchived])

  // ✅ NEW: Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      notificationSound.currentTime = 0
      notificationSound.play().catch(() => {})
    } catch (err) {
      console.log('Notification sound error:', err)
    }
  }, [notificationSound])

  // ✅ NEW: Show browser notification
  const showBrowserNotification = (title, body, icon = '/logo.png') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body, icon })
        }
      })
    }
  }

  // Enhanced Socket.IO Setup with better error handling
  useEffect(() => {
    if (!token) {
      // console.log('⏸️  No token, skipping socket connection')
      return
    }

    // console.log('🔌 Initializing Socket.IO connection...')
    
    const socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    socket.on('connect', () => {
      // console.log('✅ Socket connected successfully')
      // console.log('   Socket ID:', socket.id)
      setConnectionStatus('connected')
      
      // Join all conversation rooms
      conversations.forEach(conv => {
        socket.emit('conversation:join', conv.id)
        // console.log('   Joined conversation:', conv.id)
      })
    })

    socket.on('disconnect', () => {
      // console.log('❌ Socket disconnected')
      setConnectionStatus('disconnected')
    })

    socket.on('connect_error', () => {
      // console.error('❌ Socket connection error')
      setConnectionStatus('error')
    })

    // ✅ FIX #3: Enhanced Message received handler with proper notifications
    socket.on('message:received', ({ conversationId, message }) => {
      console.log('📨 Message received:', { conversationId, from: message.sender })
      
      const isFromMe = message.senderId === currentUser?.id
      const isInActiveChat = selectedChat?.id === conversationId
      
      // Update conversations list with proper unread count
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          const shouldIncrement = !isFromMe && !isInActiveChat
          return {
            ...conv,
            lastMessage: message.text,
            time: message.timestampDate,
            timestampDate: message.timestampDate,
            unread: shouldIncrement ? (conv.unread || 0) + 1 : (conv.unread || 0)
          }
        }
        return conv
      }))

      // Update active chat messages if this is the selected conversation
      if (isInActiveChat && !isFromMe) {
        setSelectedChat(prev => {
          const messageExists = prev.messages?.some(m => m.id === message.id)
          if (messageExists) return prev
          
          return {
            ...prev,
            messages: [...(prev.messages || []), message],
            isTyping: false
          }
        })
      }
      
      // ✅ CRITICAL: Show notification ONLY if NOT from me AND NOT in active chat
      if (!isFromMe && !isInActiveChat) {
        const conversation = conversations.find(c => c.id === conversationId)
        const senderName = conversation?.name || message.sender || 'Someone'
        
        // Play sound
        playNotificationSound()
        
        // Show browser notification
        showBrowserNotification(
          `New message from ${senderName}`,
          message.text.length > 50 ? message.text.substring(0, 50) + '...' : message.text
        )
        
        // Add to notifications list
        setNotifications(prev => [{
          id: `msg-${Date.now()}`,
          type: 'message',
          title: `New message from ${senderName}`,
          message: message.text,
          conversationId,
          timestamp: new Date(),
          read: false
        }, ...prev.slice(0, 9)])
        
        console.log('🔔 Notification shown for message from', senderName)
      }
    })

    // ✅ ENHANCED: Notification handler
    socket.on('notification:new', (notification) => {
      // console.log('🔔 New notification received:', notification)
      
      // Acknowledge receipt
      socket.emit('notification:ack', { 
        notificationId: notification.id || notification.messageId 
      })
      
      // If it's a message notification and not in current chat
      if (notification.type === 'message' && selectedChat?.id !== notification.conversationId) {
        playNotificationSound()
        
        showBrowserNotification(
          `New message from ${notification.from}`,
          notification.preview || 'You have a new message'
        )
      }
      
      // Add to notifications list
      setNotifications(prev => [{
        id: notification.messageId || `notif-${Date.now()}`,
        type: notification.type,
        title: notification.type === 'message' ? `New message from ${notification.from}` : 'New notification',
        message: notification.preview || notification.message,
        conversationId: notification.conversationId,
        timestamp: new Date(notification.timestamp),
        read: false
      }, ...prev.slice(0, 9)])
    })

    // ✅ NEW: Handle new notification event
    socket.on('new:notification', (notification) => {
      // console.log('🔔 Direct notification event:', notification)
      
      if (notification.type === 'message' && selectedChat?.id !== notification.conversationId) {
        playNotificationSound()
        
        showBrowserNotification(
          `New message from ${notification.senderName}`,
          notification.preview || 'You have a new message'
        )
      }
    })

    socket.on('user:online', ({ userId }) => {
      // console.log('🟢 User online:', userId)
      setOnlineUsers(prev => new Set([...prev, userId]))
      
      setConversations(prev => prev.map(conv => 
        conv.userId === userId ? { ...conv, status: 'Online' } : conv
      ))
      
      if (selectedChat?.userId === userId) {
        setSelectedChat(prev => ({ ...prev, status: 'Online' }))
      }
    })

    socket.on('user:offline', ({ userId }) => {
      // console.log('🔴 User offline:', userId)
      setOnlineUsers(prev => {
        const updated = new Set(prev)
        updated.delete(userId)
        return updated
      })
      
      setConversations(prev => prev.map(conv => 
        conv.userId === userId ? { ...conv, status: 'Offline' } : conv
      ))
      
      if (selectedChat?.userId === userId) {
        setSelectedChat(prev => ({ ...prev, status: 'Offline' }))
      }
    })

    socket.on('typing:start', ({ conversationId, userId: typingUserId }) => {
      if (selectedChat?.id === conversationId && typingUserId !== currentUser?.id) {
        setSelectedChat(prev => ({ ...prev, isTyping: true }))
      }
    })

    socket.on('typing:stop', ({ conversationId }) => {
      if (selectedChat?.id === conversationId) {
        setSelectedChat(prev => ({ ...prev, isTyping: false }))
      }
    })

    socket.on('messages:read', ({ conversationId, readBy }) => {
      if (selectedChat?.id === conversationId) {
        setSelectedChat(prev => ({
          ...prev,
          messages: prev.messages.map(msg => ({
            ...msg,
            read: msg.read || msg.senderId === currentUser?.id || readBy === currentUser?.id
          }))
        }))
      }
    })

    socket.on('message:deleted', ({ conversationId, messageId }) => {
      if (selectedChat?.id === conversationId) {
        setSelectedChat(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: 'This message was deleted', isDeleted: true }
              : msg
          )
        }))
      }
    })

    socket.on('message:pinned', ({ conversationId, messageId }) => {
      if (selectedChat?.id === conversationId) {
        setSelectedChat(prev => ({
          ...prev,
          pinnedMessages: [...(prev.pinnedMessages || []), messageId]
        }))
      }
    })

    // ✅ NEW: Handle new message event
    socket.on('new:message', ({ conversationId, message, senderId }) => {
      // console.log('📬 New message event:', { conversationId, senderName })
      
      if (senderId !== currentUser?.id && selectedChat?.id !== conversationId) {
        playNotificationSound()
        
        // Update unread count for the conversation
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unread: (conv.unread || 0) + 1,
              lastMessage: message.text,
              timestampDate: message.timestampDate
            }
          }
          return conv
        }))
      }
    })

    // Pong response for testing
    socket.on('pong', () => {
      // console.log('🏓 Pong received:', data.timestamp)
    })

    // Cleanup
    return () => {
      // console.log('🔌 Cleaning up socket connection')
      socket.disconnect()
    }
  }, [token, currentUser, selectedChat?.id, conversations, selectedChat?.userId, playNotificationSound])

  // Test Socket.IO connection on mount
  useEffect(() => {
    if (socketRef.current?.connected) {
      // console.log('🏓 Testing Socket.IO with ping...')
      socketRef.current.emit('ping')
    }
  }, [socketRef.current?.connected])

  useEffect(() => {
    if (!selectedChat?.id) {
      return
    }
    
    if (!socketRef.current) {
      return
    }
    
    const chatId = selectedChat.id
    
    // console.log('Joining conversation:', chatId)
    socketRef.current.emit('conversation:join', chatId)
    
    // When chat is selected, mark all messages as read
    setConversations(prev => prev.map(conv => 
      conv.id === chatId ? { ...conv, unread: 0 } : conv
    ))
    
    return () => {
      if (socketRef.current) {
        console.log('Leaving conversation:', chatId)
        socketRef.current.emit('conversation:leave', chatId)
      }
    }
  }, [selectedChat?.id])

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      
      if (width < 768) {
        setChatListWidth(width)
      } else if (width < 1024) {
        if (chatListWidth > width * 0.4) {
          setChatListWidth(Math.max(250, width * 0.35))
        }
        if (profileWidth > width * 0.4) {
          setProfileWidth(Math.max(250, width * 0.35))
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [chatListWidth, profileWidth])

  const fetchConversations = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await chatAPI.getConversations(token)
      if (response.success && Array.isArray(response.data)) {
        setConversations(response.data.map(conv => ({
          ...conv,
          id: String(conv.id),
          avatar: getAvatarUrl(conv.avatar),
          messages: conv.messages || [],
          pinnedMessages: conv.pinnedMessages || [],
          deletedForMeMessages: conv.deletedForMeMessages || [],
          status: onlineUsers.has(conv.userId) ? 'Online' : 'Offline'
        })))
      }
      setError(null)
    } catch (err) {
      console.error('Failed to load chats:', err)
      setError('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }, [token, onlineUsers])

  useEffect(() => {
    if (token) {
      fetchConversations()
      fetchPinnedChats()
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    } else {
      setError('Please login to view conversations')
      setLoading(false)
    }
  }, [fetchConversations, token])

  const fetchPinnedChats = async () => {
    try {
      const localData = localStorage.getItem('pinnedChats')
      if (localData) {
        const pinnedArray = JSON.parse(localData)
        setPinnedChats(pinnedArray.map(id => String(id)))
      } else {
        setPinnedChats([])
      }
    } catch (err) {
      console.error('Error fetching pinned chats:', err)
      setPinnedChats([])
    }
  }

  const updatePinnedChats = async (newPinnedChats) => {
    try {
      localStorage.setItem('pinnedChats', JSON.stringify(newPinnedChats))
    } catch (err) {
      console.error('Error updating pinned chats:', err)
    }
  }

  const handleChatSelect = useCallback(async (chat) => {
    try {
      const convResponse = await chatAPI.getConversationById(chat.id, token)
      
      if (!convResponse.success) {
        throw new Error('Failed to load conversation')
      }
      
      const messagesResponse = await chatAPI.getMessages(chat.id, token)
      
      if (messagesResponse.success) {
        const fullChatData = {
          ...convResponse.data,
          avatar: getAvatarUrl(convResponse.data.avatar),
          messages: messagesResponse.data.messages || [],
          pinnedMessages: messagesResponse.data.pinnedMessages || [],
          deletedForMeMessages: messagesResponse.data.deletedForMeMessages || [],
          unread: 0, // Reset unread when opening chat
          status: onlineUsers.has(chat.userId) ? 'Online' : 'Offline'
        }
        
        setSelectedChat(fullChatData)
        
        setConversations(prev => prev.map(conv => ({
          ...conv,
          isActive: String(conv.id) === String(chat.id),
          unread: String(conv.id) === String(chat.id) ? 0 : conv.unread
        })))
      }
    } catch (err) {
      console.error('Error selecting chat:', err)
      setSelectedChat({
        ...chat,
        messages: [],
        pinnedMessages: [],
        deletedForMeMessages: [],
        status: onlineUsers.has(chat.userId) ? 'Online' : 'Offline'
      })
      
      setConversations(prev => prev.map(conv => ({
        ...conv,
        isActive: String(conv.id) === String(chat.id)
      })))
    }
  }, [token, onlineUsers])

  // Handle navigation from product page
  useEffect(() => {
    if (hasHandledNavigation.current) return
    
    const conversationId = location.state?.conversationId
    const conversationData = location.state?.conversationData
    const openImmediately = location.state?.openImmediately
    
    if (!conversationId || !openImmediately) {
      return
    }
    
    console.log('🎯 Handling navigation to conversation:', conversationId)
    console.log('📦 Conversation data:', conversationData)
    
    hasHandledNavigation.current = true
    
    if (conversationData) {
      console.log('✅ Using provided conversation data')
      
      const formattedConversation = {
        ...conversationData,
        id: String(conversationData.id || conversationId),
        avatar: getAvatarUrl(conversationData.avatar),
        messages: conversationData.messages || [],
        pinnedMessages: conversationData.pinnedMessages || [],
        deletedForMeMessages: conversationData.deletedForMeMessages || [],
        isActive: true,
        unread: 0,
        archived: false,
        name: conversationData.name || 'Unknown User',
        userId: conversationData.userId,
        status: onlineUsers.has(conversationData.userId) ? 'Online' : 'Offline',
        lastMessage: conversationData.lastMessage || 'Start chatting...',
        time: conversationData.time || new Date(),
        timestampDate: conversationData.timestampDate || new Date()
      }
      
      setSelectedChat(formattedConversation)
      
      // ✅ FIX #2: Use new function to add/update conversation
      addOrUpdateConversation(formattedConversation)
      return
    }
    
    const targetConversation = conversations.find(
      conv => String(conv.id) === String(conversationId)
    )
    
    if (targetConversation) {
      console.log('✅ Found conversation in list, opening it')
      handleChatSelect(targetConversation)
    } else {
      console.log('⚠️ Conversation not in list, fetching it...')
      const fetchAndOpenConversation = async () => {
        try {
          const convResponse = await chatAPI.getConversationById(conversationId, token)
          if (convResponse.success) {
            const messagesResponse = await chatAPI.getMessages(conversationId, token)
            
            const fullData = {
              ...convResponse.data,
              id: String(convResponse.data.id || conversationId),
              avatar: getAvatarUrl(convResponse.data.avatar),
              messages: messagesResponse.success ? messagesResponse.data.messages : [],
              pinnedMessages: messagesResponse.success ? messagesResponse.data.pinnedMessages : [],
              deletedForMeMessages: messagesResponse.success ? messagesResponse.data.deletedForMeMessages : [],
              isActive: true,
              unread: 0,
              archived: false,
              name: convResponse.data.name || 'Unknown User',
              userId: convResponse.data.userId,
              status: onlineUsers.has(convResponse.data.userId) ? 'Online' : 'Offline',
              lastMessage: convResponse.data.lastMessage || 'Start chatting...',
              time: convResponse.data.time || new Date(),
              timestampDate: convResponse.data.timestampDate || new Date()
            }
            
            setSelectedChat(fullData)
            
            // ✅ FIX #2: Use new function to add/update conversation
            addOrUpdateConversation(fullData)
          }
        } catch (error) {
          console.error('❌ Failed to fetch conversation:', error)
        }
      }
      
      fetchAndOpenConversation()
    }
  }, [conversations, handleChatSelect, location.state?.conversationData, location.state?.conversationId, location.state?.openImmediately, onlineUsers, token, addOrUpdateConversation])

  const handleArchiveChat = async (chatId) => {
    try {
      await chatAPI.archiveConversation(chatId, token)
      
      setConversations(prev => prev.map(conv => 
        String(conv.id) === String(chatId) 
          ? { ...conv, archived: true }
          : conv
      ))
      
      if (selectedChat && String(selectedChat.id) === String(chatId)) {
        const nextChat = conversations.find(conv => 
          !conv.archived && String(conv.id) !== String(chatId)
        )
        if (nextChat) {
          handleChatSelect(nextChat)
        } else {
          setSelectedChat(null)
        }
      }
    } catch (err) {
      console.error('Error archiving chat:', err)
    }
  }

  const handleUnarchiveChat = async (chatId) => {
    try {
      await chatAPI.unarchiveConversation(chatId, token)
      
      setConversations(prev => prev.map(conv => 
        String(conv.id) === String(chatId) 
          ? { ...conv, archived: false }
          : conv
      ))
      
      setShowArchived(false)
      const unarchivedChat = conversations.find(conv => String(conv.id) === String(chatId))
      if (unarchivedChat) {
        handleChatSelect({ ...unarchivedChat, archived: false })
      }
    } catch (err) {
      console.error('Error unarchiving chat:', err)
    }
  }

  const handleDeleteChat = async (chatId) => {
    const chatToDelete = conversations.find(conv => String(conv.id) === String(chatId))
    if (!chatToDelete) return

    setDeleteConfirm({
      chatId,
      chatName: chatToDelete.name
    })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { chatId } = deleteConfirm

    try {
      await chatAPI.deleteConversation(chatId, token)
      
      setConversations(prev => prev.filter(conv => String(conv.id) !== String(chatId)))
      
      if (selectedChat && String(selectedChat.id) === String(chatId)) {
        const nextChat = conversations.find(conv => 
          String(conv.id) !== String(chatId)
        )
        if (nextChat) {
          handleChatSelect(nextChat)
        } else {
          setSelectedChat(null)
        }
      }

      setDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting chat:', err)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const handleSendMessage = async (text) => {
    if (!selectedChat || !text.trim() || !socketRef.current) return

    try {
      // Create optimistic message for immediate display
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        text: text,
        senderId: currentUser?.id,
        sender: currentUser?.fullName || 'You',
        senderAvatar: currentUser?.profilePicture,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestampDate: new Date(),
        isOwn: true,
        read: false,
        isDeleted: false
      }

      // Update UI immediately (optimistic update)
      setSelectedChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), optimisticMessage],
        lastMessage: text,
        time: new Date(),
        timestampDate: new Date()
      }))

      // Update conversations list
      setConversations(prev => prev.map(c =>
        String(c.id) === String(selectedChat.id)
          ? { 
              ...c, 
              lastMessage: text, 
              time: new Date(), 
              timestampDate: new Date(),
              unread: 0 // Reset unread for own messages
            }
          : c
      ))

      // ✅ FIXED: Emit message via Socket.IO (this now saves to database AND sends notification)
      console.log('📤 Emitting message via Socket.IO to conversation:', selectedChat.id)
      socketRef.current.emit('message:send', {
        conversationId: selectedChat.id,
        message: text,
        recipientId: selectedChat.userId
      })

      // Also send via API to ensure persistence
      console.log('💾 Saving message to database via API...')
      const res = await chatAPI.sendMessage(selectedChat.id, text, token)
      
      if (res.success && res.data?.message) {
        const persistedMessage = res.data.message

        // Replace optimistic message with real message from server
        setSelectedChat(prev => ({
          ...prev,
          messages: prev.messages.map(m =>
            m.id === optimisticMessage.id ? persistedMessage : m
          )
        }))
        
        console.log('✅ Message saved via API')
      } else {
        console.log('⚠️ API save response:', res)
        // Keep optimistic message - it will be replaced when socket event arrives
      }
    } catch (err) {
      console.error('Send failed:', err)
      // Remove optimistic message on error
      setSelectedChat(prev => ({
        ...prev,
        messages: prev.messages.filter(m => !m.id.startsWith('temp-'))
      }))
    }
  }

  const handleTyping = (isTyping) => {
    if (!socketRef.current || !selectedChat) return
    
    if (isTyping) {
      socketRef.current.emit('typing:start', { conversationId: selectedChat.id })
    } else {
      socketRef.current.emit('typing:stop', { conversationId: selectedChat.id })
    }
  }

  // ✅ NEW: Clear notifications for a conversation
  const clearConversationNotifications = (conversationId) => {
    setNotifications(prev => prev.filter(notif => notif.conversationId !== conversationId))
  }

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading-container">
          <p>Loading conversations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <p className="error-hint">
            {error.includes('login') 
              ? 'Please log in to access chat' 
              : 'Make sure the backend server is running on port 3000'}
          </p>
          <button 
            className="btn-retry"
            onClick={fetchConversations}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      {connectionStatus !== 'connected' && (
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'disconnected' && '🔴 Disconnected'}
          {connectionStatus === 'error' && '⚠️ Connection Error'}
        </div>
      )}

      {/* ✅ Notification Badge */}
      {showNotificationBadge && (
        <div className="notification-badge-global">
          <span>New messages</span>
        </div>
      )}

      <div 
        className={`resizable-panel chat-list-wrapper ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
        style={{ 
          width: isMobile ? '100%' : `${chatListWidth}px`,
          display: isMobile && selectedChat ? 'none' : 'block'
        }}
      >
        <ChatList 
          conversations={showArchived
            ? conversations.filter(conv => conv.archived === true)
            : conversations.filter(conv => conv.archived !== true)
          }
          selectedChatId={selectedChat?.id}
          onChatSelect={(chat) => {
            handleChatSelect(chat)
            clearConversationNotifications(chat.id)
          }}
          showArchived={showArchived}
          onToggleArchived={() => {
            setShowArchived(!showArchived)
            if (selectedChat) {
              const isSelectedArchived = selectedChat.archived === true
              if (isSelectedArchived !== !showArchived) {
                setSelectedChat(null)
              }
            }
          }}
          onArchiveChat={handleArchiveChat}
          onUnarchiveChat={handleUnarchiveChat}
          onDeleteChat={handleDeleteChat}
          onViewProfile={(conversation) => {
            setSelectedChat(conversation)
            setProfileTab('summary')
            setIsProfileOpen(true)
            clearConversationNotifications(conversation.id)
          }}
          onViewProducts={(conversation) => {
            setSelectedChat(conversation)
            setProfileTab('products')
            setIsProfileOpen(true)
            clearConversationNotifications(conversation.id)
          }}
          pinnedChats={pinnedChats}
          onPinChat={async (chatId) => {
            const chatIdStr = String(chatId)
            let newPinned
            if (pinnedChats.length >= 3) {
              newPinned = [...pinnedChats.slice(1), chatIdStr]
            } else {
              if (!pinnedChats.includes(chatIdStr)) {
                newPinned = [...pinnedChats, chatIdStr]
              } else {
                return
              }
            }
            setPinnedChats(newPinned)
            await updatePinnedChats(newPinned)
          }}
          onUnpinChat={async (chatId) => {
            const chatIdStr = String(chatId)
            const newPinned = pinnedChats.filter(id => String(id) !== chatIdStr)
            setPinnedChats(newPinned)
            await updatePinnedChats(newPinned)
          }}
        />
        {!isMobile && (
          <div 
            className="resize-handle resize-handle-right"
            onMouseDown={(e) => {
              e.preventDefault()
              _setIsResizingChatList(true)
            }}
          />
        )}
      </div>

      {selectedChat ? (
        <>
          {isTablet && isProfileOpen ? (
            <div 
              className={`resizable-panel profile-wrapper ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
              style={{ 
                width: isMobile ? '100%' : isTablet ? 'auto' : `${profileWidth}px`,
                flex: isTablet ? 1 : undefined
              }}
            >
              {!isMobile && (
                <div 
                  className="resize-handle resize-handle-left"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    _setIsResizingProfile(true)
                  }}
                />
              )}
              <UserProfile 
                user={selectedChat} 
                initialTab={profileTab}
                onClose={() => setIsProfileOpen(false)}
              />
            </div>
          ) : (
            <>
              <Conversation 
                chat={selectedChat} 
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onOpenProfile={() => setIsProfileOpen(true)}
                onArchiveChat={!showArchived ? handleArchiveChat : undefined}
                onUnarchiveChat={showArchived ? handleUnarchiveChat : undefined}
                onDeleteChat={handleDeleteChat}
                showArchived={showArchived}
                onBack={isMobile ? () => setSelectedChat(null) : undefined}
                onPinChat={async (chatId) => {
                  const chatIdStr = String(chatId)
                  let newPinned
                  if (pinnedChats.length >= 3) {
                    newPinned = [...pinnedChats.slice(1), chatIdStr]
                  } else {
                    if (!pinnedChats.includes(chatIdStr)) {
                      newPinned = [...pinnedChats, chatIdStr]
                    } else {
                      return
                    }
                  }
                  setPinnedChats(newPinned)
                  await updatePinnedChats(newPinned)
                }}
                onUnpinChat={async (chatId) => {
                  const chatIdStr = String(chatId)
                  const newPinned = pinnedChats.filter(id => String(id) !== chatIdStr)
                  setPinnedChats(newPinned)
                  await updatePinnedChats(newPinned)
                }}
                pinnedChats={pinnedChats}
                onChatUpdate={(updatedChat) => {
                  setSelectedChat(updatedChat)
                  setConversations(prev => prev.map(conv => 
                    String(conv.id) === String(updatedChat.id) 
                      ? { ...conv, messages: updatedChat.messages, deletedForMeMessages: updatedChat.deletedForMeMessages || [] }
                      : conv
                  ))
                }}
              />
              {!isTablet && isProfileOpen && (
                <div 
                  className={`resizable-panel profile-wrapper ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
                  style={{ 
                    width: isMobile ? '100%' : `${profileWidth}px`
                  }}
                >
                  {!isMobile && (
                    <div 
                      className="resize-handle resize-handle-left"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        _setIsResizingProfile(true)
                      }}
                    />
                  )}
                  <UserProfile 
                    user={selectedChat} 
                    initialTab={profileTab}
                    onClose={() => setIsProfileOpen(false)}
                  />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="no-chat-selected">
          <div className="no-chat-message">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 8C18.745 8 8 18.745 8 32C8 45.255 18.745 56 32 56C45.255 56 56 45.255 56 32C56 18.745 45.255 8 32 8ZM32 52C21.514 52 12 42.486 12 32C12 21.514 21.514 12 32 12C42.486 12 52 21.514 52 32C52 42.486 42.486 52 32 52Z" fill="#999"/>
              <path d="M32 20C30.343 20 29 21.343 29 23C29 24.657 30.343 26 32 26C33.657 26 35 24.657 35 23C35 21.343 33.657 20 32 20ZM32 28C29.791 28 28 29.791 28 32V42C28 44.209 29.791 46 32 46C34.209 46 36 44.209 36 42V32C36 29.791 34.209 28 32 28Z" fill="#999"/>
            </svg>
            <h3>{showArchived ? 'No archived conversation selected' : 'No conversation selected'}</h3>
            <p>{showArchived ? 'Select an archived conversation to view messages' : 'Select a conversation to start chatting'}</p>
            {notifications.length > 0 && (
              <div className="notifications-preview">
                <p className="notifications-title">Recent notifications:</p>
                {notifications.slice(0, 3).map(notif => (
                  <div key={notif.id} className="notification-preview">
                    <span className="notification-dot"></span>
                    <span className="notification-text">
                      {notif.title}: {notif.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Conversation</h3>
              <button className="modal-close" onClick={cancelDelete}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the conversation with <strong>{deleteConfirm.chatName}</strong>?</p>
              <p className="modal-warning">This action cannot be undone. The conversation will be hidden from your chat list.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat