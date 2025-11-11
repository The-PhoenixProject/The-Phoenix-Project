import { useState, useEffect } from 'react'
import ChatList from './ChatList'
import Conversation from './Conversation'
import UserProfile from './UserProfile'
import '../../styles/chat-page/Chat.css'

const API_URL = 'http://localhost:3001'

/**
 * Main Chat Component
 * Manages chat conversations, message sending, archiving, and responsive layout
 */
function Chat() {
  // State Management
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [pinnedChats, setPinnedChats] = useState([])
  
  // Resizable Panel State
  const [chatListWidth, setChatListWidth] = useState(350)
  const [profileWidth, setProfileWidth] = useState(320)
  const [isResizingChatList, setIsResizingChatList] = useState(false)
  const [isResizingProfile, setIsResizingProfile] = useState(false)
  
  // Responsive Design State
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [isTablet, setIsTablet] = useState(() => typeof window !== 'undefined' ? (window.innerWidth >= 768 && window.innerWidth < 1024) : false)

  // ==========================================
  // Effects
  // ==========================================

  /**
   * Handle window resize for responsive design
   * Adjusts panel widths and updates mobile/tablet state
   */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      
      // Adjust panel widths on resize
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

  /**
   * Fetch conversations and pinned chats on component mount
   */
  useEffect(() => {
    fetchConversations()
    fetchPinnedChats()
  }, [])

  /**
   * Fetch pinned chats from database
   * Uses localStorage as primary storage since json-server doesn't support root-level resource updates
   */
  const fetchPinnedChats = async () => {
    try {
      // Check localStorage (primary and only storage)
      const localData = localStorage.getItem('pinnedChats')
      if (localData) {
        try {
          const pinnedArray = JSON.parse(localData)
          // Ensure all IDs are strings for consistency
          setPinnedChats(pinnedArray.map(id => String(id)))
          return
        } catch (parseErr) {
          console.error('Error parsing localStorage pinnedChats:', parseErr)
        }
      }
      
      // No data found - use empty array
      setPinnedChats([])
    } catch (err) {
      console.error('Error fetching pinned chats:', err)
      setPinnedChats([])
    }
  }

  /**
   * Update pinned chats in database
   * Uses localStorage as primary storage since json-server doesn't support root-level resource updates
   */
  const updatePinnedChats = async (newPinnedChats) => {
    try {
      localStorage.setItem('pinnedChats', JSON.stringify(newPinnedChats))
    } catch (err) {
      console.error('Error updating pinned chats:', err)
    }
  }

  /**
   * Poll for conversation updates to detect new messages and unread counts
   * Refreshes every 5 seconds to show new messages added to database
   * Preserves selected chat and doesn't reset unread counts
   */
  useEffect(() => {
    const interval = setInterval(async () => {
      // Only refresh if not currently loading and we have conversations
      if (!loading && conversations.length > 0) {
        try {
          const response = await fetch(`${API_URL}/conversations`)
          if (!response.ok) return
          
          const data = await response.json()
          const nonDeletedData = data.filter(conv => !conv.deleted)
          
          // Sort by most recent message timestamp
          const sortedData = nonDeletedData.sort((a, b) => {
            if (a.timestampDate && b.timestampDate) {
              return new Date(b.timestampDate) - new Date(a.timestampDate)
            }
            if (a.timestampDate && !b.timestampDate) return -1
            if (!a.timestampDate && b.timestampDate) return 1
            if (a.isActive && !b.isActive) return -1
            if (!a.isActive && b.isActive) return 1
            return 0
          })
          
          const conversationsWithMessages = sortedData.map(conv => ({
            ...conv,
            messages: conv.messages || [],
            pinnedMessages: conv.pinnedMessages || [],
            deletedForMeMessages: conv.deletedForMeMessages || []
          }))
          
          // Preserve selected chat if it still exists
          setConversations(prev => {
            const selectedId = selectedChat?.id
            const updated = conversationsWithMessages.map(newConv => {
              const existing = prev.find(c => String(c.id) === String(newConv.id))
              // Preserve isActive state for selected chat
              if (selectedId && String(newConv.id) === String(selectedId)) {
                return {
                  ...newConv,
                  isActive: true
                }
              }
              // Preserve isActive state from existing if not selected
              return {
                ...newConv,
                isActive: existing?.isActive || false
              }
            })
            return updated
          })
          
            // Update selected chat if it exists
            if (selectedChat) {
              const updatedSelected = conversationsWithMessages.find(
                c => String(c.id) === String(selectedChat.id)
              )
              if (updatedSelected) {
                setSelectedChat({
                  ...updatedSelected,
                  isActive: true,
                  pinnedMessages: updatedSelected.pinnedMessages || selectedChat.pinnedMessages || [],
                  deletedForMeMessages: updatedSelected.deletedForMeMessages || selectedChat.deletedForMeMessages || []
                })
              }
            }
            
            // Also refresh pinned chats
            fetchPinnedChats()
        } catch (err) {
          // Silently fail polling - don't spam console
        }
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [loading, conversations.length, selectedChat])

  /**
   * Handle panel resizing (desktop only)
   * Allows users to drag resize handles to adjust panel widths
   */
  useEffect(() => {
    if (isMobile) {
      // Disable resize on mobile
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

  /**
   * Fetch all conversations from the server
   * Filters deleted conversations and sorts by most recent
   */
  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/conversations`)
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const data = await response.json()
      
      // Filter out deleted conversations
      const nonDeletedData = data.filter(conv => !conv.deleted)
      
      // Sort by most recent message timestamp
      const sortedData = nonDeletedData.sort((a, b) => {
        if (a.timestampDate && b.timestampDate) {
          return new Date(b.timestampDate) - new Date(a.timestampDate)
        }
        if (a.timestampDate && !b.timestampDate) return -1
        if (!a.timestampDate && b.timestampDate) return 1
        if (a.isActive && !b.isActive) return -1
        if (!a.isActive && b.isActive) return 1
        return 0
      })
      
      // Ensure each conversation has messages array, pinnedMessages, and deletedForMeMessages
      // Reset all isActive flags to false on refresh - no chat should be selected
      // Also ensure deleted flag is false (deleted conversations are already filtered out)
      const conversationsWithMessages = sortedData.map(conv => ({
        ...conv,
        messages: conv.messages || [],
        pinnedMessages: conv.pinnedMessages || [],
        deletedForMeMessages: conv.deletedForMeMessages || [],
        isActive: false, // Reset isActive on refresh
        deleted: false // Ensure deleted is false (deleted conversations are filtered out)
      }))
      
      setConversations(conversationsWithMessages)
      
      // Explicitly ensure no chat is selected on refresh
      setSelectedChat(null)
      
      // Don't auto-select a chat - show "no selected chats" panel instead
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      console.error('Error fetching conversations:', err)
    }
  }

  // ==========================================
  // Chat Selection & Management
  // ==========================================

  /**
   * Handle chat selection
   * Fetches full chat details, marks all messages as read, and resets unread count
   */
  const handleChatSelect = async (chat) => {
    try {
      const response = await fetch(`${API_URL}/conversations/${chat.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch chat details')
      }
      const fullChatData = await response.json()
      
        // Mark all incoming messages (not from "You") as read
        const updatedMessages = fullChatData.messages.map(msg => {
          if (!msg.isOwn) {
            return {
              ...msg,
              read: true
            }
          }
          return msg
        })

        // Reset unread count (only if not archived)
        const chatWithUnreadReset = {
          ...fullChatData,
          messages: updatedMessages,
          pinnedMessages: fullChatData.pinnedMessages || [],
          deletedForMeMessages: fullChatData.deletedForMeMessages || [],
          unread: fullChatData.archived ? fullChatData.unread : 0
        }
        setSelectedChat(chatWithUnreadReset)
      
      // Update conversation list: mark as active and reset unread
      const chatId = String(chat.id)
      setConversations(prev => {
        return prev.map(conv => {
          if (String(conv.id) === chatId) {
            return {
              ...conv,
              isActive: true,
              unread: 0,
              messages: updatedMessages,
              pinnedMessages: fullChatData.pinnedMessages || [],
              deletedForMeMessages: fullChatData.deletedForMeMessages || []
            }
          }
          return {
            ...conv,
            isActive: false
          }
        })
      })
      
      // Update messages and unread count on server (only if not archived)
      if (!chat.archived) {
        try {
          await fetch(`${API_URL}/conversations/${chat.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: updatedMessages,
              unread: 0
            })
          })
        } catch (err) {
          console.error('Error updating messages and unread count:', err)
        }
      }
    } catch (err) {
      console.error('Error fetching chat details:', err)
      // Fallback to basic chat data
      setSelectedChat(chat)
      
      setConversations(prev => {
        const chatId = String(chat.id)
        return prev.map(conv => {
          if (String(conv.id) === chatId) {
            return {
              ...conv,
              isActive: true,
              unread: 0
            }
          }
          return {
            ...conv,
            isActive: false
          }
        })
      })
    }
  }

  /**
   * Archive a conversation
   * Marks conversation as archived and selects another if needed
   */
  const handleArchiveChat = async (chatId) => {
    try {
      await fetch(`${API_URL}/conversations/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archived: true
        })
      })
      
      setConversations(prev => prev.map(conv => 
        String(conv.id) === String(chatId) 
          ? { ...conv, archived: true }
          : conv
      ))
      
      // If archived chat was selected, select a different one
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

  /**
   * Unarchive a conversation
   * Marks conversation as active and switches to active view
   */
  const handleUnarchiveChat = async (chatId) => {
    try {
      await fetch(`${API_URL}/conversations/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archived: false
        })
      })
      
      setConversations(prev => prev.map(conv => 
        String(conv.id) === String(chatId) 
          ? { ...conv, archived: false }
          : conv
      ))
      
      // Switch to active view and select the unarchived chat
      setShowArchived(false)
      const unarchivedChat = conversations.find(conv => String(conv.id) === String(chatId))
      if (unarchivedChat) {
        handleChatSelect({ ...unarchivedChat, archived: false })
      }
    } catch (err) {
      console.error('Error unarchiving chat:', err)
    }
  }

  // ==========================================
  // Delete Functionality
  // ==========================================

  /**
   * Show delete confirmation modal
   */
  const handleDeleteChat = async (chatId) => {
    const chatToDelete = conversations.find(conv => String(conv.id) === String(chatId))
    if (!chatToDelete) return

    setDeleteConfirm({
      chatId,
      chatName: chatToDelete.name
    })
  }

  /**
   * Confirm and execute delete (soft delete - marks as deleted)
   */
  const confirmDelete = async () => {
    if (!deleteConfirm) return

    const { chatId } = deleteConfirm

    try {
      // Mark as deleted (hidden) instead of actually deleting
      await fetch(`${API_URL}/conversations/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deleted: true
        })
      })
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        String(conv.id) === String(chatId) 
          ? { ...conv, deleted: true }
          : conv
      ))
      
      // If deleted chat was selected, select a different one
      if (selectedChat && String(selectedChat.id) === String(chatId)) {
        const nextChat = conversations.find(conv => 
          String(conv.id) !== String(chatId) && !conv.deleted
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

  /**
   * Cancel delete confirmation
   */
  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  // ==========================================
  // Message Handling
  // ==========================================

  /**
   * Send a new message
   * Optimistically updates UI, then syncs with server
   */
  const handleSendMessage = async (messageText) => {
    if (!selectedChat || !messageText.trim()) return

    const now = new Date()
    const newMessage = {
      id: Date.now(),
      sender: 'You',
      text: messageText,
      timestamp: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      isOwn: true,
      read: false,
      timestampDate: now.toISOString()
    }

    // Optimistically update the UI
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage]
    }
    setSelectedChat(updatedChat)

    // Update conversations list: move to top and update messages
    setConversations(prev => {
      const selectedId = String(selectedChat.id)
      
      const updated = prev.map(conv => {
        if (String(conv.id) === selectedId) {
          return {
            ...conv,
            messages: updatedChat.messages,
            timestampDate: now.toISOString(),
            isActive: true
          }
        }
        return { ...conv, isActive: false }
      })
      
      // Separate updated conversation and sort others
      const updatedConv = updated.find(conv => String(conv.id) === selectedId)
      const otherConvs = updated.filter(conv => String(conv.id) !== selectedId)
      
      if (!updatedConv) {
        return prev
      }
      
      // Sort other conversations by timestamp (most recent first)
      const sortedOthers = [...otherConvs].sort((a, b) => {
        const timeA = a.timestampDate ? new Date(a.timestampDate).getTime() : 0
        const timeB = b.timestampDate ? new Date(b.timestampDate).getTime() : 0
        return timeB - timeA
      })
      
      // Place updated conversation at the top
      return [updatedConv, ...sortedOthers]
    })

    // Sync with server
    try {
      await fetch(`${API_URL}/conversations/${selectedChat.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedChat.messages,
          timestampDate: now.toISOString()
        })
      })
    } catch (err) {
      console.error('Error sending message:', err)
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
            Make sure the JSON server is running: <code>npm run server</code>
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
      {/* Chat List Panel */}
      <div 
        className={`resizable-panel chat-list-wrapper ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
        style={{ 
          width: isMobile ? '100%' : `${chatListWidth}px`,
          display: isMobile && selectedChat ? 'none' : 'block'
        }}
      >
        <ChatList 
          conversations={showArchived
            ? conversations.filter(conv => conv.archived === true && !conv.deleted)
            : conversations.filter(conv => conv.archived !== true && !conv.deleted)
          }
          selectedChatId={selectedChat?.id}
          onChatSelect={handleChatSelect}
          showArchived={showArchived}
          onToggleArchived={() => {
            setShowArchived(!showArchived)
            // Clear selected chat when switching views if it doesn't match
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

      {/* Main Content Area */}
      {selectedChat ? (
        <>
          {isTablet && isProfileOpen ? (
            // Tablet: Show profile instead of conversation
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
                onClose={() => setIsProfileOpen(false)}
              />
            </div>
          ) : (
            // Desktop: Show conversation, profile can be side-by-side
            // Tablet: Show conversation when profile is closed
            <>
              <Conversation 
                chat={selectedChat} 
                onSendMessage={handleSendMessage}
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
                  // Also update in conversations list
                  setConversations(prev => prev.map(conv => 
                    String(conv.id) === String(updatedChat.id) 
                      ? { ...conv, messages: updatedChat.messages, deletedForMeMessages: updatedChat.deletedForMeMessages || [] }
                      : conv
                  ))
                }}
              />
              {!isTablet && isProfileOpen && (
                // Desktop: Show profile alongside conversation
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
                    onClose={() => setIsProfileOpen(false)}
                  />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        // Empty State
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

      {/* Delete Confirmation Modal */}
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

