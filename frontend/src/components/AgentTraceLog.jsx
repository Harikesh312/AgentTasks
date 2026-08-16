import { useState, useEffect } from 'react';
import {
  FiEdit3, FiSearch, FiLayout, FiDroplet,
  FiAlertTriangle, FiTool, FiCheckCircle,
  FiActivity, FiClock, FiBarChart2
} from 'react-icons/fi';
import './AgentTraceLog.css';

const iconMap = {
  edit: <FiEdit3 size={16} />,
  search: <FiSearch size={16} />,
  layout: <FiLayout size={16} />,
  palette: <FiDroplet size={16} />,
  warning: <FiAlertTriangle size={16} />,
  wrench: <FiTool size={16} />,
  check: <FiCheckCircle size={16} />,
};

export default function AgentTraceLog({ trace }) {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    if (!trace || trace.length === 0) { setVisibleSteps(0); return; }
    setVisibleSteps(0);
    const interval = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev >= trace.length) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [trace]);

  if (!trace || trace.length === 0) {
    return (
      <div className="agent-trace-empty">
        <div className="trace-empty">
          <FiActivity className="trace-empty-icon" size={40} />
          <p>Agent trace will appear here after sending a prompt</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-trace" id="agent-trace">
      <div className="trace-header">
        <span className="trace-title"><FiSearch size={15} /> Agent Trace</span>
        <span className="trace-status">
          {visibleSteps >= trace.length ? 'Complete' : 'Processing...'}
        </span>
      </div>
      <div className="trace-timeline">
        {trace.map((step, i) => (
          <div
            key={i}
            className={`trace-step ${i < visibleSteps ? 'visible' : ''} ${step.status}`}
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <div className="trace-line" />
            <div className="trace-dot">
              {i < visibleSteps ? (iconMap[step.icon] || <FiCheckCircle size={16} />) : <FiClock size={16} />}
            </div>
            <div className="trace-content">
              <span className="trace-text">{step.step}</span>
              {step.status === 'warning' && (
                <span className="trace-warning-badge">Warning</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
