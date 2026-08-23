import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  FiMessageSquare, FiFolder, FiMonitor,
  FiAlertTriangle, FiBarChart2, FiCheckCircle, FiX,
  FiClipboard, FiSettings, FiImage, FiCheck
} from 'react-icons/fi';
import questions from '../data/questions';
import mockAgentRuns from '../data/mockAgentRuns';
import PromptChat from '../components/PromptChat';
import FileExplorer from '../components/FileExplorer';
import PreviewPane from '../components/PreviewPane';
import EvaluationCard from '../components/EvaluationCard';
import QuestionDiscussTab from '../components/QuestionDiscussTab';
import './QuestionDetailPage.css';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const question = questions.find((q) => q.id === Number(id));
  const agentRun = mockAgentRuns[Number(id)];

  const [activeTab, setActiveTab] = useState('chat');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [currentFiles, setCurrentFiles] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [showEval, setShowEval] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [toast, setToast] = useState(null);

  // Resizable panels
  const [leftWidth, setLeftWidth] = useState(42); // percentage
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(Math.max(pct, 25), 75));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!question) {
    return <div className="qd-not-found"><h2>Question not found</h2></div>;
  }

  // Build context string from question for the AI
  const questionContext = `Build a component for: "${question.title}"\nDescription: ${question.description}\nRequirements:\n${question.requirements.map((r) => `- ${r}`).join('\n')}\nConstraints:\n${question.constraints.map((c) => `- ${c}`).join('\n')}`;

  const handleAgentResponse = useCallback((prompt, responseData) => {
    if (responseData.files) {
      setCurrentFiles(responseData.files);
    }
    if (responseData.previewHtml) {
      setCurrentPreview(responseData.previewHtml);
    }
    setCurrentTurn((prev) => prev + 1);
    // Auto-switch to preview if we got one, otherwise files
    if (responseData.previewHtml) {
      setActiveTab('preview');
    } else if (responseData.files) {
      setActiveTab('files');
    }
  }, []);

  const handleDownload = async () => {
    if (!currentFiles) return;
    const zip = new JSZip();
    Object.entries(currentFiles).forEach(([name, content]) => {
      zip.file(name, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `agentprep-${question.id}-output.zip`);
    setToast('Files downloaded successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = () => {
    if (!currentFiles) return;
    setShowEval(true);
    const evalData = agentRun.evalResult(currentTurn);
    setEvaluation(evalData);
  };

  const handleTryAgain = () => {
    setCurrentTurn(0);
    setCurrentFiles(null);
    setCurrentPreview(null);
    setShowEval(false);
    setEvaluation(null);
    setActiveTab('chat');
  };

  const tabs = [
    { key: 'chat', label: 'Prompt Chat', icon: <FiMessageSquare size={18} /> },
    { key: 'files', label: 'Files', icon: <FiFolder size={18} /> },
    { key: 'preview', label: 'Preview', icon: <FiMonitor size={18} /> },
    { key: 'discuss', label: 'Discuss', icon: <FiMessageSquare size={18} /> },
  ];

  return (
    <div className="qd-page" id="question-detail">
      {/* Two-panel resizable layout */}
      <div className="qd-split" ref={containerRef}>
        {/* LEFT PANEL — Question + Reference */}
        <div className="qd-panel qd-left" style={{ width: `${leftWidth}%` }}>
          <div className="qd-left-scroll">
            {/* Title bar */}
            <div className="qd-title-bar">
              <div className="qd-tags">
                <span className={`badge badge-${question.difficulty.toLowerCase()}`}>
                  {question.difficulty}
                </span>
                <span className="category-tag">{question.category}</span>
                {question.isOptimizationTrap && (
                  <span className="badge badge-trap"><FiAlertTriangle size={11} /> Optimization Trap</span>
                )}
              </div>
            </div>

            <h1 className="qd-title">{question.title}</h1>
            <p className="qd-description">{question.description}</p>

            {question.isOptimizationTrap && (
              <div className="qd-warning-banner">
                <FiAlertTriangle size={15} />
                <span>This AI agent may produce imperfect results on the first try. Use follow-up prompts to guide it toward the correct/optimized solution.</span>
              </div>
            )}

            {/* Reference image */}
            <div className="qd-section">
              <h3 className="qd-section-title"><FiImage size={18} /> Target Design</h3>
              {question.referenceImage ? (
                <div className="qd-ref-image-container" style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={question.referenceImage} alt="Reference Design" style={{ width: '100%', display: 'block', objectFit: 'contain' }} />
                </div>
              ) : (
                <div className="qd-ref-image">
                  <FiImage size={36} />
                  <span>Reference Design Preview</span>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="qd-section">
              <h3 className="qd-section-title"><FiClipboard size={18} /> Requirements</h3>
              <ul className="qd-req-list">
                {question.requirements.map((req, i) => (
                  <li key={i}><FiCheck size={13} className="req-check" /> {req}</li>
                ))}
              </ul>
            </div>

            {/* Constraints */}
            <div className="qd-section">
              <h3 className="qd-section-title"><FiSettings size={18} /> Constraints</h3>
              <ul className="qd-req-list constraints">
                {question.constraints.map((c, i) => (
                  <li key={i}><span className="constraint-dot">•</span> {c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* RESIZE HANDLE */}
        <div className="qd-resizer" onMouseDown={handleMouseDown}>
          <div className="resizer-line" />
        </div>

        {/* RIGHT PANEL — Workspace */}
        <div className="qd-panel qd-right" style={{ width: `${100 - leftWidth}%` }}>
          {/* Tabs */}
          <div className="qd-right-tabs">
            <div className="tab-group">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`ws-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            <button
              className="btn-primary submit-inline-btn"
              onClick={handleSubmit}
              disabled={!currentFiles}
              id="submit-eval-btn"
            >
              <FiBarChart2 size={18} /> Submit
            </button>
          </div>

          {/* Tab content */}
          <div className="qd-right-content">
            {activeTab === 'chat' && (
              <PromptChat
                currentTurn={currentTurn}
                maxTurns={question.maxPromptTurns}
                onAgentResponse={handleAgentResponse}
                questionContext={questionContext}
              />
            )}
            {activeTab === 'files' && (
              <FileExplorer files={currentFiles} onDownload={handleDownload} />
            )}
            {activeTab === 'preview' && (
              <PreviewPane previewHtml={currentPreview} />
            )}
            {activeTab === 'discuss' && (
              <QuestionDiscussTab
                questionId={question.id}
                onTryPrompt={() => setActiveTab('chat')}
              />
            )}
          </div>
        </div>
      </div>

      {/* EVALUATION MODAL OVERLAY */}
      {showEval && evaluation && (
        <div className="eval-overlay" onClick={() => setShowEval(false)}>
          <div className="eval-modal animate-slide" onClick={(e) => e.stopPropagation()}>
            <button className="eval-modal-close" onClick={() => setShowEval(false)}>
              <FiX size={20} />
            </button>
            <EvaluationCard
              evaluation={evaluation}
              questionId={question.id}
              onTryAgain={handleTryAgain}
            />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <FiCheckCircle className="toast-icon" size={22} />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
