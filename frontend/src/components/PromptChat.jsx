import { useState, useRef, useEffect, useCallback } from 'react';
import { FiUser, FiCpu, FiSend, FiMessageSquare, FiCode, FiFile, FiChevronDown, FiChevronRight, FiCopy, FiCheck, FiSearch, FiLayout, FiZap, FiFolder, FiCheckCircle, FiAlertTriangle, FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiMenu } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import ScaledPreview from './ScaledPreview';
import './PromptChat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
};

const PHASE_CONFIG = {
  analyzing: {
    icon: <FiSearch size={14} />,
    label: 'Analyzing',
    color: '#8b5cf6',
    messages: ['Understanding your request...', 'Analyzing requirements...', 'Breaking down the task...'],
  },
  planning: {
    icon: <FiLayout size={14} />,
    label: 'Planning',
    color: '#3b82f6',
    messages: ['Planning component structure...', 'Designing the architecture...', 'Organizing the layout...'],
  },
  generating: {
    icon: <FiZap size={14} />,
    label: 'Generating',
    color: '#f59e0b',
    messages: ['Writing code...', 'Generating components...', 'Building your project...'],
  },
  creating_files: {
    icon: <FiFolder size={14} />,
    label: 'Creating Files',
    color: '#10b981',
    messages: ['Packaging files...', 'Creating file structure...', 'Finalizing output...'],
  },
  complete: {
    icon: <FiCheckCircle size={14} />,
    label: 'Complete',
    color: '#10b981',
    messages: ['Done!'],
  },
  error: {
    icon: <FiAlertTriangle size={14} />,
    label: 'Error',
    color: '#ef4444',
    messages: ['Something went wrong'],
  },
};

function FileCard({ fileName, code, onOpen }) {
  const lineCount = code.split('\n').length;
  
  const ext = fileName.split('.').pop();
  let Icon = FiFile;
  let color = '#64748b';
  
  if (ext === 'html') { Icon = FiCode; color = '#e44d26'; }
  if (ext === 'css') { Icon = FiCode; color = '#264de4'; }
  if (ext === 'js') { Icon = FiCode; color = '#f7df1e'; }
  
  return (
    <div className="chat-file-card" onClick={onOpen}>
      <div className="chat-file-icon" style={{ color }}>
        <Icon size={18} />
      </div>
      <div className="chat-file-info">
        <span className="chat-file-name">{fileName}</span>
        <span className="chat-file-meta">{lineCount} lines</span>
      </div>
      <div className="chat-file-action">
        <FiChevronRight size={16} />
      </div>
    </div>
  );
}

function PhaseIndicator({ phase, isActive }) {
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.analyzing;

  return (
    <div className={`phase-indicator ${isActive ? 'active' : 'done'}`}>
      <div className="phase-icon-wrapper" style={{ '--phase-color': config.color }}>
        <span className="phase-icon">{config.icon}</span>
        {isActive && <div className="phase-ring" />}
      </div>
      <div className="phase-info">
        <span className="phase-label" style={{ color: isActive ? config.color : 'var(--text-muted)' }}>
          {config.label}
        </span>
        {isActive && (
          <span className="phase-message">
            {config.messages[0]}
            <span className="phase-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

function StreamingText({ text }) {
  return (
    <div className="streaming-text">
      {text}
      <span className="typing-cursor" />
    </div>
  );
}

export default function PromptChat({ questionId, currentTurn, maxTurns, onAgentResponse, onLoadConversation, questionContext, onOpenPreview, onOpenFile, onOpenFullPreview }) {
  const { user, memoryToken } = useAuth();
  
  // Chat History State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Chat State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [conversationHistory, setConversationHistory] = useState('');
  
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const activeConversationRef = useRef(null);
  const hasInitialized = useRef(false);

  // Sync ref with state
  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  // 1. Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!questionId) return;
      try {
        setIsLoadingHistory(true);
        const headers = {};
        if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;
        
        const res = await fetch(`${API_URL}/api/chat/conversations/${questionId}`, {
          headers,
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          
          if (!hasInitialized.current) {
            hasInitialized.current = true;
            if (data.length > 0 && !activeConversationId) {
              handleSelectConversation(data[0]._id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchConversations();
  }, [questionId, memoryToken]);

  // 2. Select Conversation
  const handleSelectConversation = async (convId) => {
    try {
      setActiveConversationId(convId);
      setMessages([]);
      setConversationHistory('');
      
      const headers = {};
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const res = await fetch(`${API_URL}/api/chat/conversations/${convId}/messages`, {
        headers,
        credentials: 'include'
      });
      const data = await res.json();
      
      const loadedMessages = data.messages.map(m => ({
        id: m._id,
        role: m.role,
        content: m.content,
        files: m.files,
        previewHtml: m.previewHtml,
        isError: m.isError
      }));
      setMessages(loadedMessages);
      
      let hist = '';
      loadedMessages.forEach(m => {
        if (m.role === 'user') hist += `User: ${m.content}\n`;
        else hist += `Agent: ${m.content}\n\n`;
      });
      setConversationHistory(hist);
      
      const agentMessages = loadedMessages.filter(m => m.role === 'agent' && m.files);
      const lastAgentMsg = agentMessages[agentMessages.length - 1];
      const turnCount = loadedMessages.filter(m => m.role === 'user').length;
      
      if (onLoadConversation) {
        onLoadConversation(
          turnCount, 
          lastAgentMsg ? lastAgentMsg.files : null, 
          lastAgentMsg ? lastAgentMsg.previewHtml : null
        );
      }
    } catch (err) {
      console.error('Failed to load conversation', err);
    }
  };

  // 3. New Chat
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setConversationHistory('');
    if (onLoadConversation) {
      onLoadConversation(0, null, null);
    }
  };

  // 4. Rename / Delete
  const submitRename = async (id) => {
    try {
      if (!renameValue.trim()) {
        setRenamingId(null);
        return;
      }
      const headers = { 'Content-Type': 'application/json' };
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const res = await fetch(`${API_URL}/api/chat/conversations/${id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ title: renameValue })
      });
      if (res.ok) {
        setConversations(prev => prev.map(c => c._id === id ? { ...c, title: renameValue } : c));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRenamingId(null);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      const headers = {};
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const res = await fetch(`${API_URL}/api/chat/conversations/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c._id !== id));
        if (activeConversationId === id) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, currentPhase, streamingText]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  useEffect(() => {
    if (input === '') adjustTextareaHeight();
  }, [input]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || currentTurn >= maxTurns || isStreaming) return;

    const submittedPrompt = input.trim();
    const userMsg = { role: 'user', content: submittedPrompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setCurrentPhase(null);
    setCompletedPhases([]);
    setStreamingText('');

    abortControllerRef.current = new AbortController();

    try {
      let currentConvId = activeConversationId;
      const initialConvId = currentConvId;
      
      const headers = { 'Content-Type': 'application/json' };
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      // Save User Message immediately if it's an existing chat
      if (currentConvId) {
        await fetch(`${API_URL}/api/chat/conversations/${currentConvId}/messages`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({ role: 'user', content: submittedPrompt })
        });
      }

      const contextStr = questionContext
        ? `Question context: ${questionContext}\n\n${conversationHistory}`
        : conversationHistory;

      const response = await fetch(`${API_URL}/api/agent/generate`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          prompt: submittedPrompt,
          context: contextStr || undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullStreamedText = '';
      let finalData = null;

      while (true) {
        if (initialConvId !== activeConversationRef.current) {
          abortControllerRef.current.abort();
          return;
        }
        
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) continue;
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);

              if (data.phase) {
                if (data.phase === 'complete') {
                  finalData = data;
                  if (currentPhase) setCompletedPhases((prev) => [...prev, currentPhase]);
                  setCurrentPhase('complete');
                } else if (data.phase === 'error') {
                  setCurrentPhase('error');
                  const errorMsg = `Error: ${data.message}`;
                  setMessages((prev) => [...prev, { role: 'agent', content: errorMsg, isError: true }]);
                  
                  if (currentConvId) {
                    await fetch(`${API_URL}/api/chat/conversations/${currentConvId}/messages`, {
                      method: 'POST',
                      headers,
                      credentials: 'include',
                      body: JSON.stringify({ role: 'agent', content: errorMsg, isError: true })
                    });
                  }
                  setIsStreaming(false);
                  return;
                } else {
                  setCompletedPhases((prev) => {
                    const newPhases = [...prev];
                    if (currentPhase && !newPhases.includes(currentPhase)) newPhases.push(currentPhase);
                    return newPhases;
                  });
                  setCurrentPhase(data.phase);
                }
              }

              if (data.token) {
                fullStreamedText += data.token;
                setStreamingText(fullStreamedText);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Process final response
      if (initialConvId !== activeConversationRef.current) return;

      if (finalData) {
        // If this was a new chat, create the conversation and save user message NOW
        if (!currentConvId) {
          let newTitle = submittedPrompt.split('\n')[0].substring(0, 40);
          if (newTitle.length === 40) newTitle += '...';
          
          const convRes = await fetch(`${API_URL}/api/chat/conversations`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ questionId, title: newTitle })
          });
          const convData = await convRes.json();
          currentConvId = convData._id;
          setActiveConversationId(currentConvId);
          
          await fetch(`${API_URL}/api/chat/conversations/${currentConvId}/messages`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ role: 'user', content: submittedPrompt })
          });
        }

        const agentContent = finalData.explanation || 'Here is what I built for you:';
        const agentMessage = {
          role: 'agent',
          content: agentContent,
          files: finalData.files || null,
          previewHtml: finalData.previewHtml || null,
        };
        setMessages((prev) => [...prev, agentMessage]);

        await fetch(`${API_URL}/api/chat/conversations/${currentConvId}/messages`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(agentMessage)
        });

        setConversationHistory((prev) => `${prev}\nUser: ${submittedPrompt}\nAgent: ${agentContent}\n`);

        if (onAgentResponse) {
          onAgentResponse(submittedPrompt, {
            files: finalData.files,
            previewHtml: finalData.previewHtml,
            explanation: finalData.explanation,
          });
        }
      } else {
        const fallbackContent = fullStreamedText || 'Agent completed without structured output.';
        setMessages((prev) => [...prev, { role: 'agent', content: fallbackContent }]);
        
        if (currentConvId) {
          await fetch(`${API_URL}/api/chat/conversations/${currentConvId}/messages`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ role: 'agent', content: fallbackContent })
          });
        }

        if (onAgentResponse) {
          onAgentResponse(submittedPrompt, { files: null, previewHtml: null, explanation: fullStreamedText });
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Streaming error:', error);
      const errorMsg = `Error: ${error.message}`;
      setMessages((prev) => [...prev, { role: 'agent', content: errorMsg, isError: true }]);
      
      if (activeConversationId) {
        await fetch(`${API_URL}/api/chat/conversations/${activeConversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(memoryToken ? {'Authorization': `Bearer ${memoryToken}`} : {}) },
          credentials: 'include',
          body: JSON.stringify({ role: 'agent', content: errorMsg, isError: true })
        });
      }
    } finally {
      setIsStreaming(false);
      setCurrentPhase(null);
      setCompletedPhases([]);
      setStreamingText('');
      abortControllerRef.current = null;
      
      // Always refresh conversations to update sidebar order and timestamps
      try {
        const headers = {};
        if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;
        const res = await fetch(`${API_URL}/api/chat/conversations/${questionId}`, { headers, credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error('Failed to refresh conversations:', err);
      }
    }
  }, [input, currentTurn, maxTurns, isStreaming, conversationHistory, questionContext, onAgentResponse, activeConversationId, memoryToken, questionId, conversations]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const allPhases = ['analyzing', 'planning', 'generating', 'creating_files'];

  const activeConv = conversations.find(c => c._id === activeConversationId);

  const sortedByCreate = [...conversations].sort((a, b) => a._id.localeCompare(b._id));


  return (
    <div className="prompt-chat-layout">
      {/* Sidebar */}
      <div className={`chat-history-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
        <div className="chat-sidebar-header" style={{ padding: '16px', justifyContent: 'space-between' }}>
          {isSidebarOpen && <h3>Chat History</h3>}
        </div>
        <button className="new-chat-btn" onClick={handleNewChat} style={{ margin: isSidebarOpen ? '16px' : '16px 8px', width: isSidebarOpen ? 'calc(100% - 32px)' : 'calc(100% - 16px)', padding: '10px 0' }} title="New Chat">
          <FiPlus size={16} /> {isSidebarOpen && "New Chat"}
        </button>
        <div className="chat-history-list" style={{ padding: isSidebarOpen ? '0 12px 16px 12px' : '0 4px 16px 4px' }}>
          {isLoadingHistory ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>{isSidebarOpen && "Loading..."}</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              {isSidebarOpen && "Your conversations will appear here"}
            </div>
          ) : (
            <div className="chat-history-group">
              {conversations.map(conv => (
                <div 
                  key={conv._id} 
                  className={`chat-history-item ${activeConversationId === conv._id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv._id)}
                  title={!isSidebarOpen ? conv.title : undefined}
                  style={{ padding: isSidebarOpen ? '10px 12px' : '10px', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
                >
                  <FiMessageSquare size={14} className="chat-history-icon" style={{ marginRight: isSidebarOpen ? '10px' : '0' }} />
                  
                  {isSidebarOpen && (
                    renamingId === conv._id ? (
                      <input 
                        type="text" 
                        value={renameValue} 
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => submitRename(conv._id)}
                        onKeyDown={(e) => e.key === 'Enter' && submitRename(conv._id)}
                        autoFocus
                        onClick={e => e.stopPropagation()}
                        style={{ flex: 1, border: '1px solid var(--primary)', borderRadius: '4px', padding: '2px 4px', fontSize: '13px', outline: 'none' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
                        <span className="chat-history-title">{conv.title || 'New Chat'}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8', flexShrink: 0, marginLeft: '8px' }}>
                          {timeAgo(conv.updatedAt)}
                        </span>
                      </div>
                    )
                  )}

                  {isSidebarOpen && (
                    <div className="chat-history-actions">
                      <button className="chat-action-btn" onClick={(e) => { e.stopPropagation(); setRenameValue(conv.title); setRenamingId(conv._id); }} title="Rename">
                        <FiEdit2 size={12} />
                      </button>
                      <button className="chat-action-btn" onClick={(e) => handleDelete(e, conv._id)} title="Delete">
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="prompt-chat" id="prompt-chat">
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="chat-action-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "Collapse sidebar" : "Open chat history"}
              style={{ padding: '4px', display: 'flex', color: '#0f172a' }}
            >
              <FiMenu size={18} />
            </button>
            <span className="chat-title">
              <FiMessageSquare size={16} /> 
              {activeConv ? (activeConv.title || 'New Chat') : 'New Chat'}
            </span>
          </div>
          <span className="turn-counter">
            Prompt {Math.min(currentTurn + 1, maxTurns)} of {maxTurns}
          </span>
        </div>
        <div className="chat-messages">
          {messages.length === 0 && !isStreaming && (
            <div className="chat-empty">
              <div className="empty-icon-wrapper">
                <FiCpu className="empty-icon" size={40} />
                <div className="empty-icon-ring" />
              </div>
              <p className="empty-title">Write a prompt to instruct the AI agent.</p>
              <p className="empty-hint">Describe what you want the agent to build, fix, or improve. The AI will generate real, working code.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
              <div className="bubble-avatar">
                {msg.role === 'user' ? <FiUser size={16} /> : <FiCpu size={16} />}
              </div>
              <div className="bubble-content">
                <span className="bubble-role">{msg.role === 'user' ? 'You' : 'AI Agent'}</span>
                <div className="bubble-text markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                
                {msg.previewHtml && (
                  <div className="generation-result-card">
                    <div className="result-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCheckCircle size={16} className="success-icon" />
                        <span style={{ fontWeight: 700 }}>Agent successfully generated output</span>
                      </div>
                    </div>
                    <div className="result-card-thumbnail-large">
                      <div className="thumbnail-browser-bar">
                        <div className="thumbnail-dots">
                          <span style={{background:'#ef4444'}}></span>
                          <span style={{background:'#f59e0b'}}></span>
                          <span style={{background:'#10b981'}}></span>
                        </div>
                        <div className="thumbnail-url">localhost:3000</div>
                      </div>
                      <div className="thumbnail-iframe-wrapper">
                        <ScaledPreview html={msg.previewHtml} device="desktop" title="Preview Thumbnail" />
                      </div>
                    </div>
                    <div className="result-card-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button className="btn-primary open-preview-btn-large" onClick={onOpenPreview}>
                        Open Split Preview
                      </button>
                      <button className="btn-outline open-preview-btn-large" style={{ color: '#0f172a', borderColor: '#cbd5e1' }} onClick={() => onOpenFullPreview(msg.previewHtml, 'desktop')}>
                        Open Full Preview
                      </button>
                    </div>
                  </div>
                )}

                {msg.files && Object.keys(msg.files).length > 0 && (
                  <div className="bubble-files-container">
                    <div className="files-created-label">
                      <FiCode size={14} />
                      <span>{Object.keys(msg.files).length} files generated</span>
                    </div>
                    <div className="chat-files-list">
                      {Object.entries(msg.files).map(([fileName, code]) => (
                        <FileCard key={fileName} code={code} fileName={fileName} onOpen={onOpenFile} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Streaming Phase Indicator */}
          {isStreaming && (
            <div className="chat-bubble agent streaming-bubble">
              <div className="bubble-avatar streaming-avatar">
                <FiCpu size={16} className="spin-icon" />
                <div className="avatar-pulse" />
              </div>
              <div className="bubble-content agent-streaming-content">
                <span className="bubble-role">AI Agent Working</span>

                {/* Phase Progress */}
                <div className="phase-progress">
                  {allPhases.map((phase) => {
                    const isDone = completedPhases.includes(phase);
                    const isActive = currentPhase === phase;
                    if (!isDone && !isActive) return null;
                    return <PhaseIndicator key={phase} phase={phase} isActive={isActive} />;
                  })}
                  {currentPhase === 'complete' && (
                    <PhaseIndicator phase="complete" isActive={true} />
                  )}
                </div>

                {/* Live Streaming Text */}
                {currentPhase === 'generating' && streamingText && (
                  <div className="streaming-output">
                    <div className="streaming-output-header">
                      <FiCode size={13} />
                      <span>Generating output</span>
                      <div className="streaming-progress-bar">
                        <div className="streaming-progress-fill" />
                      </div>
                    </div>
                    <div className="streaming-text-container">
                      <StreamingText text={streamingText.slice(-500)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        {/* Improved Chat Input Area */}
        <div className="chat-input-area" style={{ padding: '20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', width: '100%' }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', transition: 'border-color 0.2s, box-shadow 0.2s', flex: 1 }}
               onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-soft)'; }}
               onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)'; }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={currentTurn >= maxTurns ? 'Max prompt turns reached' : 'Describe what the agent should build or fix...'}
              disabled={currentTurn >= maxTurns || isStreaming}
              className="chat-textarea auto-resize"
              id="prompt-input"
              rows={1}
              style={{ flex: 1, border: 'none', resize: 'none', padding: '0', fontSize: '15px', lineHeight: '1.5', color: '#0f172a', background: 'transparent', outline: 'none', minHeight: '24px', maxHeight: '150px' }}
            />
            <div style={{ display: 'flex', marginLeft: '12px', flexShrink: 0 }}>
              <button
                onClick={handleSend}
                disabled={!input.trim() || currentTurn >= maxTurns || isStreaming}
                className="btn-primary send-btn"
                id="send-prompt-btn"
                style={{ borderRadius: '8px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '14px', height: '36px', opacity: isStreaming ? 0.7 : 1 }}
              >
                {isStreaming ? (
                  <><FiCpu className="spin-icon" size={16} /> <span className="send-text">Working...</span></>
                ) : (
                  <><FiSend size={16} /> <span className="send-text">Send</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
