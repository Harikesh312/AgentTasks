import { useState, useRef, useEffect } from 'react';
import { FiMonitor, FiSmartphone, FiZap, FiRefreshCw } from 'react-icons/fi';
import './PreviewPane.css';

export default function PreviewPane({ previewHtml }) {
  const [device, setDevice] = useState('desktop');
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(previewHtml);
      doc.close();
    }
  }, [previewHtml]);

  const handleRefresh = () => {
    if (iframeRef.current && previewHtml) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(previewHtml);
      doc.close();
    }
  };

  return (
    <div className="preview-pane" id="preview-pane">
      <div className="pp-header">
        <span className="pp-title"><FiMonitor size={15} /> Preview</span>
        <div className="pp-controls">
          {previewHtml && (
            <button className="pp-refresh-btn" onClick={handleRefresh} title="Refresh preview">
              <FiRefreshCw size={14} />
            </button>
          )}
          <div className="device-toggle">
            <button
              className={`device-btn ${device === 'desktop' ? 'active' : ''}`}
              onClick={() => setDevice('desktop')}
              title="Desktop"
            >
              <FiMonitor size={16} />
            </button>
            <button
              className={`device-btn ${device === 'mobile' ? 'active' : ''}`}
              onClick={() => setDevice('mobile')}
              title="Mobile"
            >
              <FiSmartphone size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className={`browser-chrome ${device}`}>
        <div className="browser-toolbar">
          <div className="browser-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="browser-url">
            <span>localhost:3000</span>
          </div>
          <div className="browser-actions" />
        </div>
        <div className="browser-viewport">
          {previewHtml ? (
            <iframe
              ref={iframeRef}
              className="preview-iframe"
              sandbox="allow-scripts allow-same-origin"
              title="Agent Preview"
            />
          ) : (
            <div className="preview-empty">
              <FiZap className="preview-empty-icon" size={40} />
              <p>Preview will appear here after the agent generates output</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
