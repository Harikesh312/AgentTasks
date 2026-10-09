import React from 'react';
import { FiCheckCircle, FiXCircle, FiPlayCircle, FiShield, FiAlertOctagon } from 'react-icons/fi';

export default function TestResultsPanel({ typeData, questionType }) {
  if (!typeData) {
    return (
      <div className="qd-preview-empty">
        <FiPlayCircle size={48} />
        <p>Run the AI agent to see execution results.</p>
      </div>
    );
  }

  if (questionType === 'debugging') {
    return (
      <div className="qd-preview-container" style={{ padding: '24px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <FiShield size={24} style={{ color: 'var(--success)', marginRight: '12px' }} />
            <h2 style={{ margin: 0 }}>Bug Fix Report</h2>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <strong>Test Results:</strong> {typeData.testResults}
          </div>

          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Bugs Found & Fixed ({typeData.bugsFound?.length || 0})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(typeData.bugsFound || []).map((bug, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>{bug.location}</span>
                  <span className={`badge badge-${bug.severity?.toLowerCase() || 'medium'}`}>{bug.severity || 'Medium'}</span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>{bug.description}</p>
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', fontSize: '14px' }}>
                  <strong>Fix applied:</strong> {bug.fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (questionType === 'testing') {
    return (
      <div className="qd-preview-container" style={{ padding: '24px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <FiCheckCircle size={24} style={{ color: 'var(--success)', marginRight: '12px' }} />
            <h2 style={{ margin: 0 }}>Test Suite Analysis</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)' }}>{typeData.testCount || 0}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Tests Generated</div>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Coverage Areas:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                {(typeData.coverageAreas || []).map((area, i) => (
                  <li key={i}>{area}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questionType === 'code-review') {
    return (
      <div className="qd-preview-container" style={{ padding: '24px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <FiAlertOctagon size={24} style={{ color: 'var(--warning)', marginRight: '12px' }} />
            <h2 style={{ margin: 0 }}>Code Review Findings</h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div className="badge badge-hard">Critical: {typeData.summary?.critical || 0}</div>
            <div className="badge badge-medium">Major: {typeData.summary?.major || 0}</div>
            <div className="badge badge-easy">Minor: {typeData.summary?.minor || 0}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(typeData.issues || []).map((issue, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: `4px solid ${issue.severity === 'critical' ? '#ef4444' : issue.severity === 'major' ? '#f59e0b' : '#3b82f6'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{issue.title}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="category-tag">{issue.category}</span>
                    <span className={`badge badge-${issue.severity === 'critical' ? 'hard' : issue.severity === 'major' ? 'medium' : 'easy'}`}>{issue.severity}</span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontFamily: 'monospace' }}>
                  {issue.location}
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>{issue.description}</p>
                <div style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px dashed var(--border)', borderRadius: '6px', fontSize: '14px' }}>
                  <strong>Suggestion:</strong> {issue.suggestion}
                </div>
                {issue.codeExample && (
                  <pre style={{ margin: '12px 0 0 0', padding: '12px', background: '#1e1e1e', color: '#d4d4d4', borderRadius: '6px', fontSize: '13px', overflowX: 'auto' }}>
                    {issue.codeExample}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
