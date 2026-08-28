import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiMessageCircle, FiTrash2, FiClock, FiChevronLeft, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './ChatSidebar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatRelativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatSidebar({ questionId, activeChatId, onSelectChat, onNewChat, isOpen, onClose }) {
  const { memoryToken } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (memoryToken) {
      headers['Authorization'] = `Bearer ${memoryToken}`;
    }
    return headers;
  };

  // Fetch chats when sidebar opens
  useEffect(() => {
    if (isOpen && questionId) {
      fetchChats();
    }
  }, [isOpen, questionId]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/chats?questionId=${questionId}`, {
        credentials: 'include',
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation();
    setConfirmDeleteId(chatId);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const confirmDelete = async (e, chatId) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
    setDeletingId(chatId);
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getHeaders(),
      });
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        if (activeChatId === chatId) {
          onNewChat(); // Reset to new chat if active one was deleted
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleNewChat = () => {
    onNewChat();
  };

  return (
    <div className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-inner">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-title">
            <FiMessageCircle size={16} />
            <span>Chat History</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} title="Close sidebar">
            <FiChevronLeft size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <button className="new-chat-btn" onClick={handleNewChat}>
          <FiPlus size={16} />
          <span>New Chat</span>
        </button>

        {/* Chat List */}
        <div className="sidebar-chat-list">
          {loading ? (
            <div className="sidebar-loading">
              <FiLoader size={20} className="spin-icon" />
              <span>Loading chats...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="sidebar-empty">
              <FiMessageCircle size={24} />
              <span>No chats yet</span>
              <p>Start a conversation to see it here</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat._id} className="sidebar-chat-item-wrapper">
                <div
                  className={`sidebar-chat-item ${activeChatId === chat._id ? 'active' : ''}`}
                  onClick={() => onSelectChat(chat._id)}
                >
                <div className="chat-item-content">
                  <div className="chat-item-title">{chat.title}</div>
                  <div className="chat-item-meta">
                    <FiClock size={11} />
                    <span>{formatRelativeTime(chat.updatedAt)}</span>
                    <span className="chat-item-dot">·</span>
                    <span>{chat.messageCount} msgs</span>
                  </div>
                  {chat.lastMessage && (
                    <div className="chat-item-preview">{chat.lastMessage}</div>
                  )}
                </div>
                  <button
                    className={`chat-item-delete ${deletingId === chat._id ? 'deleting' : ''}`}
                    onClick={(e) => handleDeleteClick(e, chat._id)}
                    title="Delete chat"
                    disabled={deletingId === chat._id}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {confirmDeleteId && createPortal(
        <div className="global-modal-overlay" onClick={cancelDelete}>
          <div className="global-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Chat</h3>
            <p>Are you sure you want to delete this chat? This action cannot be undone.</p>
            <div className="global-modal-actions">
              <button className="btn-outline" onClick={cancelDelete}>Cancel</button>
              <button className="btn-primary" style={{ background: '#ef4444' }} onClick={(e) => confirmDelete(e, confirmDeleteId)}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
