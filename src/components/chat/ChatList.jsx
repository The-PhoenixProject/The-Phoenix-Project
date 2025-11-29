import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useTimeAgo } from '../../utils/useTimeAgo'
import '../../styles/chat-page/ChatList.css'

const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="18"%3E%3F%3C/text%3E%3C/svg%3E'

/**
 * ConversationTime Component
 */
function ConversationTime({ timestampDate, fallbackTime }) {
  const timeAgo = useTimeAgo(timestampDate)
  return <span className="conversation-time">{timestampDate ? timeAgo : fallbackTime}</span>
}

/**
 * ChatList Component - WITHOUT NEW CHAT BUTTON
 */
function ChatList({ 
  conversations,  
  onChatSelect, 
  showArchived, 
  onToggleArchived, 
  onArchiveChat, 
  onUnarchiveChat, 
  onDeleteChat,
  pinnedChats = [],
  onPinChat,
  onUnpinChat,
  onViewProfile, 
  onViewProducts
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [contextMenu, setContextMenu] = useState(null)
  const contextMenuRef = useRef(null)

  const isChatPinned = useCallback(
    (chatId) => pinnedChats.includes(String(chatId)),
    [pinnedChats]
  );

  const getLastMessage = (conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const lastMsg = conversation.messages[conversation.messages.length - 1]
      const text = lastMsg.text || ''
      return text.length > 50 ? text.substring(0, 50) + '...' : text
    }
    return conversation.lastMessage || 'No messages yet'
  }

  const filteredConversations = useMemo(() => {
    let filtered = conversations

    const trimmedQuery = searchQuery.trim()
    
    if (trimmedQuery) {
      const query = trimmedQuery.toLowerCase()
      filtered = conversations.filter(conversation => {
        const nameMatch = conversation.name.toLowerCase().includes(query)
        const lastMsg = getLastMessage(conversation)
        const messageMatch = lastMsg.toLowerCase().includes(query)
        return nameMatch || messageMatch
      })
    }

    return filtered.sort((a, b) => {
      const aPinned = isChatPinned(a.id)
      const bPinned = isChatPinned(b.id)

      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1

      if (aPinned && bPinned) {
        const aIndex = pinnedChats.indexOf(String(a.id))
        const bIndex = pinnedChats.indexOf(String(b.id))
        return aIndex - bIndex
      }

      if (a.timestampDate && b.timestampDate) {
        return new Date(b.timestampDate) - new Date(a.timestampDate)
      }
      if (a.timestampDate && !b.timestampDate) return -1
      if (!a.timestampDate && b.timestampDate) return 1
      return 0
    })
  }, [conversations, searchQuery, pinnedChats, isChatPinned])

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

  const handleContextMenu = (e, conversation) => {
    e.preventDefault()
    e.stopPropagation()
    
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

  return (
    <div className="chat-list">
      {/* Header */}
      <div className="chat-list-header">
        <h2>Chat</h2>
      </div>
      
      {/* Search Only */}
      <div className="chat-list-actions">
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
              <div className="conversation-avatar">
                <img src={conversation.avatar || DEFAULT_AVATAR} alt={conversation.name} onError={(e)=> (e.target.src = DEFAULT_AVATAR)} />
                {conversation.status === 'Online' && (
                  <span className="online-indicator"></span>
                )}
              </div>

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

              {conversation.unread && conversation.unread > 0 && (
                <span className="unread-badge">{conversation.unread}</span>
              )}

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

              <div className="conversation-actions-quick">
                {onViewProfile && (
                  <button
                    className="icon-btn small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewProfile(conversation)
                    }}
                    title="View profile"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" fill="currentColor"/></svg>
                  </button>
                )}
                {onViewProducts && (
                  <button
                    className="icon-btn small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewProducts(conversation)
                    }}
                    title="View products"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 7L12 2 3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
              </div>

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
            <span>{searchQuery.trim() ? 'Try a different search term' : showArchived ? 'Archive conversations to see them here' : 'Start chatting from product pages'}</span>
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

      {/* Footer */}
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