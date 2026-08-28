import { useState, useRef, useEffect, useCallback } from 'react';
import { FiUser, FiCpu, FiSend, FiMessageSquare, FiCode, FiFile, FiChevronDown, FiChevronRight, FiCopy, FiCheck, FiSearch, FiLayout, FiZap, FiFolder, FiCheckCircle, FiAlertTriangle, FiClock, FiExternalLink } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from './ChatSidebar';
import './PromptChat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  
  // Basic icon mapping
  const ext = fileName.split('.').pop();
  let Icon = FiFile;
  let color = '#64748b';
  
  if (ext === 'html') { Icon = FiCode; color = '#e44d26'; }
  if (ext === 'css') { Icon = FiCode; color = '#264de4'; } // FiHash equivalent
  if (ext === 'js') { Icon = FiCode; color = '#f7df1e'; } // FiTerminal equivalent
  
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

export default function PromptChat({ currentTurn, maxTurns, onAgentResponse, questionContext, onOpenPreview, onOpenFile, questionId, onChatLoaded, onGoToChats, pendingChatId, onPendingChatConsumed }) {
  const { user, memoryToken, isLoggedIn } = useAuth();
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

  // Chat history state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);

  const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (memoryToken) {
      headers['Authorization'] = `Bearer ${memoryToken}`;
    }
    return headers;
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

  // Auto-load a chat when navigating from ChatsTab
  useEffect(() => {
    if (pendingChatId && pendingChatId !== activeChatId) {
      loadChat(pendingChatId);
      if (onPendingChatConsumed) onPendingChatConsumed();
    }
  }, [pendingChatId]);

  // --- Chat Persistence Helpers ---

  const createChat = async () => {
    if (!isLoggedIn || !questionId) return null;
    try {
      const res = await fetch(`${API_URL}/api/chats`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ questionId }),
      });
      if (res.ok) {
        const chat = await res.json();
        return chat._id;
      }
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
    return null;
  };

  const appendMessage = async (chatId, messageData) => {
    if (!isLoggedIn || !chatId) return;
    try {
      await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify(messageData),
      });
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  };

  const loadChat = async (chatId) => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`${API_URL}/api/chats/${chatId}`, {
        credentials: 'include',
        headers: getHeaders(),
      });
      if (res.ok) {
        const chat = await res.json();
        
        // Restore messages
        const restoredMessages = chat.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          files: msg.files || null,
          previewHtml: msg.previewHtml || null,
        }));
        setMessages(restoredMessages);
        setActiveChatId(chatId);

        // Rebuild conversation history string for context
        let history = '';
        for (const msg of chat.messages) {
          if (msg.role === 'user') {
            history += `\nUser: ${msg.content}\n`;
          } else {
            history += `Agent: ${msg.content || 'Generated code files.'}\n`;
          }
        }
        setConversationHistory(history);

        // Count user messages as turns, find last files/preview
        let turns = 0;
        let lastFiles = null;
        let lastPreview = null;
        for (const msg of chat.messages) {
          if (msg.role === 'user') turns++;
          if (msg.files) lastFiles = msg.files;
          if (msg.previewHtml) lastPreview = msg.previewHtml;
        }

        // Notify parent to restore state
        if (onChatLoaded) {
          onChatLoaded({
            turns,
            files: lastFiles,
            previewHtml: lastPreview,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const handleSelectChat = (chatId) => {
    if (chatId === activeChatId) return;
    loadChat(chatId);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId(null);
    setConversationHistory('');
    setStreamingText('');
    setCurrentPhase(null);
    setCompletedPhases([]);
    setSidebarOpen(false);

    // Notify parent to reset state
    if (onChatLoaded) {
      onChatLoaded({ turns: 0, files: null, previewHtml: null });
    }
  };

  // --- End Chat Persistence ---

  const handleSend = useCallback(async () => {
    if (!input.trim() || currentTurn >= maxTurns || isStreaming) return;

    const userPrompt = input.trim();
    const userMsg = { role: 'user', content: userPrompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setCurrentPhase(null);
    setCompletedPhases([]);
    setStreamingText('');

    // Ensure we have a chat ID for persistence
    let chatId = activeChatId;
    if (!chatId && isLoggedIn && questionId) {
      chatId = await createChat();
      if (chatId) setActiveChatId(chatId);
    }

    // Persist user message
    if (chatId) {
      appendMessage(chatId, { role: 'user', content: userPrompt });
    }

    // Create an agent message placeholder
    const agentMsgId = Date.now();

    // Abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const contextStr = questionContext
        ? `Question context: ${questionContext}\n\n${conversationHistory}`
        : conversationHistory;

      const headers = { 'Content-Type': 'application/json' };
      if (memoryToken) {
        headers['Authorization'] = `Bearer ${memoryToken}`;
      }

      const response = await fetch(`${API_URL}/api/agent/generate`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({
          prompt: userPrompt,
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
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim();
            continue;
          }
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);

              if (data.phase) {
                if (data.phase === 'complete') {
                  finalData = data;
                  // Mark current phase as done
                  if (currentPhase) {
                    setCompletedPhases((prev) => [...prev, currentPhase]);
                  }
                  setCurrentPhase('complete');
                } else if (data.phase === 'error') {
                  setCurrentPhase('error');
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: 'agent',
                      content: `Error: ${data.message}`,
                      isError: true,
                    },
                  ]);
                  setIsStreaming(false);
                  return;
                } else {
                  // Transition phases
                  setCompletedPhases((prev) => {
                    const newPhases = [...prev];
                    if (currentPhase && !newPhases.includes(currentPhase)) {
                      newPhases.push(currentPhase);
                    }
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
      if (finalData) {
        const agentMessage = {
          role: 'agent',
          content: finalData.explanation || 'Here is what I built for you:',
          files: finalData.files || null,
          previewHtml: finalData.previewHtml || null,
        };
        setMessages((prev) => [...prev, agentMessage]);

        // Persist agent message
        if (chatId) {
          appendMessage(chatId, {
            role: 'agent',
            content: finalData.explanation || 'Here is what I built for you:',
            files: finalData.files || null,
            previewHtml: finalData.previewHtml || null,
          });
        }

        // Update conversation history for follow-up context
        setConversationHistory(
          (prev) =>
            `${prev}\nUser: ${userPrompt}\nAgent: ${finalData.explanation || 'Generated code files.'}\n`
        );

        // Notify parent component
        if (onAgentResponse) {
          onAgentResponse(userPrompt, {
            files: finalData.files,
            previewHtml: finalData.previewHtml,
            explanation: finalData.explanation,
          });
        }
      } else {
        // No finalData — treat streamed text as explanation
        const fallbackContent = fullStreamedText || 'Agent completed without structured output.';
        setMessages((prev) => [
          ...prev,
          { role: 'agent', content: fallbackContent },
        ]);

        // Persist agent message
        if (chatId) {
          appendMessage(chatId, { role: 'agent', content: fallbackContent });
        }

        if (onAgentResponse) {
          onAgentResponse(userPrompt, { files: null, previewHtml: null, explanation: fullStreamedText });
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Streaming error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: `Error: ${error.message}`, isError: true },
      ]);
    } finally {
      setIsStreaming(false);
      setCurrentPhase(null);
      setCompletedPhases([]);
      setStreamingText('');
    }
  }, [input, currentTurn, maxTurns, isStreaming, conversationHistory, questionContext, onAgentResponse, activeChatId, isLoggedIn, questionId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const allPhases = ['analyzing', 'planning', 'generating', 'creating_files'];

  return (
    <div className="prompt-chat-wrapper" id="prompt-chat">
      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Sidebar */}
      {isLoggedIn && (
        <ChatSidebar
          questionId={questionId}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="prompt-chat">
        <div className="chat-header">
          <div className="chat-header-left">
            {isLoggedIn && (
              <button
                className={`history-toggle-btn ${sidebarOpen ? 'active' : ''}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Chat History"
              >
                <FiClock size={16} />
              </button>
            )}
            <span className="chat-title"><FiMessageSquare size={16} /> Prompt Chat</span>
          </div>
          <div className="chat-header-right">
            {isLoggedIn && onGoToChats && (
              <button
                className="view-all-chats-btn"
                onClick={onGoToChats}
                title="View All Chats"
              >
                <FiExternalLink size={14} />
                <span>All Chats</span>
              </button>
            )}
            <span className="turn-counter">
              Prompt {Math.min(currentTurn + 1, maxTurns)} of {maxTurns}
            </span>
          </div>
        </div>
        <div className="chat-messages">
          {messages.length === 0 && !isStreaming && (
            <div className="chat-empty">
              <div className="empty-icon-wrapper">
                <FiCpu className="empty-icon" size={40} />
                <div className="empty-icon-ring" />
              </div>
              <p className="empty-title">Write a prompt to instruct the AI agent.</p>
              <p className="empty-hint">Describe what you want the agent to build. The AI will generate real, working code.</p>
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
                        <iframe
                          srcDoc={msg.previewHtml}
                          sandbox="allow-scripts allow-same-origin"
                          scrolling="no"
                          title="Preview Thumbnail"
                          className="thumbnail-iframe-large"
                        />
                      </div>
                    </div>
                    <div className="result-card-actions">
                      <button className="btn-primary open-preview-btn-large" onClick={onOpenPreview}>
                        Open Preview
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

                {/* Live Streaming Text (during generating phase) */}
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
        <div className="chat-input-area">
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
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || currentTurn >= maxTurns || isStreaming}
            className="btn-primary send-btn"
            id="send-prompt-btn"
          >
            <FiSend size={16} /> Send to Agent
          </button>
        </div>
      </div>
    </div>
  );
}
