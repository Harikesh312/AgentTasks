import { useState, useRef, useEffect } from 'react';
import {
  FiMonitor, FiSmartphone, FiTablet, FiImage, FiMessageSquare,
  FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiRefreshCw,
  FiClock, FiZap, FiArrowRight, FiTarget, FiLayout, FiCode,
  FiLayers, FiMaximize, FiCheck, FiX, FiAlertCircle, FiCpu, FiEye,
  FiSliders
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
        <FiMonitor size={14} />
      </button>
      <button className={`device-btn ${device === 'tablet' ? 'active' : ''}`}
        onClick={() => onDeviceChange('tablet')} title="Tablet">
        <FiTablet size={14} />
      </button>
      <button className={`device-btn ${device === 'mobile' ? 'active' : ''}`}
        onClick={() => onDeviceChange('mobile')} title="Mobile">
        <FiSmartphone size={14} />
      </button>
    </div>
  );
}

/* ─── Score Circle ─── */
function ScoreCircle({ score, size = 'large' }) {
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
    <div className={`pe-score-section ${scoreClass} ${size === 'mini' ? 'pe-score-mini' : ''}`} ref={circleRef}>
      <div className={`pe-score-circle-wrapper ${size === 'mini' ? 'pe-score-circle-mini' : ''}`}>
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
      {size !== 'mini' && <div className="pe-score-label">{label}</div>}
    </div>
  );
}

/* ─── Mini Score Badge ─── */
function MiniScoreBadge({ score }) {
  let cls = 'pe-mini-badge-green';
  if (score < 80) cls = 'pe-mini-badge-amber';
  if (score < 50) cls = 'pe-mini-badge-red';

  return (
    <div className={`pe-mini-score-badge ${cls}`}>
      <svg viewBox="0 0 36 36" className="pe-mini-ring-svg">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.15" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
          strokeDasharray={`${(score / 100) * 2 * Math.PI * 15.5} ${2 * Math.PI * 15.5}`}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      <span className="pe-mini-badge-num">{score}%</span>
    </div>
  );
}

/* ─── Typewriter Text ─── */
function TypewriterText({ text }) {
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayText('');
    setIsDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsDone(true);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="pe-coach-text">
      {displayText}
      {!isDone && <span className="pe-typewriter-cursor">|</span>}
    </p>
  );
}

/* ─── Quick Stats Ribbon ─── */
function QuickStatsRibbon({ metrics }) {
  const getBadgeTheme = (label) => {
    if (label.includes('Visual')) return 'amber';
    if (label.includes('Requirement')) return 'green';
    if (label.includes('Functionality')) return 'green';
    if (label.includes('Responsiveness')) return 'red';
    if (label.includes('Code')) return 'orange';
    if (label.includes('Prompt')) return 'green';
    return 'blue';
  };

  return (
    <div className="pe-quick-stats-ribbon">
      {metrics.map((m) => {
        const pillClass = `pe-pill-${getBadgeTheme(m.label)}`;
        return (
          <div key={m.label} className={`pe-stat-pill ${pillClass}`}>
            <m.icon size={18} />
            <span className="pe-pill-label">{m.label.split(' ')[0]}</span>
            <span className="pe-pill-value">{m.value}%</span>
          </div>
        );
      })}
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isComparisonFullScreen, setIsComparisonFullScreen] = useState(false);
  const [isExpectedFullScreen, setIsExpectedFullScreen] = useState(false);
  const [isTotalFullScreen, setIsTotalFullScreen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('split'); // 'split' or 'overlay'
  const [overlayPosition, setOverlayPosition] = useState(50);

  // Resize logic
  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const overlayRef = useRef(null);

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

  // Overlay slider
  const handleOverlayMouseDown = (e) => {
    e.preventDefault();
    const moveHandler = (me) => {
      if (!overlayRef.current) return;
      const rect = overlayRef.current.getBoundingClientRect();
      const pct = ((me.clientX - rect.left) / rect.width) * 100;
      setOverlayPosition(Math.min(Math.max(pct, 5), 95));
    };
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  };

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
          {/* Glassmorphic Reference Card */}
          <div className="pe-before-top-card pe-glass-card">
            <div className="pe-glass-shimmer" />
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
            
            {/* Enhanced Waiting State */}
            <div className="pe-before-panel pe-waiting-state">
              <div className="pe-waiting-particles">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`pe-particle pe-particle-${i + 1}`} />
                ))}
              </div>
              <div className="pe-waiting-icon orange-gradient"><FiCpu size={32} /></div>
              <h4 className="pe-waiting-title">Waiting for Agent Output</h4>
              <p className="pe-waiting-desc">Give your instructions in Prompt Chat to generate the solution.</p>
              <button className="btn-primary pe-btn-premium pe-waiting-cta" onClick={() => setActiveTab('chat')}>
                <FiMessageSquare size={15} /> Go to Prompt Chat &rarr;
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
    <div className={`pe-container ${isTotalFullScreen ? 'pe-total-fullscreen' : ''}`}>
      {/* Header Row 1: Title + Attempt */}
      <div className="pe-header-row-1">
        <div className="pe-header-left">
          <h3 className="pe-heading">Preview</h3>
          <span className="pe-attempt-badge">Attempt {currentTurn}</span>
          {lastGeneratedAt && <span className="pe-last-gen"><FiClock size={11}/> {lastGeneratedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
        </div>
        <div className="pe-header-right">
          <div className="pe-mode-toggle">
            <button className={`pe-mode-btn ${comparisonMode === 'split' ? 'active' : ''}`} onClick={() => setComparisonMode('split')} title="Side-by-Side">
              <FiLayout size={13} /> Split
            </button>
            <button className={`pe-mode-btn ${comparisonMode === 'overlay' ? 'active' : ''}`} onClick={() => setComparisonMode('overlay')} title="Overlay Slider">
              <FiSliders size={13} /> Overlay
            </button>
          </div>
          <button className="pe-icon-btn" onClick={() => setIsTotalFullScreen(!isTotalFullScreen)} title={isTotalFullScreen ? 'Close Dashboard' : 'Dashboard'}>
            {isTotalFullScreen ? <FiX size={15} /> : <FiTrendingUp size={15} />}
          </button>
          <button className="pe-icon-btn" onClick={() => setIsComparisonFullScreen(true)} title="Full Screen">
            <FiMaximize size={15} />
          </button>
          <button className="pe-icon-btn" onClick={() => setActiveTab('chat')} title="Regenerate">
            <FiRefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Quick Stats Ribbon */}
      {hasEval && (
        <QuickStatsRibbon metrics={metrics} />
      )}

      {/* ─── OVERLAY COMPARISON MODE ─── */}
      {comparisonMode === 'overlay' ? (
        <div className="pe-overlay-comparison" ref={overlayRef}>
          {/* Background: Actual output (full width) */}
          <div className="pe-overlay-layer pe-overlay-actual">
            <div className="pe-overlay-browser-bar">
              <div className="pe-dots"><span style={{background:'#ef4444'}}></span><span style={{background:'#f59e0b'}}></span><span style={{background:'#10b981'}}></span></div>
              <div className="pe-browser-url">localhost:3000/preview — Agent Generated</div>
            </div>
            <div className="pe-overlay-iframe-wrap">
              <ScaledPreview html={currentPreview} device="desktop" title="Agent Output" />
            </div>
          </div>

          {/* Foreground: Reference image (clipped) */}
          <div className="pe-overlay-layer pe-overlay-expected" style={{ clipPath: `inset(0 ${100 - overlayPosition}% 0 0)` }}>
            <div className="pe-overlay-browser-bar pe-overlay-expected-bar">
              <div className="pe-dots"><span style={{background:'#ef4444'}}></span><span style={{background:'#f59e0b'}}></span><span style={{background:'#10b981'}}></span></div>
              <div className="pe-browser-url">target-design.png — Reference</div>
            </div>
            <div className="pe-overlay-iframe-wrap">
              {question.referenceImage ? (
                <img src={question.referenceImage} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white' }} />
              ) : (
                <div className="pe-ref-empty">No reference</div>
              )}
            </div>
          </div>

          {/* Slider Handle */}
          <div className="pe-overlay-slider" style={{ left: `${overlayPosition}%` }} onMouseDown={handleOverlayMouseDown}>
            <div className="pe-overlay-slider-line" />
            <div className="pe-overlay-slider-handle">
              <FiSliders size={14} />
            </div>
            <div className="pe-overlay-slider-line" />
          </div>

          {/* Overlay Labels */}
          <div className="pe-overlay-label pe-overlay-label-left">Reference</div>
          <div className="pe-overlay-label pe-overlay-label-right">Generated</div>
        </div>
      ) : (
        /* ─── SPLIT COMPARISON MODE (original) ─── */
        <div className={`pe-comparison-split ${isComparisonFullScreen ? 'fullscreen-mode' : ''}`} ref={containerRef}>
          {isComparisonFullScreen && (
             <button className="pe-close-fullscreen-comparison" onClick={() => setIsComparisonFullScreen(false)}>
                <FiX size={20} /> Close Full Screen
             </button>
          )}
          <div className="pe-panel pe-panel-expected" style={{ width: `calc(${leftWidth}% - 8px)`, transition: isDragging.current ? 'none' : 'width 0.3s ease' }}>
            <div className="pe-panel-header-compact">
              <div className="pe-panel-title-compact">
                <FiImage size={14} className="pe-panel-icon-inline" />
                <span className="pe-panel-label-compact">Expected</span>
                <span className="pe-badge-sm pe-badge-blue">Target</span>
              </div>
            </div>
            <div className="pe-frame-wrapper" style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
               <div className="pe-ref-frame" style={{ width: { desktop: '100%', tablet: '768px', mobile: '375px' }[expectedDevice], margin: '0 auto', transition: 'width 0.3s', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                 <div className="pe-browser-bar">
                   <div className="pe-dots">
                     <span style={{background:'#ef4444'}}></span>
                     <span style={{background:'#f59e0b'}}></span>
                     <span style={{background:'#10b981'}}></span>
                   </div>
                   <div className="pe-browser-url" style={{ marginLeft: '12px' }}>target-design.png</div>
                   <button className="pe-fullscreen-btn" onClick={() => setIsExpectedFullScreen(true)} title="Full Screen" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                     <FiMaximize size={16} />
                   </button>
                 </div>
                 {question.referenceImage ? <img src={question.referenceImage} alt="Reference" className="pe-ref-img" style={{ flex: 1, objectFit: 'contain' }} /> : <div className="pe-ref-empty">No reference</div>}
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
          
          <div className={`pe-panel pe-panel-actual ${isSuccess ? 'pe-panel-success' : 'pe-panel-warning'}`} style={{ width: `calc(${100 - leftWidth}% - 8px)`, transition: isDragging.current ? 'none' : 'width 0.3s ease', position: 'relative' }}>
            <div className="pe-panel-header-compact">
              <div className="pe-panel-title-compact">
                <FiMonitor size={14} className="pe-panel-icon-inline" />
                <span className="pe-panel-label-compact">Actual</span>
                <span className="pe-badge-sm pe-badge-purple">Generated</span>
              </div>
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
               <div className="pe-frame-hover-actions">
                 <button className="btn-outline pe-btn-premium" onClick={() => onOpenFullPreview(currentPreview, actualDevice)}>
                   <FiMaximize size={16} /> Open Full Preview
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {hasEval && isTotalFullScreen && (
        <div className="pe-dashboard-bottom">
           <div className="pe-dashboard-row pe-animate-section">
              <div className="pe-dashboard-col-small">
                 <div className="pe-section-card">
                   <h4 className="pe-subheading pe-center-text" style={{ marginBottom: '24px' }}>OVERALL MATCH</h4>
                   <ScoreCircle score={ev.score} />
                 </div>
              </div>
              <div className="pe-dashboard-col-large">
                 <div className="pe-section-card">
                   <h4 className="pe-subheading" style={{ marginBottom: '24px' }}>EVALUATION METRICS</h4>
                   <div className="pe-metrics-grid" style={{ marginTop: 0 }}>
                     {metrics.map((m, i) => (
                       <div key={m.label} className={`pe-metric-card theme-${m.theme} pe-animate-card`} style={{ animationDelay: `${i * 80}ms` }}>
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
              </div>
           </div>

           {(ev.matchedPoints?.length > 0 || ev.improvementPoints?.length > 0) && (
             <div className="pe-dashboard-row pe-animate-section" style={{ animationDelay: '200ms' }}>
                {ev.matchedPoints?.length > 0 && (
                  <div className="pe-dashboard-col">
                     <div className="pe-section-card pe-success-section" style={{ marginTop: 0 }}>
                       <h4 className="pe-subheading pe-success-heading" style={{ marginBottom: '24px' }}><FiCheckCircle size={18} /> WHAT MATCHED WELL</h4>
                       <div className="pe-feedback-grid">
                         {ev.matchedPoints.map((p, i) => (
                           <div key={i} className="pe-feedback-card pe-feedback-success pe-animate-card" style={{ animationDelay: `${i * 60}ms` }}>
                             <div className="pe-icon-container green-theme"><FiCheckCircle size={22} /></div>
                             <div className="pe-feedback-card-content">
                               <h5 className="pe-feedback-card-title">{p.split(' ').slice(0, 4).join(' ')}</h5>
                               <p className="pe-feedback-card-text">{p}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                  </div>
                )}
                {ev.improvementPoints?.length > 0 && (
                  <div className="pe-dashboard-col">
                     <div className="pe-section-card pe-warning-section" style={{ marginTop: 0 }}>
                       <h4 className="pe-subheading pe-warning-heading" style={{ marginBottom: '24px' }}><FiAlertTriangle size={18} /> WHAT COULD BE IMPROVED</h4>
                       <div className="pe-feedback-grid">
                         {ev.improvementPoints.map((p, i) => (
                           <div key={i} className="pe-feedback-card pe-feedback-warning pe-animate-card" style={{ animationDelay: `${i * 60}ms` }}>
                             <div className="pe-icon-container amber-theme"><FiAlertTriangle size={22} /></div>
                             <div className="pe-feedback-card-content">
                               <h5 className="pe-feedback-card-title">{p.split(' ').slice(0, 4).join(' ')}</h5>
                               <p className="pe-feedback-card-text">{p}</p>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                  </div>
                )}
             </div>
           )}

           <div className="pe-dashboard-row pe-animate-section" style={{ animationDelay: '400ms' }}>
             <div className="pe-dashboard-col">
               <div className="pe-section-card">
                  <h4 className="pe-subheading" style={{ marginBottom: '24px' }}>DIFF HIGHLIGHTS</h4>
                  <div className="pe-diff-legend" style={{ marginBottom: '16px' }}>
                    <span className="pe-legend-item"><span className="pe-legend-dot pe-dot-matched" /> Matched</span>
                    <span className="pe-legend-item"><span className="pe-legend-dot pe-dot-different" /> Different</span>
                    <span className="pe-legend-item"><span className="pe-legend-dot pe-dot-missing" /> Missing</span>
                  </div>
                  <div className="pe-diff-grid">
                    {question.requiredContent && Object.keys(question.requiredContent).map((key, i) => {
                      const status = getContentStatus(key);
                      return (
                        <div key={`rc-${i}`} className={`pe-diff-card pe-diff-${status} pe-animate-card`} style={{ animationDelay: `${i * 50}ms` }}>
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
                        <div key={`req-${i}`} className={`pe-diff-card pe-diff-${status} pe-animate-card`} style={{ animationDelay: `${i * 50}ms` }}>
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
             </div>
           </div>

           <div className="pe-dashboard-row pe-animate-section" style={{ animationDelay: '600ms' }}>
             <div className="pe-dashboard-col">
               <div className="pe-section-card pe-coach-card" style={{ marginTop: 0 }}>
                  <div className="pe-coach-header">
                    <div className="pe-icon-container purple-gradient"><FiTrendingUp size={24} color="white" /></div>
                    <h4>AI Coach Feedback</h4>
                  </div>
                  <div className="pe-coach-content">
                    <TypewriterText text={ev.feedback} />
                    <button className="btn-primary pe-btn-premium pe-coach-btn" onClick={() => setActiveTab('chat')}>
                      <FiMessageSquare size={16} /> Improve with Prompt
                    </button>
                  </div>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* FULL SCREEN MODAL */}
      {isFullScreen && (
        <div className="pe-fullscreen-overlay">
          <div className="pe-fullscreen-modal">
            <div className="pe-fullscreen-header">
              <div className="pe-fullscreen-title">
                <FiMonitor size={18} /> Agent Generated Preview (Full Screen)
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <DeviceToggle device={actualDevice} onDeviceChange={setActualDevice} />
                <button className="pe-fullscreen-close" onClick={() => setIsFullScreen(false)} title="Close">
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="pe-fullscreen-content" style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
              <div style={{ 
                width: { desktop: '100%', tablet: '768px', mobile: '375px' }[actualDevice], 
                height: '100%',
                background: 'white',
                boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                transition: 'width 0.3s ease'
              }}>
                <iframe
                  srcDoc={currentPreview}
                  className="pe-fullscreen-iframe"
                  sandbox="allow-scripts allow-same-origin"
                  title="Full Screen Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPECTED OUTPUT FULL SCREEN MODAL */}
      {isExpectedFullScreen && (
        <div className="pe-fullscreen-overlay">
          <div className="pe-fullscreen-modal">
            <div className="pe-fullscreen-header">
              <div className="pe-fullscreen-title">
                <FiImage size={18} /> Expected Output (Full Screen)
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <DeviceToggle device={expectedDevice} onDeviceChange={setExpectedDevice} />
                <button className="pe-fullscreen-close" onClick={() => setIsExpectedFullScreen(false)} title="Close">
                  <FiX size={20} />
                </button>
              </div>
            </div>
            <div className="pe-fullscreen-content" style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
              <div style={{ 
                width: { desktop: '100%', tablet: '768px', mobile: '375px' }[expectedDevice], 
                height: '100%',
                background: 'white',
                boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {question.referenceImage ? (
                  <img src={question.referenceImage} alt="Reference" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <div className="pe-ref-empty">No reference</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
