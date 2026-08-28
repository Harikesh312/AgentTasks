import { useState, useRef, useEffect, useCallback } from 'react';
import { FiUser, FiCpu, FiSend, FiMessageSquare, FiCode, FiFile, FiChevronDown, FiChevronRight, FiCopy, FiCheck, FiSearch, FiLayout, FiZap, FiFolder, FiCheckCircle, FiAlertTriangle, FiClock, FiExternalLink, FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiMenu, FiArrowUp, FiLoader } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../context/AuthContext';
import ChatSidebar from './ChatSidebar';
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

const PHASE_LABELS = {
  analyzing: 'Analyzing requirements',
  planning: 'Planning the architecture',
  generating: 'Generating code',
  creating_files: 'Creating files',
  complete: 'Finalizing',
  error: 'An error occurred',
};

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vs}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: '1em 0', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.95em', padding: '16px' }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const formatPartialJSONToMarkdown = (jsonString) => {
  if (!jsonString) return '';
  if (!jsonString.trim().startsWith('{')) return jsonString;

  let markdown = '';
  
  const expMatch = jsonString.match(/"explanation"\s*:\s*"([\s\S]*?)(?="\s*,\s*"files"|"\s*\})/);
  let explanation = '';
  if (expMatch) {
    explanation = expMatch[1];
  } else {
    const expStart = jsonString.match(/"explanation"\s*:\s*"/);
    if (expStart) {
      explanation = jsonString.substring(expStart.index + expStart[0].length);
      if (explanation.endsWith('"')) explanation = explanation.slice(0, -1);
    }
  }
  
  if (explanation) {
    markdown += explanation.replace(/\\n/g, '\n').replace(/\\"/g, '"') + '\n\n';
  }

  const filesStart = jsonString.indexOf('"files"');
  if (filesStart !== -1) {
    const filesStr = jsonString.substring(filesStart);
    const fileKeyRegex = /"([^"]+\.[a-zA-Z0-9]+)"\s*:\s*"/g;
    let match;
    let fileMatches = [];
    
    while ((match = fileKeyRegex.exec(filesStr)) !== null) {
      fileMatches.push({
        name: match[1],
        contentStart: match.index + match[0].length
      });
    }

    for (let i = 0; i < fileMatches.length; i++) {
      const file = fileMatches[i];
      const nextFile = fileMatches[i + 1];
      
      let content = '';
      if (nextFile) {
        content = filesStr.substring(file.contentStart, nextFile.contentStart);
        content = content.replace(/",\s*$/, '');
      } else {
        content = filesStr.substring(file.contentStart);
        content = content.replace(/"\s*\}\s*\}?\s*$/, '');
        if (content.endsWith('"')) content = content.slice(0, -1);
      }

      content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
      
      const ext = file.name.split('.').pop() || '';
      let lang = ext;
      if (ext === 'js' || ext === 'jsx') lang = 'javascript';
      if (ext === 'html') lang = 'html';
      if (ext === 'css') lang = 'css';

      markdown += `\n**${file.name}**\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
    }
  }
  
  return markdown || jsonString;
};

function FileCard({ fileName, code, onOpen }) {
  const lineCount = code.split('\n').length;
  
  const ext = fileName.split('.').pop();
  let Icon = FiFile;
  let color = '#64748b';
  
  if (ext === 'html') { Icon = FiCode; color = '#e44d26'; }
  if (ext === 'css') { Icon = FiCode; color = '#264de4'; }
  if (ext === 'js' || ext === 'jsx') { Icon = FiCode; color = '#f7df1e'; }
  
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

export default function PromptChat({ currentTurn, maxTurns, onAgentResponse, questionContext, onOpenPreview, onOpenFile, questionId, onChatLoaded, onGoToChats, pendingChatId, onPendingChatConsumed, onOpenFullPreview }) {
  const { user, memoryToken, isLoggedIn } = useAuth();
  
  // Chat content state
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [conversationHistory, setConversationHistory] = useState('');
  
  // Sidebar / Chat selection state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);

  // Refs
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const activeChatIdRef = useRef(null);

  // Sync ref with state to prevent race conditions during streaming
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

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

  // Handle loading chat from external navigation (e.g. from ChatsTab)
  useEffect(() => {
    if (pendingChatId && pendingChatId !== activeChatId) {
      handleSelectChat(pendingChatId);
      if (onPendingChatConsumed) onPendingChatConsumed();
    }
  }, [pendingChatId]);

  // Load a chat by ID
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
          isError: msg.isError || false
        }));
        setMessages(restoredMessages);
        setActiveChatId(chatId);

        // Rebuild conversation history string for context
        let history = '';
        let turns = 0;
        let lastFiles = null;
        let lastPreview = null;

        for (const msg of chat.messages) {
          if (msg.role === 'user') {
            history += `\nUser: ${msg.content}\n`;
            turns++;
          } else {
            history += `Agent: ${msg.content || 'Generated code files.'}\n`;
            if (msg.files) lastFiles = msg.files;
            if (msg.previewHtml) lastPreview = msg.previewHtml;
          }
        }
        setConversationHistory(history);

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

  // Auto-load the most recent chat on mount if no chat is active
  useEffect(() => {
    const fetchLatestChat = async () => {
      if (!isLoggedIn || !questionId) return;
      try {
        const res = await fetch(`${API_URL}/api/chats?questionId=${questionId}`, {
          credentials: 'include',
          headers: getHeaders(),
        });
        if (res.ok) {
          const chats = await res.json();
          if (chats && chats.length > 0) {
            loadChat(chats[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to auto-load recent chat:', err);
      }
    };

    if (!activeChatIdRef.current && !pendingChatId) {
      fetchLatestChat();
    }
  }, [questionId, isLoggedIn, pendingChatId]);

  const handleSelectChat = (chatId) => {
    if (chatId === activeChatId) return;
    loadChat(chatId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
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

  // Chat Persistence Helpers
  const createChat = async (title) => {
    if (!isLoggedIn || !questionId) return null;
    try {
      const res = await fetch(`${API_URL}/api/chats`, {
        method: 'POST',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ questionId, title }),
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

    let currentChatId = activeChatId;
    const isNewChat = !currentChatId;

    // Ensure we have a chat ID for persistence
    if (isNewChat && isLoggedIn && questionId) {
      let newTitle = submittedPrompt.split('\n')[0].substring(0, 40);
      if (newTitle.length === 40) newTitle += '...';
      currentChatId = await createChat(newTitle);
      if (currentChatId) setActiveChatId(currentChatId);
    }

    // Persist user message
    if (currentChatId) {
      await appendMessage(currentChatId, { role: 'user', content: submittedPrompt });
    }

    // Abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const initialChatId = currentChatId;
      
      const contextStr = questionContext
        ? `Question context: ${questionContext}\n\n${conversationHistory}`
        : conversationHistory;

      const response = await fetch(`${API_URL}/api/agent/generate`, {
        method: 'POST',
        headers: getHeaders(),
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
        // If user switched chat while streaming, abort the stream
        if (initialChatId !== activeChatIdRef.current) {
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
                  
                  if (currentChatId) {
                    await appendMessage(currentChatId, { role: 'agent', content: errorMsg, isError: true });
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

      // Check one more time before processing final response
      if (initialChatId !== activeChatIdRef.current) return;

      if (finalData) {
        const agentContent = finalData.explanation || 'Here is what I built for you:';
        const agentMessage = {
          role: 'agent',
          content: agentContent,
          files: finalData.files || null,
          previewHtml: finalData.previewHtml || null,
        };
        setMessages((prev) => [...prev, agentMessage]);

        // Persist agent message
        if (currentChatId) {
          await appendMessage(currentChatId, {
            role: 'agent',
            content: agentContent,
            files: finalData.files || null,
            previewHtml: finalData.previewHtml || null,
          });
        }

        // Update conversation history for follow-up context
        setConversationHistory(
          (prev) =>
            `${prev}\nUser: ${submittedPrompt}\nAgent: ${agentContent}\n`
        );

        if (onAgentResponse) {
          onAgentResponse(submittedPrompt, {
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
        if (currentChatId) {
          await appendMessage(currentChatId, { role: 'agent', content: fallbackContent });
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
      
      if (currentChatId) {
        await appendMessage(currentChatId, { role: 'agent', content: errorMsg, isError: true });
      }
    } finally {
      setIsStreaming(false);
      setCurrentPhase(null);
      setCompletedPhases([]);
      setStreamingText('');
      abortControllerRef.current = null;
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
                  <MarkdownRenderer content={msg.content} />
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

          {/* Real-time Streaming AI Response */}
          {isStreaming && (
            <div className="chat-bubble agent">
              <div className="bubble-content" style={{ paddingLeft: 0 }}>
                <div className="agent-thought-indicator">
                  <FiLoader size={16} className="spin-icon orange-sunburst" />
                  <span className="animated-dots">{PHASE_LABELS[currentPhase] || 'Thinking'}</span>
                </div>
                {streamingText && (
                  <div className="bubble-text markdown-body" style={{ color: 'var(--text-primary)', marginTop: '8px' }}>
                    <MarkdownRenderer content={formatPartialJSONToMarkdown(streamingText) + ' ▍'} />
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        {/* Improved Chat Input Area */}
        {/* Claude-style Input Area */}
        <div className="chat-input-area">
          <div className="claude-input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={currentTurn >= maxTurns ? 'Max prompt turns reached' : 'Ask the AI agent...'}
              disabled={currentTurn >= maxTurns || isStreaming}
              className="claude-textarea auto-resize"
              id="prompt-input"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || currentTurn >= maxTurns}
              className="claude-send-btn"
              id="send-prompt-btn"
            >
              {isStreaming ? (
                <div className="claude-stop-square" />
              ) : (
                <FiArrowUp size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
