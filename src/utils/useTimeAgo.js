import { useState, useEffect } from 'react'

/**
 * Format timestamp to "time ago" string
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time string (e.g., "2m ago", "just now")
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return ''
  
  const now = new Date()
  const messageTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now - messageTime) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return messageTime.toLocaleDateString()
}

/**
 * Custom hook for dynamic time ago display
 * Updates automatically every 30 seconds
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Current formatted time string
 */
export const useTimeAgo = (timestamp) => {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(timestamp))

  useEffect(() => {
    if (!timestamp) return

    // Update immediately
    setTimeAgo(formatTimeAgo(timestamp))

    // Update every 30 seconds for dynamic display
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(timestamp))
    }, 30000)

    return () => clearInterval(interval)
  }, [timestamp])

  return timeAgo
}
