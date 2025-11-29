// Chat.jsx - COMPLETE FIX WITH STATUS & MESSAGES
import { useState, useEffect, useRef } from 'react'
import { useLocation} from 'react-router-dom'
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
  
  const [chatListWidth, setChatListWidth] = useState(350)
  const [profileWidth, setProfileWidth] = useState(320)
  const [isResizingChatList, setIsResizingChatList] = useState(false)
  const [isResizingProfile, setIsResizingProfile] = useState(false)
  
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [isTablet, setIsTablet] = useState(() => window.innerWidth >= 768 && window.innerWidth < 1024)

  // ==========================================
  // Socket.IO Setup
  // ==========================================

  useEffect(() => {
    if (!token) return

    const socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    socketRef.current = socket

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ Socket connected')
      setConnectionStatus('connected')
      
      conversations.forEach(conv => {
        socket.emit('conversation:join', conv.id)
      })
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setConnectionStatus('disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnectionStatus('error')
    })

    // User online/offline status
    socket.on('user:online', ({ userId }) => {
      console.log('🟢 User online:', userId)
      setOnlineUsers(prev => new Set([...prev, userId]))
      
      setConversations(prev => prev.map(conv => 
        conv.userId === userId ? { ...conv, status: 'Online' } : conv
      ))
      
      if (selectedChat?.userId === userId) {
        setSelectedChat(prev => ({ ...prev, status: 'Online' }))
      }
    })

    socket.on('user:offline', ({ userId }) => {
      console.log('🔴 User offline:', userId)
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

    // Message handlers
    socket.on('message:received', ({ conversationId, message }) => {
      console.log('📨 New message received:', message)
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: message.text,
            time: message.timestampDate,
            timestampDate: message.timestampDate,
            unread: selectedChat?.id === conversationId ? 0 : (conv.unread || 0) + 1
          }
        }
        return conv
      }))

      if (selectedChat?.id === conversationId) {
        setSelectedChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), message],
          isTyping: false
        }))
      }
    })

    // Typing indicators
    socket.on('typing:start', ({ conversationId, userId: typingUserId }) => {
      if (selectedChat?.id === conversationId && typingUserId !== currentUser?.id) {
        setSelectedChat(prev => ({
          ...prev,
          isTyping: true
        }))
      }
    })

    socket.on('typing:stop', ({ conversationId }) => {
      if (selectedChat?.id === conversationId) {
        setSelectedChat(prev => ({
          ...prev,
          isTyping: false
        }))
      }
    })

    // Read receipts
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

    // Message deleted
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

    // Message pinned
    socket.on('message:pinned', ({ conversationId, messageId }) => {
      if (selectedChat?.id === conversationId) {
        setSelectedChat(prev => ({
          ...prev,
          pinnedMessages: [...(prev.pinnedMessages || []), messageId]
        }))
      }
    })

    // Notifications
    socket.on('notification:new', (notification) => {
      console.log('🔔 New notification:', notification)
    })

    return () => {
      socket.disconnect()
    }
  }, [token, currentUser, selectedChat?.id, conversations])

  // Join conversation room when selected
  useEffect(() => {
    if (socketRef.current && selectedChat) {
      socketRef.current.emit('conversation:join', selectedChat.id)
      
      return () => {
        if (socketRef.current) {
          socketRef.current.emit('conversation:leave', selectedChat.id)
        }
      }
    }
  }, [selectedChat?.id])

  // ==========================================
  // Existing Effects
  // ==========================================

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

  useEffect(() => {
    if (token) {
      fetchConversations()
      fetchPinnedChats()
    } else {
      setError('Please login to view conversations')
      setLoading(false)
    }
  }, [token])

  // Handle navigation from product card
  useEffect(() => {
    const conversationId = location.state?.conversationId
    
    if (conversationId && conversations.length > 0 && !selectedChat) {
      const targetConversation = conversations.find(
        conv => String(conv.id) === String(conversationId)
      )
      
      if (targetConversation) {
        handleChatSelect(targetConversation)
      }
    }
  }, [location.state, conversations, selectedChat])

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

  useEffect(() => {
    if (isMobile) {
      if (isResizingChatList) setIsResizingChatList(false)
      if (isResizingProfile) setIsResizingProfile(false)
      return
    }

    const handleMouseMove = (e) => {
      if (isResizingChatList) {
        const newWidth = e.clientX
        const minWidth = isTablet ? 200 : 250
        const maxWidth = isTablet ? 400 : 600
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setChatListWidth(newWidth)
        }
      }
      if (isResizingProfile) {
        const newWidth = window.innerWidth - e.clientX
        const minWidth = isTablet ? 200 : 250
        const maxWidth = isTablet ? 400 : 600
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setProfileWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizingChatList(false)
      setIsResizingProfile(false)
    }

    if (isResizingChatList || isResizingProfile) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizingChatList, isResizingProfile, isMobile, isTablet])

  // ==========================================
  // API Functions
  // ==========================================

  const fetchConversations = async () => {
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
  }

  // ==========================================
  // Chat Selection & Management
  // ==========================================

  const handleChatSelect = async (chat) => {
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
          unread: 0,
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
  }

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

  // ==========================================
  // Message Handling
  // ==========================================

  const handleSendMessage = async (text) => {
    if (!selectedChat || !text.trim() || !socketRef.current) return

    try {
      const res = await chatAPI.sendMessage(selectedChat.id, text, token)
      if (res.success && res.data?.message) {
        const newMsg = res.data.message
        setSelectedChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), newMsg]
        }))
        setConversations(prev => prev.map(c =>
          c.id === selectedChat.id
            ? { ...c, lastMessage: text, time: new Date(), timestampDate: new Date() }
            : c
        ))
      }
    } catch (err) {
      console.error('Send failed:', err)
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

  // ==========================================
  // Render
  // ==========================================

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
          onChatSelect={handleChatSelect}
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
          }}
          onViewProducts={(conversation) => {
            setSelectedChat(conversation)
            setProfileTab('products')
            setIsProfileOpen(true)
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
              setIsResizingChatList(true)
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
                    setIsResizingProfile(true)
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
                        setIsResizingProfile(true)
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