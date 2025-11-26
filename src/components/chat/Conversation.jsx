import { useState, useEffect, useRef } from 'react'
import '../../styles/chat-page/Conversation.css'
import { useAuth } from '../../hooks/useAuth'

// ✅ FIXED: Correct API URL
const API_URL = 'http://localhost:3000'

/**
 * Conversation Component - FIXED VERSION
 */
function Conversation({ 
  chat, 
  onSendMessage, 
  onOpenProfile, 
  onArchiveChat, 
  onBack, 
  showArchived, 
  onUnarchiveChat, 
  onDeleteChat, 
  onPinChat, 
  onUnpinChat, 
  pinnedChats = [], 
  onChatUpdate 
}) {
  const [message, setMessage] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [messageContextMenu, setMessageContextMenu] = useState(null)
  const [showDeleteSubmenu, setShowDeleteSubmenu] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [pinnedMessages, setPinnedMessages] = useState([])
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0)
  const [deletedMessages, setDeletedMessages] = useState([])
  
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const isInitialMount = useRef(true)
  const menuRef = useRef(null)
  const messageContextMenuRef = useRef(null)
  const messageRefs = useRef({})
  const lastMessagesLengthRef = useRef(0)
  const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="40"%3E?%3C/text%3E%3C/svg%3E'
  const { currentUser } = useAuth()
  const getAvatarUrl = (avatar, API_URL = 'http://localhost:3000') => {
  if (!avatar) return DEFAULT_AVATAR;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('/uploads')) return `${API_URL}${avatar}`;
  if (avatar.startsWith('uploads/')) return `${API_URL}/${avatar}`;
  return avatar;
};

  useEffect(() => {
    if (chat?.id && chat.pinnedMessages) {
      setPinnedMessages(Array.isArray(chat.pinnedMessages) ? chat.pinnedMessages : [])
    } else {
      setPinnedMessages([])
    }
  }, [chat.id, chat.pinnedMessages])

  useEffect(() => {
    setCurrentPinnedIndex(0)
  }, [chat.id])

  useEffect(() => {
    if (chat?.id) {
      if (chat.deletedForMeMessages && Array.isArray(chat.deletedForMeMessages)) {
        setDeletedMessages(chat.deletedForMeMessages.map(id => String(id)))
      } else {
        setDeletedMessages([])
      }
    }
  }, [chat.id, chat.deletedForMeMessages])

  const isMessageDeletedForMe = (messageId) => {
    return deletedMessages.includes(String(messageId))
  }

  const canDeleteForAll = (message) => {
    if (!message.timestampDate || !message.isOwn) return false
    const messageTime = new Date(message.timestampDate)
    const now = new Date()
    const diffMinutes = (now - messageTime) / (1000 * 60)
    return diffMinutes <= 5
  }

  const handleDeleteForMe = async (messageId) => {
    if (!chat?.id) return
    
    const messageIdStr = String(messageId)
    const newDeleted = [...deletedMessages, messageIdStr]
    setDeletedMessages(newDeleted)
    
    try {
      await fetch(`${API_URL}/api/conversations/${chat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deletedForMeMessages: newDeleted
        })
      })
      
      const updatedChat = {
        ...chat,
        deletedForMeMessages: newDeleted
      }
      
      if (onChatUpdate) {
        onChatUpdate(updatedChat)
      }
    } catch (err) {
      console.error('Error deleting message for me:', err)
    }
    
    setMessageContextMenu(null)
    setShowDeleteSubmenu(false)
  }

  const handleDeleteForAll = async (messageId) => {
    if (!chat?.id) return
    
    const message = chat.messages.find(msg => msg.id === messageId)
    if (!message) return
    
    if (!canDeleteForAll(message)) {
      alert('You can only delete messages for everyone within 5 minutes of sending.')
      setMessageContextMenu(null)
      setShowDeleteSubmenu(false)
      return
    }
    
    const updatedMessages = chat.messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          deleted: true,
          text: 'This message was deleted',
          isDeleted: true
        }
      }
      return msg
    })
    
    const updatedChat = {
      ...chat,
      messages: updatedMessages
    }
    
    try {
      await fetch(`${API_URL}/api/conversations/${chat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages
        })
      })
      
      if (onChatUpdate) {
        onChatUpdate(updatedChat)
      }
    } catch (err) {
      console.error('Error deleting message:', err)
    }
    
    setMessageContextMenu(null)
    setShowDeleteSubmenu(false)
  }

  const handlePinMessage = async (messageId) => {
    if (!chat?.id) return
    
    let newPinned
    
    if (pinnedMessages.length >= 3) {
      newPinned = [...pinnedMessages.slice(1), messageId]
    } else {
      if (!pinnedMessages.includes(messageId)) {
        newPinned = [...pinnedMessages, messageId]
      } else {
        return
      }
    }
    
    setPinnedMessages(newPinned)
    
    try {
      await fetch(`${API_URL}/api/conversations/${chat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinnedMessages: newPinned
        })
      })
    } catch (err) {
      console.error('Error updating pinned messages:', err)
    }
  }

  const handleUnpinMessage = async (messageId) => {
    if (!chat?.id) return
    
    const newPinned = pinnedMessages.filter(id => id !== messageId)
    setPinnedMessages(newPinned)
    
    if (newPinned.length === 0) {
      setCurrentPinnedIndex(0)
    } else if (currentPinnedIndex >= newPinned.length) {
      setCurrentPinnedIndex(newPinned.length - 1)
    }
    
    try {
      await fetch(`${API_URL}/api/conversations/${chat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinnedMessages: newPinned
        })
      })
    } catch (err) {
      console.error('Error updating pinned messages:', err)
    }
  }

  const isMessagePinned = (messageId) => {
    return pinnedMessages.includes(messageId)
  }

  const getPinnedMessageObjects = () => {
    return pinnedMessages
      .map(id => chat.messages.find(msg => msg.id === id))
      .filter(msg => msg !== undefined)
  }

  const scrollToPinnedMessage = (messageId) => {
    const messageElement = messageRefs.current[messageId]
    if (messageElement && messagesContainerRef.current) {
      const containerRect = messagesContainerRef.current.getBoundingClientRect()
      const messageRect = messageElement.getBoundingClientRect()
      const scrollTop = messagesContainerRef.current.scrollTop
      const relativeTop = messageRect.top - containerRect.top + scrollTop
      
      messagesContainerRef.current.scrollTo({
        top: relativeTop - 20,
        behavior: 'smooth'
      })
    }
  }

  const handlePinnedMessageClick = () => {
    const pinnedObjects = getPinnedMessageObjects()
    if (pinnedObjects.length === 0) return
    
    const currentPinned = pinnedObjects[currentPinnedIndex]
    if (currentPinned) {
      scrollToPinnedMessage(currentPinned.id)
      
      if (pinnedObjects.length > 1) {
        setCurrentPinnedIndex((prevIndex) => (prevIndex + 1) % pinnedObjects.length)
      }
    }
  }

  const handleMessageContextMenu = (e, msg) => {
    e.preventDefault()
    e.stopPropagation()

    const menuWidth = 180
    const menuHeight = 100
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10)

    setMessageContextMenu({
      x: Math.max(10, x),
      y: Math.max(10, y),
      message: msg
    })
  }

  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true
    
    const container = messagesContainerRef.current
    const threshold = 100
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    
    return (scrollHeight - scrollTop - clientHeight) < threshold
  }

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      
      if (smooth) {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
        } else {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }
      } else {
        container.scrollTop = container.scrollHeight
      }
    }
  }

  useEffect(() => {
    const currentMessagesLength = chat.messages?.length || 0
    const messagesChanged = currentMessagesLength !== lastMessagesLengthRef.current
    
    const timeoutId = setTimeout(() => {
      if (isInitialMount.current) {
        scrollToBottom(false)
        isInitialMount.current = false
        lastMessagesLengthRef.current = currentMessagesLength
      } else if (messagesChanged && currentMessagesLength > lastMessagesLengthRef.current) {
        if (isNearBottom()) {
          scrollToBottom(true)
        }
        lastMessagesLengthRef.current = currentMessagesLength
      } else if (chat.isTyping) {
        if (isNearBottom()) {
          scrollToBottom(true)
        }
      }
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [chat.messages, chat.isTyping])

  useEffect(() => {
    isInitialMount.current = true
    lastMessagesLengthRef.current = 0
    setShowScrollToBottom(false)
    
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)
  }, [chat.id])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (!container) return
      const threshold = 100
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const isNear = (scrollHeight - scrollTop - clientHeight) < threshold
      setShowScrollToBottom(!isNear)
    }

    container.addEventListener('scroll', handleScroll)
    
    const timeoutId = setTimeout(() => {
      handleScroll()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [chat.messages, chat.id])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
      if (messageContextMenuRef.current && !messageContextMenuRef.current.contains(event.target)) {
        setMessageContextMenu(null)
        setShowDeleteSubmenu(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMessageContextMenu(null)
        setShowDeleteSubmenu(false)
      }
    }

    if (showMenu || messageContextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('contextmenu', handleClickOutside)
    }

    if (messageContextMenu || showDeleteSubmenu) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('contextmenu', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showMenu, messageContextMenu, showDeleteSubmenu])

  const handleSend = (e) => {
    e.preventDefault()
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  // ✅ Check if messages exist and is an array
  const rawMessages = Array.isArray(chat?.messages) ? chat.messages : []

  // Ensure each message has `isOwn` computed so the UI knows who sent it
  const messages = rawMessages.map((m) => {
    // Get current user ID - try multiple possible fields
    const currentId = currentUser?.id || currentUser?._id || currentUser?.userId

    // Derive sender id from possible nested shapes
    const senderId = m?.senderId?._id || m?.senderId || m?.sender?._id

    const isOwn = Boolean(
      m.isOwn || (senderId && currentId && String(senderId) === String(currentId))
    )

    return { ...m, isOwn }
  })

  return (
    <div className="conversation">
      <div className="conversation-header">
        {onBack && (
          <button className="back-btn mobile-only" onClick={onBack} title="Back to chat list">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div className="conversation-user-info" onClick={onOpenProfile} style={{ cursor: 'pointer' }}>
          <div className="conversation-avatar">
            <img src={getAvatarUrl(chat.avatar, API_URL)} alt={chat.name} onError={(e) => (e.target.src = DEFAULT_AVATAR)} />
            {chat.status && chat.status === 'Online' && (
              <span className="online-indicator"></span>
            )}
          </div>
          <div>
            <h3>{chat.name}</h3>
            {chat.status && chat.status === 'Online' && (
              <span className="status-text">Online</span>
            )}
          </div>
        </div>

        <div className="conversation-actions">
          {/* Removed call/video buttons as requested */}
          <div className="more-options-menu" ref={menuRef}>
            <button 
              className="icon-btn" 
              title="More options"
              onClick={() => setShowMenu(!showMenu)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10.8333C10.4602 10.8333 10.8333 10.4602 10.8333 10C10.8333 9.53976 10.4602 9.16667 10 9.16667C9.53976 9.16667 9.16667 9.53976 9.16667 10C9.16667 10.4602 9.53976 10.8333 10 10.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 5.00001C10.4602 5.00001 10.8333 4.62691 10.8333 4.16667C10.8333 3.70643 10.4602 3.33334 10 3.33334C9.53976 3.33334 9.16667 3.70643 9.16667 4.16667C9.16667 4.62691 9.53976 5.00001 10 5.00001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 16.6667C10.4602 16.6667 10.8333 16.2936 10.8333 15.8333C10.8333 15.3731 10.4602 15 10 15C9.53976 15 9.16667 15.3731 9.16667 15.8333C9.16667 16.2936 9.53976 16.6667 10 16.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {showMenu && (
              <div className="more-options-dropdown">
                {pinnedMessages.length > 0 && (() => {
                  const pinnedObjects = getPinnedMessageObjects()
                  const firstPinned = pinnedObjects[0]
                  return firstPinned ? (
                    <div className="menu-item-info" onClick={() => {
                      scrollToPinnedMessage(firstPinned.id)
                      setShowMenu(false)
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      View Pinned Messages ({pinnedMessages.length}/3)
                    </div>
                  ) : null
                })()}
                {pinnedChats.includes(String(chat.id)) ? (
                  onUnpinChat && (
                    <button
                      className="menu-item"
                      onClick={() => {
                        onUnpinChat(chat.id)
                        setShowMenu(false)
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Unpin Chat
                    </button>
                  )
                ) : (
                  onPinChat && (
                    <button
                      className="menu-item"
                      onClick={() => {
                        onPinChat(chat.id)
                        setShowMenu(false)
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Pin Chat
                    </button>
                  )
                )}
                {showArchived && onUnarchiveChat ? (
                  <button
                    className="menu-item"
                    onClick={() => {
                      onUnarchiveChat(chat.id)
                      setShowMenu(false)
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3333 2.66667L2.66667 13.3333M2.66667 2.66667L13.3333 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Unarchive
                  </button>
                ) : onArchiveChat ? (
                  <button
                    className="menu-item"
                    onClick={() => {
                      onArchiveChat(chat.id)
                      setShowMenu(false)
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 3.33333H14M2 3.33333V13.3333C2 14 2.66667 14.6667 3.33333 14.6667H12.6667C13.3333 14.6667 14 14 14 13.3333V3.33333M2 3.33333L2.66667 2H13.3333L14 3.33333M6.66667 7.33333H9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Archive
                  </button>
                ) : null}
                {onDeleteChat && (
                  <button
                    className="menu-item delete"
                    onClick={() => {
                      onDeleteChat(chat.id)
                      setShowMenu(false)
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="chat-link-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.33333 10.6667L4.66667 8L7.33333 5.33333M9.33333 5.33333L11.3333 7.33333C12.0697 8.06971 12.0697 9.26362 11.3333 10L9.33333 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Chat linked to: <a href="#">{chat.linkedTo || 'Product Inquiry'}</a>
      </div>

      {pinnedMessages.length > 0 && (() => {
        const pinnedObjects = getPinnedMessageObjects()
        const currentPinned = pinnedObjects[currentPinnedIndex]
        
        if (!currentPinned) return null
        
        return (
          <div className="pinned-messages-bar">
            <div 
              className="pinned-message-preview"
              onClick={handlePinnedMessageClick}
            >
              <div className="pinned-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="pinned-content">
                <div className="pinned-sender">{currentPinned.sender}</div>
                <div className="pinned-text">{currentPinned.text.length > 60 ? currentPinned.text.substring(0, 60) + '...' : currentPinned.text}</div>
              </div>
              <div className="pinned-actions">
                {pinnedObjects.length > 1 && (
                  <div className="pinned-indicators">
                    {pinnedObjects.map((_, index) => (
                      <span 
                        key={index} 
                        className={`pinned-dot ${index === currentPinnedIndex ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentPinnedIndex(index)
                          const selectedPinned = pinnedObjects[index]
                          if (selectedPinned) {
                            scrollToPinnedMessage(selectedPinned.id)
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
                <button
                  className="pinned-close-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnpinMessage(currentPinned.id)
                  }}
                  title="Unpin message"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      <div className="messages-container" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isPinned = isMessagePinned(msg.id)
            const isDeletedForMe = isMessageDeletedForMe(msg.id)
            const isDeletedForAll = msg.isDeleted || msg.deleted
            
            if (isDeletedForMe) return null
            
            return (
              <div 
                key={msg.id} 
                ref={(el) => {
                  if (el) {
                    messageRefs.current[msg.id] = el
                  } else {
                    delete messageRefs.current[msg.id]
                  }
                }}
                className={`message ${isPinned ? 'pinned' : ''} ${msg.isOwn ? 'own' : ''} ${isDeletedForAll ? 'deleted' : ''}`}
                onContextMenu={(e) => handleMessageContextMenu(e, msg)}
              >
                <div className="message-bubble">
                  {isPinned && (
                    <div className="pinned-indicator">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <p style={isDeletedForAll ? { fontStyle: 'italic', color: '#999' } : {}}>
                    {isDeletedForAll ? 'This message was deleted' : msg.text}
                  </p>
                </div>
                <div className="message-meta">
                  <span className="message-sender">{msg.sender}</span>
                  <span className="message-time">• {msg.timestamp}</span>
                  {isPinned && (
                    <button
                      className="unpin-btn"
                      onClick={() => handleUnpinMessage(msg.id)}
                      title="Unpin message"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  {msg.isOwn && (
                    <span className="message-status">
                      {msg.read ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 8L6 12L14 4" stroke="#5EB47C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 12L14 4" stroke="#5EB47C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 8L6 12L14 4" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
        {chat.isTyping === true && (
          <div className="typing-indicator">
            <span>...{chat.name.split(' ')[0]} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {showScrollToBottom && (
        <button
          className="scroll-to-bottom-btn"
          onClick={() => scrollToBottom(true)}
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 15L5 10M10 15L15 10M10 15V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {messageContextMenu && !showDeleteSubmenu && (
        <div
          ref={messageContextMenuRef}
          className="message-context-menu"
          style={{
            position: 'fixed',
            left: `${messageContextMenu.x}px`,
            top: `${messageContextMenu.y}px`,
            zIndex: 1000
          }}
        >
          {isMessagePinned(messageContextMenu.message.id) ? (
            <button
              className="context-menu-item"
              onClick={() => {
                handleUnpinMessage(messageContextMenu.message.id)
                setMessageContextMenu(null)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Unpin Message
            </button>
          ) : (
            <button
              className="context-menu-item"
              onClick={() => {
                if (pinnedMessages.length < 3) {
                  handlePinMessage(messageContextMenu.message.id)
                }
                setMessageContextMenu(null)
              }}
              disabled={pinnedMessages.length >= 3}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Pin Message
            </button>
          )}
          <button
            className="context-menu-item"
            onClick={() => {
              setShowDeleteSubmenu(true)
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete
          </button>
        </div>
      )}

      {messageContextMenu && showDeleteSubmenu && (
        <div
          ref={messageContextMenuRef}
          className="message-context-menu"
          style={{
            position: 'fixed',
            left: `${messageContextMenu.x}px`,
            top: `${messageContextMenu.y}px`,
            zIndex: 1000
          }}
        >
          <button
            className="context-menu-item"
            onClick={() => {
              handleDeleteForMe(messageContextMenu.message.id)
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete for me
          </button>
          {messageContextMenu.message.isOwn && (
            <button
              className="context-menu-item"
              onClick={() => {
                handleDeleteForAll(messageContextMenu.message.id)
              }}
              disabled={!canDeleteForAll(messageContextMenu.message)}
              title={!canDeleteForAll(messageContextMenu.message) ? 'Can only delete for everyone within 5 minutes of sending' : ''}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete for everyone
              {canDeleteForAll(messageContextMenu.message) && (
                <span style={{ fontSize: '11px', color: '#999', marginLeft: '4px' }}>(5 min)</span>
              )}
            </button>
          )}
          <button
            className="context-menu-item"
            onClick={() => {
              setShowDeleteSubmenu(false)
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cancel
          </button>
        </div>
      )}

      <form className="message-input-form" onSubmit={handleSend}>
        <button type="button" className="attachment-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.3333 10.8333V15.8333C18.3333 17.214 17.214 18.3333 15.8333 18.3333H4.16667C2.786 18.3333 1.66667 17.214 1.66667 15.8333V4.16667C1.66667 2.786 2.786 1.66667 4.16667 1.66667H9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.3333 1.66667H18.3333V6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.33333 11.6667L18.3333 1.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <input
          type="text"
          placeholder="Start typing to reply..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="submit" className="send-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.3333 1.66667L9.16667 10.8333M18.3333 1.66667L12.5 18.3333L9.16667 10.8333M18.3333 1.66667L1.66667 7.5L9.16667 10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
      <p className="input-hint">Press Enter to send, Shift+Enter for new line</p>
    </div>
  )
}

export default Conversation
