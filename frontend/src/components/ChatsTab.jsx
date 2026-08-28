import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiPlus, FiMessageCircle, FiTrash2, FiClock, FiLoader, FiMessageSquare, FiArrowRight, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './ChatsTab.css';

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

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatsTab({ questionId, onOpenChat, onNewChat }) {
  const { memoryToken, isLoggedIn } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (memoryToken) {
      headers['Authorization'] = `Bearer ${memoryToken}`;
    }
    return headers;
  };

  useEffect(() => {
    if (isLoggedIn && questionId) {
      fetchChats();
    }
  }, [isLoggedIn, questionId]);

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
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="chats-tab">
        <div className="chats-empty-state">
          <div className="chats-empty-icon-wrapper">
            <FiMessageCircle size={40} />
            <div className="chats-empty-ring" />
          </div>
          <h3>Login Required</h3>
          <p>Please log in to view and manage your chat history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chats-tab">
      {/* Header */}
      <div className="chats-tab-header">
        <div className="chats-tab-title-row">
          <div className="chats-tab-title">
            <FiMessageCircle size={20} />
            <h2>Your Chats</h2>
            {!loading && <span className="chats-count-badge">{chats.length}</span>}
          </div>
          <button className="chats-new-btn" onClick={onNewChat}>
            <FiPlus size={15} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search */}
        {chats.length > 0 && (
          <div className="chats-search-wrapper">
            <FiSearch size={15} className="chats-search-icon" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="chats-search-input"
            />
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="chats-tab-list">
        {loading ? (
          <div className="chats-empty-state">
            <FiLoader size={28} className="spin-icon" />
            <p>Loading your chats...</p>
          </div>
        ) : filteredChats.length === 0 && chats.length === 0 ? (
          <div className="chats-empty-state">
            <div className="chats-empty-icon-wrapper">
              <FiMessageCircle size={40} />
              <div className="chats-empty-ring" />
            </div>
            <h3>No chats yet</h3>
            <p>Go to Prompt Chat and start a conversation — it'll appear here automatically.</p>
            <button className="chats-start-btn" onClick={onNewChat}>
              <FiPlus size={15} />
              Start New Chat
            </button>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="chats-empty-state">
            <FiSearch size={28} />
            <p>No chats match "{searchQuery}"</p>
          </div>
        ) : (
          filteredChats.map((chat, index) => (
            <div
              key={chat._id}
              className="chats-card"
              onClick={() => onOpenChat(chat._id)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="chats-card-icon">
                <FiMessageSquare size={18} />
              </div>
              <div className="chats-card-content">
                <div className="chats-card-title">{chat.title}</div>
                <div className="chats-card-meta">
                  <span className="chats-card-time">
                    <FiClock size={12} />
                    {formatRelativeTime(chat.updatedAt)}
                  </span>
                  <span className="chats-card-dot">·</span>
                  <span>{chat.messageCount} messages</span>
                  <span className="chats-card-dot">·</span>
                  <span className="chats-card-date">{formatDate(chat.createdAt)}</span>
                </div>
                {chat.lastMessage && (
                  <div className="chats-card-preview">{chat.lastMessage}</div>
                )}
              </div>
              <div className="chats-card-actions">
                <button
                  className={`chats-card-delete ${deletingId === chat._id ? 'deleting' : ''}`}
                  onClick={(e) => handleDeleteClick(e, chat._id)}
                  title="Delete chat"
                  disabled={deletingId === chat._id}
                >
                  <FiTrash2 size={14} />
                </button>
                <div className="chats-card-arrow">
                  <FiArrowRight size={16} />
                </div>
              </div>
            </div>
          ))
        )}
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
