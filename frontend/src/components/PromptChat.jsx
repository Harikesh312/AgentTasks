import { useState, useRef, useEffect } from 'react';
import { FiUser, FiCpu, FiSend, FiMessageSquare } from 'react-icons/fi';
import './PromptChat.css';

export default function PromptChat({ agentRun, currentTurn, maxTurns, onSendPrompt }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState('');
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const statuses = [
    "Analyzing requirements...",
    "Planning component structure...",
    "Running command: npm install...",
    "Writing CSS variables...",
    "Updating React components...",
    "Running build and tests...",
    "Generating final preview..."
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, agentStatus]);

  useEffect(() => {
    let timeoutId;
    
    const runStatuses = (index) => {
      if (!isTyping) return;
      
      setAgentStatus(statuses[index]);
      
      if (index < statuses.length - 1) {
        // Random gap between 2s and 3s
        const delay = Math.floor(Math.random() * 1000) + 2000;
        timeoutId = setTimeout(() => runStatuses(index + 1), delay);
      }
    };

    if (isTyping) {
      runStatuses(0);
    } else {
      setAgentStatus('');
    }
    
    return () => clearTimeout(timeoutId);
  }, [isTyping]);

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
    if (input === '') {
      adjustTextareaHeight();
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || currentTurn >= maxTurns || isTyping) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Total time is roughly statuses.length * 2.5 seconds
    const totalSimulatedTime = statuses.length * 2500;

    setTimeout(() => {
      const hasKeyword = agentRun.keywords?.some((kw) =>
        input.toLowerCase().includes(kw.toLowerCase())
      );
      const responseIdx = currentTurn === 0 ? 0 : hasKeyword && agentRun.turns.length > 1 ? 1 : 0;
      const response = agentRun.turns[responseIdx];

      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: response.agentMessage },
      ]);
      setIsTyping(false);
      onSendPrompt(input, responseIdx);
    }, totalSimulatedTime); 
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      handleSend(); 
    }
  };

  return (
    <div className="prompt-chat" id="prompt-chat">
      <div className="chat-header">
        <span className="chat-title"><FiMessageSquare size={16} /> Prompt Chat</span>
        <span className="turn-counter">
          Prompt {Math.min(currentTurn + 1, maxTurns)} of {maxTurns}
        </span>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <FiCpu className="empty-icon" size={40} />
            <p>Write a prompt to instruct the AI agent.</p>
            <p className="empty-hint">Describe what you want the agent to build based on the reference design.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="bubble-avatar">
              {msg.role === 'user' ? <FiUser size={16} /> : <FiCpu size={16} />}
            </div>
            <div className="bubble-content">
              <span className="bubble-role">{msg.role === 'user' ? 'You' : 'AI Agent'}</span>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble agent typing-indicator">
            <div className="bubble-avatar"><FiCpu size={16} className="spin-icon" /></div>
            <div className="bubble-content agent-action-content">
              <span className="bubble-role">AI Agent Working</span>
              <div className="agent-status-text">
                <span className="status-cursor">&gt;</span> {agentStatus}
              </div>
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
          placeholder={currentTurn >= maxTurns ? "Max prompt turns reached" : "Describe what the agent should build or fix..."}
          disabled={currentTurn >= maxTurns || isTyping}
          className="chat-textarea auto-resize"
          id="prompt-input"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || currentTurn >= maxTurns || isTyping}
          className="btn-primary send-btn"
          id="send-prompt-btn"
        >
          <FiSend size={16} /> Send to Agent
        </button>
      </div>
    </div>
  );
}
