import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  FiMessageSquare, FiFolder, FiMonitor,
  FiAlertTriangle, FiBarChart2, FiCheckCircle, FiX,
  FiClipboard, FiSettings, FiImage, FiCheck, FiArrowLeft, FiArrowRight, FiClock, FiCode, FiZap, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiCircle
} from 'react-icons/fi';
import questions from '../data/questions';
import mockAgentRuns from '../data/mockAgentRuns';
import PromptChat from '../components/PromptChat';
import FileExplorer from '../components/FileExplorer';
import PreviewEvaluation from '../components/PreviewEvaluation';
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
  const [tipsExpanded, setTipsExpanded] = useState(false);

  // Preview & Evaluation state (Part 4)
  const [previewEvaluation, setPreviewEvaluation] = useState(null);
  const [previewEvalLoading, setPreviewEvalLoading] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState(null);

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

  // Auto-evaluate when new preview arrives (Part 4/5)
  useEffect(() => {
    if (!currentPreview || currentTurn === 0 || !agentRun) return;
    setPreviewEvalLoading(true);
    setPreviewEvaluation(null);
    const timer = setTimeout(() => {
      const evalData = agentRun.evaluateOutput(question, currentFiles, currentTurn);
      setPreviewEvaluation(evalData);
      setPreviewEvalLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, [currentPreview, currentTurn, question, currentFiles, agentRun]);

  if (!question) {
    return <div className="qd-not-found"><h2>Question not found</h2></div>;
  }

  // Build context string from question for the AI
  let questionContext = `Build a component for: "${question.title}"\nDescription: ${question.description}\nRequirements:\n${question.requirements.map((r) => `- ${r}`).join('\n')}\nConstraints:\n${question.constraints.map((c) => `- ${c}`).join('\n')}`;

  if (question.requiredContent && Object.keys(question.requiredContent).length > 0) {
    questionContext += `\n\nRequired exact text (reproduce verbatim, do not paraphrase or invent alternatives):\n`;
    const parts = Object.entries(question.requiredContent).map(([key, value]) => {
      return `${key.charAt(0).toUpperCase() + key.slice(1)}: "${value}"`;
    });
    questionContext += parts.join(' | ');
  }

  const handleAgentResponse = useCallback((prompt, responseData) => {
    if (responseData.files) {
      setCurrentFiles(responseData.files);
    }
    if (responseData.previewHtml) {
      setCurrentPreview(responseData.previewHtml);
    }
    setCurrentTurn((prev) => prev + 1);
    setLastGeneratedAt(new Date());
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
    const evalData = agentRun.evaluateOutput(question, currentFiles, currentTurn);
    setEvaluation(evalData);
  };

  const handleTryAgain = () => {
    setCurrentTurn(0);
    setCurrentFiles(null);
    setCurrentPreview(null);
    setShowEval(false);
    setEvaluation(null);
    setPreviewEvaluation(null);
    setPreviewEvalLoading(false);
    setLastGeneratedAt(null);
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
        <div
          className="qd-panel qd-left"
          style={{ width: `${leftWidth}%`, transition: isDragging.current ? 'none' : 'width 0.3s ease' }}
        >
          <div className="qd-left-scroll">
            {/* Back link */}
            <Link to="/questions" className="qd-back-link">
              <FiArrowLeft size={14} /> Problems
            </Link>

            {/* Title bar */}
            <div className="qd-title-bar">
              <div className="qd-tags">
                <span className={`badge badge-${question.difficulty.toLowerCase()}`}>
                  {question.difficulty}
                </span>
                <span className="category-tag">{question.category}</span>
                <span className="qd-ai-eval-tag"><FiZap size={12} /> AI Evaluation</span>
              </div>
            </div>

            <h1 className="qd-title">
              {question.title.split(' ').map((word, i, arr) => {
                if (i >= arr.length - 2) {
                  return <span key={i} className="gradient-text">{word} </span>;
                }
                return word + ' ';
              })}
            </h1>
            <p className="qd-description">{question.description}</p>

            {/* Metadata Row */}
            <div className="qd-metadata-row">
              <div className="qd-metadata-item">
                <FiClock size={14} /> ~{Math.ceil(question.maxPromptTurns * 1.5)} min
              </div>
              <div className="qd-metadata-item">
                <FiCode size={14} /> Frontend
              </div>
            </div>

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
              <div className="qd-section-header">
                <h3 className="qd-section-title"><FiClipboard size={18} /> Requirements</h3>
                <span className="qd-req-count">{question.requirements.length} Items</span>
              </div>
              <ul className="qd-req-list">
                {question.requirements.map((req, i) => (
                  <li key={i} className="qd-req-item">
                    <div className="qd-req-badge">{i + 1}</div>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Constraints / Tips */}
            {question.constraints && question.constraints.length > 0 && (
              <div className={`qd-tip-card ${tipsExpanded ? 'expanded' : ''}`}>
                <button className="qd-tip-header" onClick={() => setTipsExpanded(!tipsExpanded)}>
                  <div className="qd-tip-title">
                    <span className="qd-tip-icon">💡</span> Tip
                  </div>
                  {tipsExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
                {tipsExpanded && (
                  <div className="qd-tip-content animate-fade">
                    <ul className="qd-tip-list">
                      {question.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RESIZE HANDLE */}
        <div
          className="qd-resizer"
          onMouseDown={handleMouseDown}
        >
          <div className="resizer-line" />
        </div>

        {/* RIGHT PANEL — Workspace */}
        <div
          className="qd-panel qd-right"
          style={{ width: `${100 - leftWidth}%`, transition: isDragging.current ? 'none' : 'width 0.3s ease' }}
        >
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
              className={`btn-primary submit-inline-btn ${!currentFiles ? 'disabled' : ''}`}
              onClick={handleSubmit}
              disabled={!currentFiles}
              id="submit-eval-btn"
            >
              Submit Solution <FiArrowRight size={16} className="submit-arrow" />
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
                onOpenPreview={() => setActiveTab('preview')}
                onOpenFile={() => setActiveTab('files')}
              />
            )}
            {activeTab === 'files' && (
              <FileExplorer
                files={currentFiles}
                onDownload={handleDownload}
                onGoToChat={() => setActiveTab('chat')}
                onOpenPreview={() => setActiveTab('preview')}
                previewHtml={currentPreview}
              />
            )}
            {activeTab === 'preview' && (
              <PreviewEvaluation
                question={question}
                currentPreview={currentPreview}
                currentTurn={currentTurn}
                previewEvaluation={previewEvaluation}
                previewEvalLoading={previewEvalLoading}
                lastGeneratedAt={lastGeneratedAt}
                setActiveTab={setActiveTab}
              />
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

