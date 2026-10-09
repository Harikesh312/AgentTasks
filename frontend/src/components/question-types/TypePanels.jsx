import { FiImage, FiCode, FiActivity, FiTarget, FiSearch, FiLayers, FiAlertTriangle } from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeSnippet({ filename, code }) {
  return (
    <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', fontSize: '12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
        {filename}
      </div>
      <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '16px', fontSize: '13px' }}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function UIGenerationPanel({ question }) {
  return (
    <div className="qd-section">
      <h3 className="qd-section-title"><FiImage size={18} /> Target Design</h3>
      {question.referenceImage ? (
        <div className="qd-ref-image-container" style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={question.referenceImage} alt="Reference Design" style={{ width: '100%', display: 'block', objectFit: 'contain' }} />
        </div>
      ) : (
        <div className="qd-ref-image" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
          <FiImage size={36} style={{ marginBottom: '12px' }} />
          <span>No Reference Design</span>
        </div>
      )}
    </div>
  );
}

export function DebuggingPanel({ question }) {
  return (
    <div className="qd-section">
      <h3 className="qd-section-title"><FiCode size={18} /> Buggy Code</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        The expected behavior is: <strong>{question.expectedBehavior}</strong>. There are {question.bugCount} bugs hidden below.
      </p>
      {question.buggyCode && Object.entries(question.buggyCode).map(([filename, code]) => (
        <CodeSnippet key={filename} filename={filename} code={code} />
      ))}
    </div>
  );
}

export function TestingPanel({ question }) {
  return (
    <div className="qd-section">
      <h3 className="qd-section-title"><FiActivity size={18} /> Function to Test</h3>
      <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '14px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Specification</h4>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{question.functionSpec}</pre>
      </div>
      <CodeSnippet filename="implementation.js" code={question.functionCode} />
    </div>
  );
}

export function OptimizationPanel({ question }) {
  return (
    <div className="qd-section">
      <h3 className="qd-section-title"><FiTarget size={18} /> Target Performance</h3>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '4px' }}>Original Complexity</div>
          <div style={{ fontWeight: 500 }}>{question.originalComplexity}</div>
        </div>
        <div style={{ flex: 1, padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '4px' }}>Target Complexity</div>
          <div style={{ fontWeight: 500 }}>{question.performanceTarget}</div>
        </div>
      </div>
      <h3 className="qd-section-title" style={{ marginTop: '24px' }}><FiCode size={18} /> Slow Code</h3>
      {question.slowCode && Object.entries(question.slowCode).map(([filename, code]) => (
        <CodeSnippet key={filename} filename={filename} code={code} />
      ))}
    </div>
  );
}

export function CodeReviewPanel({ question }) {
  return (
    <div className="qd-section">
      <h3 className="qd-section-title"><FiSearch size={18} /> Code to Review</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Review this code for security, performance, accessibility, and quality issues.
      </p>
      {question.reviewCode && Object.entries(question.reviewCode).map(([filename, code]) => (
        <CodeSnippet key={filename} filename={filename} code={code} />
      ))}
    </div>
  );
}

export function SystemScalingPanel({ question }) {
  return (
    <div className="qd-section">
      <h3 className="qd-section-title"><FiLayers size={18} /> Scaling Scenario</h3>
      <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '14px' }}>
        {question.scalingScenario}
      </div>
      <h3 className="qd-section-title" style={{ marginTop: '24px' }}><FiCode size={18} /> Prototype Code</h3>
      {question.prototypeCode && Object.entries(question.prototypeCode).map(([filename, code]) => (
        <CodeSnippet key={filename} filename={filename} code={code} />
      ))}
    </div>
  );
}

export function renderTypePanel(question) {
  switch (question.type) {
    case 'debugging': return <DebuggingPanel question={question} />;
    case 'testing': return <TestingPanel question={question} />;
    case 'optimization': return <OptimizationPanel question={question} />;
    case 'code-review': return <CodeReviewPanel question={question} />;
    case 'system-scaling': return <SystemScalingPanel question={question} />;
    case 'ui-generation':
    default:
      return <UIGenerationPanel question={question} />;
  }
}
