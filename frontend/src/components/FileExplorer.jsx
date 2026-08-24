import { useState, useRef, useEffect } from 'react';
import { FiFolder, FiFile, FiDownload, FiCode, FiFileText, FiHash, FiTerminal, FiEye, FiCheckCircle, FiMessageSquare, FiArrowRight, FiArrowLeft, FiArrowDown } from 'react-icons/fi';
import CodeViewer from './CodeViewer';
import ScaledPreview from './ScaledPreview';
import './FileExplorer.css';

const fileIcons = {
  html: <FiCode size={18} color="#e44d26" />,
  css: <FiHash size={18} color="#264de4" />,
  js: <FiTerminal size={18} color="#f7df1e" />,
  json: <FiFileText size={18} color="#000000" />,
  default: <FiFile size={18} color="#64748b" />,
};

const getFileType = (ext) => {
  const types = { html: 'HTML Document', css: 'Stylesheet', js: 'JavaScript', json: 'JSON Data' };
  return types[ext] || 'File';
};

const formatSize = (content) => {
  const bytes = new Blob([content]).size;
  if (bytes < 1024) return bytes + ' B';
  return (bytes / 1024).toFixed(1) + ' KB';
};

export default function FileExplorer({ files, onDownload, onGoToChat, onOpenPreview, previewHtml, onOpenFullPreview }) {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!files || Object.keys(files).length === 0) {
    return (
      <div className="fe-container" id="file-explorer-empty">
        <div className="fe-header-section">
          <div className="fe-header-titles">
            <h3 className="fe-heading">Files</h3>
            <p className="fe-subtitle">Reference assets and generated files</p>
          </div>
        </div>
        
        <div className="fe-empty-state-compact">
          <div className="fe-empty-icon-wrapper-small">
            <FiFolder size={32} />
          </div>
          <div className="fe-empty-text-compact">
            <h3 className="fe-empty-title-compact">No files generated yet</h3>
            <p className="fe-empty-desc-compact">Send a prompt in the chat to generate the files.</p>
          </div>
          <button className="btn-primary" onClick={onGoToChat}>
            Go to Prompt Chat <FiArrowRight size={16} style={{marginLeft: '4px'}} />
          </button>
        </div>

        <div className="fe-files-preview-section">
          <h4 className="fe-files-preview-title">Files you'll receive</h4>
          <div className="fe-placeholder-timeline">
            {/* HTML */}
            <div className="fe-timeline-step fe-card-html">
              <div className="fe-placeholder-card">
                <div className="fe-placeholder-icon">
                  <FiCode size={24} color="#e44d26" />
                </div>
                <div className="fe-placeholder-info">
                  <span className="fe-placeholder-name">index.html</span>
                  <span className="fe-placeholder-desc">Structure & markup</span>
                </div>
              </div>
            </div>
            
            <div className="fe-timeline-arrow"><FiArrowRight size={16} color="#94a3b8" /></div>
            
            {/* CSS */}
            <div className="fe-timeline-step fe-card-css">
              <div className="fe-placeholder-card">
                <div className="fe-placeholder-icon">
                  <FiHash size={24} color="#3b82f6" />
                </div>
                <div className="fe-placeholder-info">
                  <span className="fe-placeholder-name">styles.css</span>
                  <span className="fe-placeholder-desc">Styling & responsive</span>
                </div>
              </div>
            </div>

            <div className="fe-timeline-arrow"><FiArrowRight size={16} color="#94a3b8" /></div>

            {/* JS */}
            <div className="fe-timeline-step fe-card-js">
              <div className="fe-placeholder-card">
                <div className="fe-placeholder-icon">
                  <FiTerminal size={24} color="#f59e0b" />
                </div>
                <div className="fe-placeholder-info">
                  <span className="fe-placeholder-name">script.js</span>
                  <span className="fe-placeholder-desc">Interactions & behavior</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fileNames = Object.keys(files);
  const ext = (name) => name.split('.').pop();

  return (
    <div className="fe-container" id="file-explorer">
      <div className="fe-header-section">
        <div className="fe-header-titles">
          <h3 className="fe-heading">Files</h3>
          <p className="fe-subtitle">Reference assets and generated files</p>
        </div>
        <button className="btn-primary pe-btn-premium" onClick={onDownload} id="download-btn">
          <FiDownload size={16} /> Download All
        </button>
      </div>
      
      {!selectedFile ? (
        <div className="fe-overview-state">
          <div className="fe-timeline">
            {['index.html', 'styles.css', 'script.js'].map((name, i) => {
              if (!files[name]) return null;
              const extension = ext(name);
              return (
                <div className="fe-timeline-step" key={name}>
                  {i > 0 && <div className="fe-timeline-arrow"><FiArrowRight size={16} color="#94a3b8" /></div>}
                  <button className="fe-timeline-card" onClick={() => setSelectedFile(name)}>
                    <div className="fe-timeline-icon">
                      {fileIcons[extension] || fileIcons.default}
                    </div>
                    <div className="fe-timeline-info">
                      <span className="fe-timeline-name">{name}</span>
                      <span className="fe-timeline-meta">{formatSize(files[name])}</span>
                    </div>
                    <div className="fe-timeline-action">
                      <FiEye size={14} /> View
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
          
          {previewHtml && (
            <div className="fe-generated-card-compact">
              <div className="fe-generated-header">
                <FiCheckCircle size={20} color="#10b981" />
                <h4>Output Generated Successfully</h4>
              </div>
              <div className="fe-generated-preview-compact">
                <ScaledPreview html={previewHtml} />
              </div>
              <div className="fe-generated-footer" style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary pe-btn-premium" onClick={onOpenPreview}>
                  <FiEye size={16} style={{marginRight: '8px'}} /> Open Split Preview
                </button>
                <button className="btn-outline pe-btn-premium" style={{ color: '#0f172a', borderColor: '#cbd5e1' }} onClick={() => onOpenFullPreview(previewHtml, 'desktop')}>
                  Open Full Preview
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="fe-code-view-state">
          <div className="fe-code-view-header">
            <button className="fe-back-btn" onClick={() => setSelectedFile(null)}>
              <FiArrowLeft size={16} /> Back to Overview
            </button>
            <div className="fe-code-file-info">
              {fileIcons[ext(selectedFile)]}
              <span>{selectedFile}</span>
            </div>
          </div>
          <div className="fe-code-wrapper">
            <CodeViewer code={files[selectedFile]} fileName={selectedFile} />
          </div>
        </div>
      )}
    </div>
  );
}
