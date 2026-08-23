import { useState, useRef, useEffect, useCallback } from 'react';
import { FiUser, FiCpu, FiSend, FiMessageSquare, FiCode, FiFile, FiChevronDown, FiChevronRight, FiCopy, FiCheck, FiSearch, FiLayout, FiZap, FiFolder, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
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

function CodeBlock({ code, fileName }) {
  const [collapsed, setCollapsed] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;
  const previewLines = code.split('\n').slice(0, 4).join('\n');

  return (
    <div className="inline-code-block">
      <div className="code-block-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="code-block-file">
          <FiFile size={13} />
          <span>{fileName}</span>
          <span className="code-block-lines">{lineCount} lines</span>
        </div>
        <div className="code-block-actions">
          <button className="code-copy-btn" onClick={(e) => { e.stopPropagation(); handleCopy(); }}>
            {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
          </button>
          {collapsed ? <FiChevronRight size={14} /> : <FiChevronDown size={14} />}
        </div>
      </div>
      {!collapsed && (
        <pre className="code-block-body">
          <code>{code}</code>
        </pre>
      )}
      {collapsed && (
        <pre className="code-block-preview">
          <code>{previewLines}...</code>
        </pre>
      )}
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

export default function PromptChat({ currentTurn, maxTurns, onAgentResponse, questionContext }) {
  const { user, memoryToken } = useAuth();
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

    const userPrompt = input.trim();
    const userMsg = { role: 'user', content: userPrompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setCurrentPhase(null);
    setCompletedPhases([]);
    setStreamingText('');

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
        setMessages((prev) => [
          ...prev,
          { role: 'agent', content: fullStreamedText || 'Agent completed without structured output.' },
        ]);
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
  }, [input, currentTurn, maxTurns, isStreaming, conversationHistory, questionContext, onAgentResponse]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const allPhases = ['analyzing', 'planning', 'generating', 'creating_files'];

  return (
    <div className="prompt-chat" id="prompt-chat">
      <div className="chat-header">
        <span className="chat-title"><FiMessageSquare size={16} /> Prompt Chat</span>
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
              {msg.files && Object.keys(msg.files).length > 0 && (
                <div className="bubble-files">
                  <div className="files-created-label">
                    <FiCode size={13} />
                    <span>{Object.keys(msg.files).length} files generated</span>
                  </div>
                  {Object.entries(msg.files).map(([fileName, code]) => (
                    <CodeBlock key={fileName} code={code} fileName={fileName} />
                  ))}
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
  );
}
