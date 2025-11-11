import { useState, useEffect, useRef } from 'react'
import '../../styles/chat-page/Conversation.css'

// API Configuration
const API_URL = 'http://localhost:3001'

/**
 * Conversation Component
 * 
 * Displays the active chat conversation with messages, pinned messages bar,
 * message context menu, and input form. Handles message deletion (for me/for all),
 * pinning/unpinning messages, and auto-scrolling behavior.
 * 
 * @param {Object} chat - The current chat conversation object
 * @param {Function} onSendMessage - Callback to send a new message
 * @param {Function} onOpenProfile - Callback to open user profile
 * @param {Function} onArchiveChat - Callback to archive the chat
 * @param {Function} onBack - Callback for back button (mobile only)
 * @param {boolean} showArchived - Whether archived chats are being shown
 * @param {Function} onUnarchiveChat - Callback to unarchive the chat
 * @param {Function} onDeleteChat - Callback to delete the chat
 * @param {Function} onPinChat - Callback to pin the chat
 * @param {Function} onUnpinChat - Callback to unpin the chat
 * @param {Array} pinnedChats - Array of pinned chat IDs
 * @param {Function} onChatUpdate - Callback to update chat state in parent
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
  // ==========================================
  // State Management
  // ==========================================
  
  // Message input state
  const [message, setMessage] = useState('')
  
  // UI state
  const [showMenu, setShowMenu] = useState(false) // Header menu dropdown
  const [messageContextMenu, setMessageContextMenu] = useState(null) // Right-click context menu
  const [showDeleteSubmenu, setShowDeleteSubmenu] = useState(false) // Delete submenu state
  const [showScrollToBottom, setShowScrollToBottom] = useState(false) // Scroll to bottom button visibility
  
  // Pinned messages state
  const [pinnedMessages, setPinnedMessages] = useState([]) // Array of pinned message IDs
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0) // Current pinned message index in bar
  
  // Deleted messages state (for "delete for me" functionality)
  const [deletedMessages, setDeletedMessages] = useState([]) // Array of message IDs deleted for current user
  
  // Refs for DOM elements and tracking
  const messagesEndRef = useRef(null) // Reference to end of messages for scrolling
  const messagesContainerRef = useRef(null) // Reference to messages container
  const isInitialMount = useRef(true) // Track if component just mounted
  const menuRef = useRef(null) // Reference to header menu dropdown
  const messageContextMenuRef = useRef(null) // Reference to message context menu
  const messageRefs = useRef({}) // Map of message IDs to DOM elements for scrolling
  const lastMessagesLengthRef = useRef(0) // Track previous message count for auto-scroll

  // ==========================================
  // Effects - Data Loading
  // ==========================================

  /**
   * Load pinned messages from chat data when chat changes
   * Ensures pinned messages array is always valid
   */
  useEffect(() => {
    if (chat?.id && chat.pinnedMessages) {
      setPinnedMessages(Array.isArray(chat.pinnedMessages) ? chat.pinnedMessages : [])
    } else {
      setPinnedMessages([])
    }
  }, [chat.id, chat.pinnedMessages])

  /**
   * Reset pinned message index when switching conversations
   * Always start at the first pinned message when viewing a new chat
   */
  useEffect(() => {
    setCurrentPinnedIndex(0)
  }, [chat.id])

  /**
   * Load deleted messages from database for current chat
   * Messages deleted "for me" are stored in the conversation object in the database
   */
  useEffect(() => {
    if (chat?.id) {
      // Load from chat object (from database)
      if (chat.deletedForMeMessages && Array.isArray(chat.deletedForMeMessages)) {
        setDeletedMessages(chat.deletedForMeMessages.map(id => String(id)))
      } else {
        setDeletedMessages([])
      }
    }
  }, [chat.id, chat.deletedForMeMessages])

  // ==========================================
  // Message Deletion Helpers
  // ==========================================

  /**
   * Check if a message is deleted for the current user
   * @param {number|string} messageId - The message ID to check
   * @returns {boolean} True if message is deleted for current user
   */
  const isMessageDeletedForMe = (messageId) => {
    return deletedMessages.includes(String(messageId))
  }

  /**
   * Check if a message can be deleted for everyone
   * Requirements: Must be own message and sent within last 5 minutes
   * @param {Object} message - The message object to check
   * @returns {boolean} True if message can be deleted for everyone
   */
  const canDeleteForAll = (message) => {
    if (!message.timestampDate || !message.isOwn) return false
    const messageTime = new Date(message.timestampDate)
    const now = new Date()
    const diffMinutes = (now - messageTime) / (1000 * 60)
    return diffMinutes <= 5
  }

  /**
   * Delete message for me - hides message from current user only
   * Stores deletion in database, does not affect other users
   * @param {number|string} messageId - The message ID to delete
   */
  const handleDeleteForMe = async (messageId) => {
    if (!chat?.id) return
    
    const messageIdStr = String(messageId)
    const newDeleted = [...deletedMessages, messageIdStr]
    setDeletedMessages(newDeleted)
    
    // Update database
    try {
      await fetch(`${API_URL}/conversations/${chat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deletedForMeMessages: newDeleted
        })
      })
      
      // Update local chat state
      const updatedChat = {
        ...chat,
        deletedForMeMessages: newDeleted
      }
      
      // Notify parent component of update
      if (onChatUpdate) {
        onChatUpdate(updatedChat)
      }
    } catch (err) {
      console.error('Error deleting message for me:', err)
    }
    
    // Close menus
    setMessageContextMenu(null)
    setShowDeleteSubmenu(false)
  }

  /**
   * Delete message for everyone - updates database to show "This message was deleted"
   * Only available for own messages within 5 minutes of sending
   * @param {number|string} messageId - The message ID to delete
   */
  const handleDeleteForAll = async (messageId) => {
    if (!chat?.id) return
    
    const message = chat.messages.find(msg => msg.id === messageId)
    if (!message) return
    
    // Validate deletion eligibility (own message, within 5 minutes)
    if (!canDeleteForAll(message)) {
      alert('You can only delete messages for everyone within 5 minutes of sending.')
      setMessageContextMenu(null)
      setShowDeleteSubmenu(false)
      return
    }
    
    // Mark message as deleted in messages array
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
    
    // Update local state
    const updatedChat = {
      ...chat,
      messages: updatedMessages
    }
    
    // Update database
    try {
      await fetch(`${API_URL}/conversations/${chat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages
        })
      })
      
      // Notify parent component of update
      if (onChatUpdate) {
        onChatUpdate(updatedChat)
      }
    } catch (err) {
      console.error('Error deleting message:', err)
    }
    
    // Close menus
    setMessageContextMenu(null)
    setShowDeleteSubmenu(false)
  }

  // ==========================================
  // Pinned Messages Management
  // ==========================================

  /**
   * Pin a message (maximum 3 pinned messages allowed)
   * If limit reached, removes oldest pinned message and adds new one
   * @param {number|string} messageId - The ID of the message to pin
   */
  const handlePinMessage = async (messageId) => {
    if (!chat?.id) return
    
    let newPinned
    
    if (pinnedMessages.length >= 3) {
      // Remove oldest pinned message (FIFO - first in, first out)
      newPinned = [...pinnedMessages.slice(1), messageId]
    } else {
      // Add new pinned message if not already pinned
      if (!pinnedMessages.includes(messageId)) {
        newPinned = [...pinnedMessages, messageId]
      } else {
        return // Message already pinned
      }
    }
    
    setPinnedMessages(newPinned)
    
    // Persist to database
    try {
      await fetch(`${API_URL}/conversations/${chat.id}`, {
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

  /**
   * Unpin a message and adjust current pinned index if necessary
   * @param {number|string} messageId - The ID of the message to unpin
   */
  const handleUnpinMessage = async (messageId) => {
    if (!chat?.id) return
    
    const newPinned = pinnedMessages.filter(id => id !== messageId)
    setPinnedMessages(newPinned)
    
    // Adjust current pinned index to stay within bounds
    if (newPinned.length === 0) {
      setCurrentPinnedIndex(0)
    } else if (currentPinnedIndex >= newPinned.length) {
      setCurrentPinnedIndex(newPinned.length - 1)
    }
    
    // Persist to database
    try {
      await fetch(`${API_URL}/conversations/${chat.id}`, {
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

  /**
   * Check if a message is currently pinned
   * @param {number|string} messageId - The ID of the message to check
   * @returns {boolean} True if message is pinned
   */
  const isMessagePinned = (messageId) => {
    return pinnedMessages.includes(messageId)
  }

  /**
   * Get pinned message objects in the order they were pinned
   * Filters out any pinned message IDs that no longer exist in chat messages
   * @returns {Array} Array of pinned message objects
   */
  const getPinnedMessageObjects = () => {
    return pinnedMessages
      .map(id => chat.messages.find(msg => msg.id === id))
      .filter(msg => msg !== undefined)
  }

  /**
   * Scroll to a specific pinned message in the messages container
   * Uses smooth scrolling with a small offset from the top
   * @param {number|string} messageId - The ID of the message to scroll to
   */
  const scrollToPinnedMessage = (messageId) => {
    const messageElement = messageRefs.current[messageId]
    if (messageElement && messagesContainerRef.current) {
      const containerRect = messagesContainerRef.current.getBoundingClientRect()
      const messageRect = messageElement.getBoundingClientRect()
      const scrollTop = messagesContainerRef.current.scrollTop
      const relativeTop = messageRect.top - containerRect.top + scrollTop
      
      messagesContainerRef.current.scrollTo({
        top: relativeTop - 20, // 20px offset from top for better visibility
        behavior: 'smooth'
      })
    }
  }

  /**
   * Handle clicking on pinned message bar
   * Scrolls to current pinned message and advances to next pinned message
   */
  const handlePinnedMessageClick = () => {
    const pinnedObjects = getPinnedMessageObjects()
    if (pinnedObjects.length === 0) return
    
    const currentPinned = pinnedObjects[currentPinnedIndex]
    if (currentPinned) {
      scrollToPinnedMessage(currentPinned.id)
      
      // Auto-advance to next pinned message (circular)
      if (pinnedObjects.length > 1) {
        setCurrentPinnedIndex((prevIndex) => (prevIndex + 1) % pinnedObjects.length)
      }
    }
  }


  // ==========================================
  // Context Menu Handling
  // ==========================================

  /**
   * Handle right-click on message to show context menu
   * Calculates menu position to ensure it stays within viewport bounds
   * @param {Event} e - The mouse event
   * @param {Object} msg - The message object that was right-clicked
   */
  const handleMessageContextMenu = (e, msg) => {
    e.preventDefault()
    e.stopPropagation()

    // Calculate menu position, ensuring it stays within viewport
    const menuWidth = 180
    const menuHeight = 100
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10)

    setMessageContextMenu({
      x: Math.max(10, x), // Minimum 10px from left edge
      y: Math.max(10, y), // Minimum 10px from top edge
      message: msg
    })
  }

  // ==========================================
  // Scroll Management
  // ==========================================

  /**
   * Check if user is near the bottom of the messages container
   * @returns {boolean}
   */
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true
    
    const container = messagesContainerRef.current
    const threshold = 100 // pixels from bottom
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    
    return (scrollHeight - scrollTop - clientHeight) < threshold
  }

  /**
   * Scroll to bottom of messages container
   * @param {boolean} smooth - Whether to use smooth scrolling
   */
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      
      if (smooth) {
        // Use scrollIntoView for smooth scrolling
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
        } else {
          // Fallback to scrollTop with smooth behavior
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }
      } else {
        // Instant scroll using scrollTop
        container.scrollTop = container.scrollHeight
      }
    }
  }

  /**
   * Auto-scroll behavior on new messages
   * 
   * Scrolls to bottom when:
   * - Component first mounts (initial load)
   * - New messages are added AND user is near bottom
   * - Typing indicator appears AND user is near bottom
   * 
   * Does NOT scroll if user has scrolled up to read older messages
   */
  useEffect(() => {
    const currentMessagesLength = chat.messages?.length || 0
    const messagesChanged = currentMessagesLength !== lastMessagesLengthRef.current
    
    // Small delay to ensure DOM has updated before scrolling
    const timeoutId = setTimeout(() => {
      if (isInitialMount.current) {
        // Always scroll on initial mount (first load)
        scrollToBottom(false)
        isInitialMount.current = false
        lastMessagesLengthRef.current = currentMessagesLength
      } else if (messagesChanged && currentMessagesLength > lastMessagesLengthRef.current) {
        // New messages added - only auto-scroll if user is near bottom
        if (isNearBottom()) {
          scrollToBottom(true)
        }
        lastMessagesLengthRef.current = currentMessagesLength
      } else if (chat.isTyping) {
        // Typing indicator shown - scroll if user is near bottom
        if (isNearBottom()) {
          scrollToBottom(true)
        }
      }
    }, 50) // 50ms delay to ensure DOM updates complete

    return () => clearTimeout(timeoutId)
  }, [chat.messages, chat.isTyping])

  /**
   * Reset scroll state when switching to a different chat
   * Resets initial mount flag and scrolls to bottom of new chat
   */
  useEffect(() => {
    isInitialMount.current = true
    lastMessagesLengthRef.current = 0
    setShowScrollToBottom(false)
    
    // Scroll to bottom when switching chats (after DOM update)
    setTimeout(() => {
      scrollToBottom(false)
    }, 100)
  }, [chat.id])

  /**
   * Show/hide scroll to bottom button based on scroll position
   * Button appears when user scrolls up (more than 100px from bottom)
   * Button hides when user is near bottom
   */
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (!container) return
      const threshold = 100 // pixels from bottom
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const isNear = (scrollHeight - scrollTop - clientHeight) < threshold
      setShowScrollToBottom(!isNear) // Show button when NOT near bottom
    }

    container.addEventListener('scroll', handleScroll)
    
    // Check initial state after DOM is ready
    const timeoutId = setTimeout(() => {
      handleScroll()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [chat.messages, chat.id])

  /**
   * Close menus when clicking outside or pressing Escape
   * Handles both header dropdown menu and message context menu
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close header dropdown if clicking outside
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
      // Close message context menu if clicking outside
      if (messageContextMenuRef.current && !messageContextMenuRef.current.contains(event.target)) {
        setMessageContextMenu(null)
        setShowDeleteSubmenu(false)
      }
    }

    const handleEscape = (event) => {
      // Close context menu and submenu on Escape key
      if (event.key === 'Escape') {
        setMessageContextMenu(null)
        setShowDeleteSubmenu(false)
      }
    }

    // Add event listeners when menus are open
    if (showMenu || messageContextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('contextmenu', handleClickOutside)
    }

    if (messageContextMenu || showDeleteSubmenu) {
      document.addEventListener('keydown', handleEscape)
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('contextmenu', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showMenu, messageContextMenu, showDeleteSubmenu])

  // ==========================================
  // Message Input Handling
  // ==========================================

  /**
   * Handle message form submission
   * Sends message if not empty and clears input field
   * @param {Event} e - Form submit event
   */
  const handleSend = (e) => {
    e.preventDefault()
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  /**
   * Handle keyboard input in message field
   * Enter key sends message, Shift+Enter creates new line
   * @param {Event} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="conversation">
      {/* Header */}
      <div className="conversation-header">
        {/* Back Button (Mobile Only) */}
        {onBack && (
          <button className="back-btn mobile-only" onClick={onBack} title="Back to chat list">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* User Info (Clickable to open profile) */}
        <div className="conversation-user-info" onClick={onOpenProfile} style={{ cursor: 'pointer' }}>
          <div className="conversation-avatar">
            <img src={chat.avatar} alt={chat.name} />
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

        {/* Action Buttons */}
        <div className="conversation-actions">
          <button className="icon-btn" title="Call">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.3333 14.075V16.575C18.3333 17.2217 17.845 17.775 17.2083 17.875C16.6917 17.9583 16.15 18 15.5833 18C8.10833 18 2 11.8917 2 4.41667C2 3.85 2.04167 3.30833 2.125 2.79167C2.225 2.155 2.77833 1.66667 3.425 1.66667H5.925C6.35 1.66667 6.70833 1.99167 6.775 2.40833L7.45833 6.19167C7.51667 6.56667 7.35 6.93333 7.04167 7.15L5.20833 8.525C6.40833 10.8917 9.10833 13.5917 11.475 14.7917L12.85 12.9583C13.0667 12.65 13.4333 12.4833 13.8083 12.5417L17.5917 13.225C18.0083 13.2917 18.3333 13.65 18.3333 14.075Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="icon-btn" title="Video">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.3333 5.83333L13.3333 10.8333V8.33333C13.3333 7.41286 12.5871 6.66667 11.6667 6.66667H3.33333C2.41286 6.66667 1.66667 7.41286 1.66667 8.33333V15C1.66667 15.9205 2.41286 16.6667 3.33333 16.6667H11.6667C12.5871 16.6667 13.3333 15.9205 13.3333 15V12.5L18.3333 17.5V5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* More Options Menu */}
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
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="more-options-dropdown">
                {/* Pinned Messages Info */}
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
                {/* Pin/Unpin Chat Option */}
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

      {/* Chat Link Badge */}
      <div className="chat-link-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.33333 10.6667L4.66667 8L7.33333 5.33333M9.33333 5.33333L11.3333 7.33333C12.0697 8.06971 12.0697 9.26362 11.3333 10L9.33333 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Chat linked to: <a href="#">{chat.linkedTo}</a>
      </div>

      {/* Pinned Messages Bar */}
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

      {/* Messages Container */}
      <div className="messages-container" ref={messagesContainerRef}>
        {/* Messages */}
        {chat.messages.map((msg) => {
          const isPinned = isMessagePinned(msg.id)
          const isDeletedForMe = isMessageDeletedForMe(msg.id)
          const isDeletedForAll = msg.isDeleted || msg.deleted
          
          // Hide message if deleted for me
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
                {/* Read Status (only for own messages) */}
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
        })}
        {/* Typing Indicator */}
        {chat.isTyping === true && (
          <div className="typing-indicator">
            <span>...{chat.name.split(' ')[0]} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scroll to Bottom Button */}
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

      {/* Message Context Menu */}
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

      {/* Delete Submenu */}
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
          {/* Only show "Delete for everyone" for own messages */}
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

      {/* Message Input Form */}
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
