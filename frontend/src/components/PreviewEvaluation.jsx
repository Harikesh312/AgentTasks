import { useState, useRef, useEffect } from 'react';
import {
  FiMonitor, FiSmartphone, FiTablet, FiImage, FiMessageSquare,
  FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiRefreshCw,
  FiClock, FiZap, FiArrowRight, FiTarget, FiLayout, FiCode,
  FiLayers, FiMaximize, FiCheck, FiX, FiAlertCircle, FiCpu, FiEye
} from 'react-icons/fi';
import ScaledPreview from './ScaledPreview';
import './PreviewEvaluation.css';

/* ─── Helpers ─── */
const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr${hours > 1 ? 's' : ''} ago`;
};

const METRIC_PREVIEW_CARDS = [
  { title: 'Visual Similarity', icon: FiImage, desc: 'How closely the generated UI matches the target design.', theme: 'blue' },
  { title: 'Requirement Coverage', icon: FiTarget, desc: 'Whether all requested elements and content are present.', theme: 'green' },
  { title: 'Functionality', icon: FiZap, desc: 'Whether interactions and features work correctly.', theme: 'purple' },
  { title: 'Responsiveness', icon: FiLayout, desc: 'How well the UI adapts to tablet and mobile screens.', theme: 'amber' },
  { title: 'Code Quality', icon: FiCode, desc: 'Semantic HTML, structure and best practices.', theme: 'teal' },
  { title: 'Prompt Following', icon: FiMessageSquare, desc: "How well the agent followed the user's instructions and constraints.", theme: 'pink' },
];

const LOADING_STEPS = [
  'Analyzing your output...',
  'Comparing against the target...',
  'Checking requirements...',
  'Generating feedback...',
];


/* ─── Device Toggle ─── */
function DeviceToggle({ device, onDeviceChange }) {
  return (
    <div className="device-toggle">
      <button className={`device-btn ${device === 'desktop' ? 'active' : ''}`}
        onClick={() => onDeviceChange('desktop')} title="Desktop">
        <FiMonitor size={16} />
      </button>
      <button className={`device-btn ${device === 'tablet' ? 'active' : ''}`}
        onClick={() => onDeviceChange('tablet')} title="Tablet">
        <FiTablet size={16} />
      </button>
      <button className={`device-btn ${device === 'mobile' ? 'active' : ''}`}
        onClick={() => onDeviceChange('mobile')} title="Mobile">
        <FiSmartphone size={16} />
      </button>
    </div>
  );
}

/* ─── Score Circle ─── */
function ScoreCircle({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const circleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
      }
    }, { threshold: 0.5 });

    if (circleRef.current) {
      observer.observe(circleRef.current);
    }
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    
    let startTimestamp = null;
    const duration = 1200;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setAnimatedScore(Math.floor(easeProgress * score));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setAnimatedScore(score);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [hasAnimated, score]);

  const circumference = 2 * Math.PI * 48; 
  const label = score >= 90 ? 'Excellent!' : score >= 70 ? 'Great match!' : score >= 50 ? 'Good effort' : 'Needs work';
  
  let scoreClass = 'score-green';
  if (score < 80) scoreClass = 'score-amber';
  if (score < 50) scoreClass = 'score-red';

  return (
    <div className={`pe-score-section ${scoreClass}`} ref={circleRef}>
      <div className="pe-score-circle-wrapper">
        <svg viewBox="0 0 110 110" className="pe-score-svg">
          <circle cx="55" cy="55" r="48" className="pe-score-track" />
          <circle cx="55" cy="55" r="48" className="pe-score-fill"
            style={{ 
              strokeDasharray: `${(animatedScore / 100) * circumference} ${circumference}`,
              transition: 'none'
            }}
          />
        </svg>
        <div className="pe-score-content">
          <span className="pe-score-num">{animatedScore}</span>
          <span className="pe-score-pct">%</span>
        </div>
      </div>
      <div className="pe-score-label">{label}</div>
    </div>
  );
}

export default function PreviewEvaluation({
  question,
  currentPreview,
  currentTurn,
  previewEvaluation,
  previewEvalLoading,
  lastGeneratedAt,
  setActiveTab,
  onOpenFullPreview,
}) {
  const [expectedDevice, setExpectedDevice] = useState('desktop');
  const [actualDevice, setActualDevice] = useState('desktop');
  const [loadingStep, setLoadingStep] = useState(0);

  // Resize logic
  const [leftWidth, setLeftWidth] = useState(50);
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
      setLeftWidth(Math.min(Math.max(pct, 20), 80));
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

  useEffect(() => {
    if (!previewEvalLoading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
    }, 500);
    return () => clearInterval(interval);
  }, [previewEvalLoading]);

  const hasGenerated = !!currentPreview;
  const isSuccess = previewEvaluation?.score >= 80;

  /* ─── STATE 1: Before generation ─── */
  if (!hasGenerated) {
    return (
      <div className="pe-container">
        <div className="pe-header-bar pe-header-bar-simple">
          <h3 className="pe-heading">Preview</h3>
        </div>

        <div className="pe-before-layout">
          <div className="pe-before-top-card">
            <div className="pe-panel-header-premium">
              <div className="pe-panel-title-with-icon">
                <div className="pe-icon-container blue-theme"><FiImage size={18} /></div>
                <span className="pe-panel-title-main">Reference / Target Design</span>
                <span className="pe-status-badge pe-status-target"><span className="pe-status-dot"></span> Target</span>
              </div>
            </div>
            <div className="pe-before-reference-frame">
              {question.referenceImage ? (
                <img src={question.referenceImage} alt="Reference Design" className="pe-before-ref-img" />
              ) : (
                <div className="pe-ref-empty"><FiImage size={40} /><span>No reference provided</span></div>
              )}
            </div>
          </div>
          
          <div className="pe-before-columns">
            <div className="pe-before-panel pe-target-requirements">
              <div className="pe-target-req-header">
                <h4 className="pe-target-req-title">Target Requirements</h4>
                <span className="pe-status-badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                  {question.requirements?.length} Items
                </span>
              </div>
              <ul className="pe-target-req-list">
                {question.requirements?.map((req, i) => (
                  <li key={i} className="premium-req-item">
                    <FiCheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span className="pe-req-text">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pe-before-panel pe-waiting-state">
              <div className="pe-waiting-icon orange-gradient"><FiCpu size={32} /></div>
              <h4 className="pe-waiting-title">Waiting for Agent Output</h4>
              <p className="pe-waiting-desc">Give your instructions in Prompt Chat to generate the solution.</p>
              <button className="btn-primary pe-btn-premium" style={{ marginTop: '16px' }} onClick={() => setActiveTab('chat')}>
                Go to Prompt Chat &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── LOADING STATE ─── */
  if (previewEvalLoading) {
    return (
      <div className="pe-container pe-center">
        <div className="pe-loading">
          <div className="pe-spinner" />
          <p className="pe-loading-text">{LOADING_STEPS[loadingStep]}</p>
          <div className="pe-loading-bar"><div className="pe-loading-fill" /></div>
        </div>
      </div>
    );
  }

  /* ─── STATE 2: After generation ─── */
  const ev = previewEvaluation || {};
  const hasEval = !!previewEvaluation;

  const metrics = [
    { label: 'Visual Similarity', icon: FiImage, value: ev.visualMatch, desc: 'Measures layout, typography, colors, spacing and visual structure against the target.', theme: 'blue' },
    { label: 'Requirement Coverage', icon: FiTarget, value: ev.requirementCoverage, desc: 'Measures how many of the explicitly requested elements are present.', theme: 'green' },
    { label: 'Functionality', icon: FiZap, value: ev.functionality, desc: 'Measures if interactive elements and layout behaviors function correctly.', theme: 'purple' },
    { label: 'Responsiveness', icon: FiLayout, value: ev.responsiveness, desc: 'Measures how well the layout adapts across breakpoints.', theme: 'amber' },
    { label: 'Code Quality', icon: FiCode, value: ev.codeOptimization, desc: 'Measures semantic HTML structure and CSS best practices.', theme: 'teal' },
    { label: 'Prompt Following', icon: FiMessageSquare, value: ev.promptEfficiency, desc: 'Measures how quickly the agent reached the solution.', theme: 'pink' },
  ];

  const getRequirementStatus = (req) => {
    const reqLower = req.toLowerCase();
    const matched = (ev.matchedPoints || []).some((p) => p.toLowerCase().includes(reqLower.split(' ').slice(0, 2).join(' ')));
    const improved = (ev.improvementPoints || []).some((p) => p.toLowerCase().includes(reqLower.split(' ').slice(0, 2).join(' ')));
    if (matched) return 'matched';
    if (improved) return 'different';
    return ev.score >= 80 ? 'matched' : 'missing';
  };

  const getContentStatus = (key) => {
    const matched = (ev.matchedPoints || []).some(p => p.includes(`The ${key} matches`));
    const improved = (ev.improvementPoints || []).some(p => p.includes(`The ${key} text differs`));
    if (matched) return 'matched';
    if (improved) return 'different';
    return ev.score >= 80 ? 'matched' : 'missing';
  };

  return (
    <div className="pe-container">
      <div className="pe-header-bar pe-header-bar-after">
        <h3 className="pe-heading">Preview</h3>
        <div className="pe-header-actions">
          <div className="pe-attempt-info">
            <span className="pe-attempt-badge">Attempt {currentTurn}</span>
            {lastGeneratedAt && <span className="pe-last-gen">Generated <FiClock size={12}/> {lastGeneratedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
          </div>
          <button className="btn-outline pe-btn-premium btn-sm" onClick={() => setActiveTab('chat')}><FiRefreshCw size={14} /> Regenerate</button>
        </div>
      </div>

      <div className="pe-comparison-split" ref={containerRef}>
        <div className="pe-panel pe-panel-expected" style={{ width: `calc(${leftWidth}% - 8px)`, transition: isDragging.current ? 'none' : 'width 0.3s ease' }}>
          <span className="pe-panel-label-top">Expected Output</span>
          <div className="pe-panel-header-premium">
            <div className="pe-panel-title-with-icon">
              <div className="pe-icon-container blue-theme"><FiImage size={18} /></div>
              <span className="pe-panel-title-main">Reference Design</span>
              <span className="pe-status-badge pe-status-target"><span className="pe-status-dot"></span> Target</span>
            </div>
            <DeviceToggle device={expectedDevice} onDeviceChange={setExpectedDevice} />
          </div>
          <div className="pe-frame-wrapper">
             <div className={`pe-ref-frame device-view-${expectedDevice}`}>
               {question.referenceImage ? <img src={question.referenceImage} alt="Reference" className="pe-ref-img" /> : <div className="pe-ref-empty">No reference</div>}
             </div>
             {question.referenceImage && (
               <div className="pe-frame-hover-actions">
                 <button className="btn-outline pe-btn-premium" onClick={() => {
                   const imgHtml = `
                     <html style="margin:0;padding:0;height:100%;">
                       <body style="margin:0;padding:0;height:100%;">
                         <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#f8fafc;">
                           <img src="${question.referenceImage}" style="max-width:100%;max-height:100%;object-fit:contain;" />
                         </div>
                       </body>
                     </html>
                   `;
                   onOpenFullPreview(imgHtml, expectedDevice);
                 }}>
                   <FiMaximize size={16} /> Open Full Preview
                 </button>
               </div>
             )}
          </div>
        </div>
        
        {/* Resize Handle */}
        <div className="pe-resizer" onMouseDown={handleMouseDown}>
          <div className="pe-resizer-line" />
          <div className="pe-vs-badge-small">VS</div>
        </div>
        
        <div className={`pe-panel pe-panel-actual ${isSuccess ? 'pe-panel-success' : 'pe-panel-warning'}`} style={{ width: `calc(${100 - leftWidth}% - 8px)`, transition: isDragging.current ? 'none' : 'width 0.3s ease' }}>
          <span className="pe-panel-label-top">Actual Output</span>
          <div className="pe-panel-header-premium">
            <div className="pe-panel-title-with-icon">
              <div className="pe-icon-container purple-theme"><FiMonitor size={18} /></div>
              <span className="pe-panel-title-main">Agent Generated</span>
              <span className="pe-status-badge pe-status-generated"><span className="pe-status-dot"></span> Generated</span>
            </div>
            <DeviceToggle device={actualDevice} onDeviceChange={setActualDevice} />
          </div>
          <div className="pe-frame-wrapper">
             <div className={`pe-live-frame device-view-${actualDevice}`}>
               <div className="pe-browser-bar">
                 <div className="pe-dots">
                   <span style={{background:'#ef4444'}}></span>
                   <span style={{background:'#f59e0b'}}></span>
                   <span style={{background:'#10b981'}}></span>
                 </div>
                 <div className="pe-browser-url">localhost:3000/preview</div>
               </div>
               <div className="pe-iframe-wrapper">
                 <ScaledPreview html={currentPreview} device={actualDevice} title="Generated Output" />
               </div>
             </div>
             <div className="pe-frame-hover-actions" style={{ display: 'flex', gap: '12px' }}>
               <button className="btn-outline pe-btn-premium" onClick={() => onOpenFullPreview(currentPreview, actualDevice)}>
                 <FiEye size={16} /> Inspect Output
               </button>
               <button className="btn-outline pe-btn-premium" style={{ color: '#0f172a', borderColor: '#cbd5e1' }} onClick={() => onOpenFullPreview(currentPreview, 'desktop')}>
                 Open Full Preview
               </button>
             </div>
          </div>
        </div>
      </div>

      {hasEval && (
        <>
          <div className="pe-section pe-separator-top">
            <div className="pe-score-row">
              <div className="pe-score-container">
                <h4 className="pe-subheading pe-center-text">OVERALL MATCH</h4>
                <ScoreCircle score={ev.score} />
              </div>
            </div>
          </div>

          <div className="pe-section pe-separator-top">
            <div className="pe-section-header">
              <h4 className="pe-subheading">EVALUATION METRICS</h4>
            </div>
        <div className="pe-metrics-grid">
          {metrics.map((m, i) => (
            <div key={m.label} className={`pe-metric-card theme-${m.theme}`}>
              <div className="pe-metric-card-content">
                <div className={`pe-icon-container ${m.theme}-theme pe-metric-card-icon`}>
                  <m.icon size={22} />
                </div>
                <div className="pe-metric-info">
                  <span className="pe-metric-name">{m.label}</span>
                  <span className="pe-metric-val">{m.value}%</span>
                </div>
              </div>
              <div className="pe-metric-bar-bg">
                <div className={`pe-metric-bar-fill bg-${m.theme}`} style={{ width: `${m.value}%` }} />
              </div>
              <p className="pe-metric-card-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {ev.matchedPoints && ev.matchedPoints.length > 0 && (
        <div className="pe-section pe-success-section pe-separator-top">
          <div className="pe-section-header">
            <h4 className="pe-subheading pe-success-heading"><FiCheckCircle size={18} /> WHAT MATCHED WELL</h4>
          </div>
          <div className="pe-feedback-grid">
            {ev.matchedPoints.map((p, i) => {
              const title = p.split(' ').slice(0, 4).join(' ');
              return (
                <div key={i} className="pe-feedback-card pe-feedback-success">
                  <div className="pe-icon-container green-theme"><FiCheckCircle size={22} /></div>
                  <div className="pe-feedback-card-content">
                    <h5 className="pe-feedback-card-title">{title}</h5>
                    <p className="pe-feedback-card-text">{p}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {ev.improvementPoints && ev.improvementPoints.length > 0 && (
        <div className="pe-section pe-warning-section pe-separator-top">
          <div className="pe-section-header">
            <h4 className="pe-subheading pe-warning-heading"><FiAlertTriangle size={18} /> WHAT COULD BE IMPROVED</h4>
          </div>
          <div className="pe-feedback-grid">
            {ev.improvementPoints.map((p, i) => {
              const title = p.split(' ').slice(0, 4).join(' ');
              return (
                <div key={i} className="pe-feedback-card pe-feedback-warning">
                  <div className="pe-icon-container amber-theme"><FiAlertTriangle size={22} /></div>
                  <div className="pe-feedback-card-content">
                    <h5 className="pe-feedback-card-title">{title}</h5>
                    <p className="pe-feedback-card-text">{p}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pe-section pe-separator-top">
        <div className="pe-section-header">
          <h4 className="pe-subheading">DIFF HIGHLIGHTS</h4>
        </div>
        <div className="pe-diff-legend">
          <span className="pe-legend-item"><span className="pe-legend-dot pe-dot-matched" /> Matched</span>
          <span className="pe-legend-item"><span className="pe-legend-dot pe-dot-different" /> Different</span>
          <span className="pe-legend-item"><span className="pe-legend-dot pe-dot-missing" /> Missing</span>
        </div>
        <div className="pe-diff-grid">
          {question.requiredContent && Object.keys(question.requiredContent).map((key, i) => {
            const status = getContentStatus(key);
            return (
              <div key={`rc-${i}`} className={`pe-diff-card pe-diff-${status}`}>
                <div className="pe-diff-card-icon">
                  {status === 'matched' && <FiCheckCircle size={20} />}
                  {status === 'different' && <FiAlertTriangle size={20} />}
                  {status === 'missing' && <FiX size={20} />}
                </div>
                <div className="pe-diff-card-content">
                  <h6 className="pe-diff-card-title">{key}</h6>
                  <span className={`pe-diff-status-label pe-status-${status}`}>{status.toUpperCase()}</span>
                </div>
                <p className="pe-diff-card-desc">Explicit copy content requirement.</p>
              </div>
            );
          })}
          {question.requirements.map((req, i) => {
            const status = getRequirementStatus(req);
            return (
              <div key={`req-${i}`} className={`pe-diff-card pe-diff-${status}`}>
                <div className="pe-diff-card-icon">
                  {status === 'matched' && <FiCheckCircle size={20} />}
                  {status === 'different' && <FiAlertTriangle size={20} />}
                  {status === 'missing' && <FiX size={20} />}
                </div>
                <div className="pe-diff-card-content">
                  <h6 className="pe-diff-card-title">{req.length > 45 ? req.substring(0, 45) + '...' : req}</h6>
                  <span className={`pe-diff-status-label pe-status-${status}`}>{status.toUpperCase()}</span>
                </div>
                <p className="pe-diff-card-desc">{req}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pe-coach-card pe-separator-top">
        <div className="pe-coach-header">
          <div className="pe-icon-container purple-gradient"><FiTrendingUp size={24} color="white" /></div>
          <h4>AI Coach Feedback</h4>
        </div>
        <div className="pe-coach-content">
          <p className="pe-coach-text">{ev.feedback}</p>
          <button className="btn-primary pe-btn-premium pe-coach-btn" onClick={() => setActiveTab('chat')}>
            <FiMessageSquare size={16} /> Improve with Prompt
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
