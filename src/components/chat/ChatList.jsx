import { useState, useMemo, useRef, useEffect } from 'react'
import { useTimeAgo } from '../../utils/useTimeAgo'
import '../../styles/chat-page/ChatList.css'

/**
 * ConversationTime Component
 * Displays time ago format (e.g., "2m ago") with dynamic updates
 */
function ConversationTime({ timestampDate, fallbackTime }) {
  const timeAgo = useTimeAgo(timestampDate)
  return <span className="conversation-time">{timestampDate ? timeAgo : fallbackTime}</span>
}

/**
 * ChatList Component
 * Displays list of conversations with search, archive, and context menu functionality
 */
function ChatList({ 
  conversations, 
  selectedChatId, 
  onChatSelect, 
  showArchived, 
  onToggleArchived, 
  onArchiveChat, 
  onUnarchiveChat, 
  onDeleteChat,
  pinnedChats = [],
  onPinChat,
  onUnpinChat
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const contextMenuRef = useRef(null)

  /**
   * Check if a chat is pinned
   * @param {string} chatId - The ID of the chat to check
   * @returns {boolean}
   */
  const isChatPinned = (chatId) => {
    return pinnedChats.includes(String(chatId))
  }

  // ==========================================
  // Helper Functions
  // ==========================================

  /**
   * Get last message from conversation's messages array
   * Falls back to stored lastMessage if messages array is unavailable
   */
  const getLastMessage = (conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const lastMsg = conversation.messages[conversation.messages.length - 1]
      const text = lastMsg.text || ''
      return text.length > 50 ? text.substring(0, 50) + '...' : text
    }
    return conversation.lastMessage || 'No messages yet'
  }

  // ==========================================
  // Filtered Conversations
  // ==========================================

  /**
   * Filter and sort conversations
   * Pinned chats appear first, then sorted by timestamp
   */
  const filteredConversations = useMemo(() => {
    let filtered = conversations

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = conversations.filter(conversation => {
        const nameMatch = conversation.name.toLowerCase().includes(query)
        const lastMsg = getLastMessage(conversation)
        const messageMatch = lastMsg.toLowerCase().includes(query)
        return nameMatch || messageMatch
      })
    }

    // Sort: pinned chats first, then by timestamp
    return filtered.sort((a, b) => {
      const aPinned = isChatPinned(a.id)
      const bPinned = isChatPinned(b.id)

      // Pinned chats come first
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1

      // If both pinned or both not pinned, maintain order within pinned group
      if (aPinned && bPinned) {
        // Maintain pinned order (first pinned stays first)
        const aIndex = pinnedChats.indexOf(String(a.id))
        const bIndex = pinnedChats.indexOf(String(b.id))
        return aIndex - bIndex
      }

      // For non-pinned, sort by timestamp
      if (a.timestampDate && b.timestampDate) {
        return new Date(b.timestampDate) - new Date(a.timestampDate)
      }
      if (a.timestampDate && !b.timestampDate) return -1
      if (!a.timestampDate && b.timestampDate) return 1
      return 0
    })
  }, [conversations, searchQuery, pinnedChats])

  // ==========================================
  // Context Menu Handling
  // ==========================================

  /**
   * Close context menu when clicking outside or pressing Escape
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setContextMenu(null)
      }
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('contextmenu', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('contextmenu', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [contextMenu])

  /**
   * Handle right-click context menu
   * Positions menu at cursor location, ensuring it stays within viewport
   */
  const handleContextMenu = (e, conversation) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Calculate position, ensuring menu stays within viewport
    const menuWidth = 160
    const menuHeight = 100
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10)
    
    setContextMenu({
      x: Math.max(10, x),
      y: Math.max(10, y),
      conversation
    })
  }

  /**
   * Handle context menu action (archive/unarchive/delete/pin/unpin)
   */
  const handleMenuAction = (action, conversation) => {
    setContextMenu(null)
    if (action === 'archive' && onArchiveChat) {
      onArchiveChat(conversation.id)
    } else if (action === 'unarchive' && onUnarchiveChat) {
      onUnarchiveChat(conversation.id)
    } else if (action === 'delete' && onDeleteChat) {
      onDeleteChat(conversation.id)
    } else if (action === 'pin' && onPinChat) {
      onPinChat(conversation.id)
    } else if (action === 'unpin' && onUnpinChat) {
      onUnpinChat(conversation.id)
    }
  }

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="chat-list">
      {/* Header */}
      <div className="chat-list-header">
        <h2>Chat</h2>
      </div>
      
      {/* Actions: New Chat & Search */}
      <div className="chat-list-actions">
        <button className="btn-new-chat">
          <span>+</span> New Chat
        </button>
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${conversation.isActive ? 'active' : ''} ${isChatPinned(conversation.id) ? 'pinned' : ''}`}
              onClick={() => onChatSelect(conversation)}
              onContextMenu={(e) => handleContextMenu(e, conversation)}
            >
              {/* Avatar */}
              <div className="conversation-avatar">
                <img src={conversation.avatar} alt={conversation.name} />
                {conversation.status === 'Online' && (
                  <span className="online-indicator"></span>
                )}
              </div>

              {/* Content */}
              <div className="conversation-content">
                <div className="conversation-header">
                  <h3>
                    {isChatPinned(conversation.id) && (
                      <svg className="pinned-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {conversation.name}
                  </h3>
                  {conversation.status === 'Online' && (
                    <span className="status-text">Online</span>
                  )}
                  <ConversationTime 
                    timestampDate={conversation.timestampDate} 
                    fallbackTime={conversation.time} 
                  />
                </div>
                <p className="conversation-preview">{getLastMessage(conversation)}</p>
              </div>

              {/* Unread Badge */}
              {conversation.unread && conversation.unread > 0 && (
                <span className="unread-badge">{conversation.unread}</span>
              )}

              {/* Archive Button (hover, active chats only) */}
              {!showArchived && onArchiveChat && (
                <button 
                  className="archive-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchiveChat(conversation.id)
                  }}
                  title="Archive conversation"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3.33333H14M2 3.33333V13.3333C2 14 2.66667 14.6667 3.33333 14.6667H12.6667C13.3333 14.6667 14 14 14 13.3333V3.33333M2 3.33333L2.66667 2H13.3333L14 3.33333M6.66667 7.33333H9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              {/* Unarchive Button (hover, archived chats only) */}
              {showArchived && onUnarchiveChat && (
                <button 
                  className="archive-btn unarchive-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onUnarchiveChat(conversation.id)
                  }}
                  title="Unarchive conversation"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3333 2.66667L2.66667 13.3333M2.66667 2.66667L13.3333 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>{searchQuery.trim() ? 'No conversations found' : showArchived ? 'No archived conversations' : 'No active conversations'}</p>
            <span>{searchQuery.trim() ? 'Try a different search term' : showArchived ? 'Archive conversations to see them here' : 'Start a new conversation'}</span>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            zIndex: 1000
          }}
        >
          {/* Pin/Unpin Option */}
          {isChatPinned(contextMenu.conversation.id) ? (
            <button
              className="context-menu-item"
              onClick={() => handleMenuAction('unpin', contextMenu.conversation)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Unpin Chat
            </button>
          ) : (
            <button
              className="context-menu-item"
              onClick={() => handleMenuAction('pin', contextMenu.conversation)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V14M3 7H13M8 2L5 7M8 2L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Pin Chat
            </button>
          )}
          {showArchived ? (
            <button
              className="context-menu-item"
              onClick={() => handleMenuAction('unarchive', contextMenu.conversation)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3333 2.66667L2.66667 13.3333M2.66667 2.66667L13.3333 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Unarchive
            </button>
          ) : (
            <button
              className="context-menu-item"
              onClick={() => handleMenuAction('archive', contextMenu.conversation)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3.33333H14M2 3.33333V13.3333C2 14 2.66667 14.6667 3.33333 14.6667H12.6667C13.3333 14.6667 14 14 14 13.3333V3.33333M2 3.33333L2.66667 2H13.3333L14 3.33333M6.66667 7.33333H9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Archive
            </button>
          )}
          <button
            className="context-menu-item delete"
            onClick={() => handleMenuAction('delete', contextMenu.conversation)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete
          </button>
        </div>
      )}

      {/* Footer: Archive Toggle */}
      <div className="chat-list-footer">
        <button 
          className="btn-archived" 
          onClick={() => {
            if (onToggleArchived) {
              onToggleArchived()
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 3.33333H14M2 3.33333V13.3333C2 14 2.66667 14.6667 3.33333 14.6667H12.6667C13.3333 14.6667 14 14 14 13.3333V3.33333M2 3.33333L2.66667 2H13.3333L14 3.33333M6.66667 7.33333H9.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {showArchived ? 'View Active Chats' : 'View Archived Chats'}
        </button>
      </div>
    </div>
  )
}

export default ChatList

