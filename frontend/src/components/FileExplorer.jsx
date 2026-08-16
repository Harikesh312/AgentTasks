import { useState } from 'react';
import { FiFolder, FiFile, FiDownload, FiCode, FiFileText, FiHash, FiTerminal } from 'react-icons/fi';
import CodeViewer from './CodeViewer';
import './FileExplorer.css';

const fileIcons = {
  html: <FiCode size={14} color="#e44d26" />,
  css: <FiHash size={14} color="#264de4" />,
  js: <FiTerminal size={14} color="#f7df1e" />,
  json: <FiFileText size={14} />,
  default: <FiFile size={14} />,
};

export default function FileExplorer({ files, onDownload }) {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!files || Object.keys(files).length === 0) {
    return (
      <div className="file-explorer-empty">
        <div className="files-empty">
          <FiFolder className="files-empty-icon" size={40} />
          <p>No files generated yet</p>
          <p className="files-empty-hint">Send a prompt to the agent to generate files</p>
        </div>
      </div>
    );
  }

  const fileNames = Object.keys(files);
  const ext = (name) => name.split('.').pop();

  return (
    <div className="file-explorer" id="file-explorer">
      <div className="fe-header">
        <span className="fe-title"><FiFolder size={15} /> Generated Files</span>
        <button className="btn-primary btn-sm" onClick={onDownload} id="download-btn">
          <FiDownload size={14} /> Download All
        </button>
      </div>
      <div className="fe-body">
        <div className="file-list">
          {fileNames.map((name, i) => (
            <button
              key={name}
              className={`file-item ${selectedFile === name ? 'active' : ''}`}
              onClick={() => setSelectedFile(name)}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="file-icon">{fileIcons[ext(name)] || fileIcons.default}</span>
              <span className="file-name">{name}</span>
            </button>
          ))}
        </div>
        <div className="code-area">
          {selectedFile ? (
            <CodeViewer code={files[selectedFile]} fileName={selectedFile} />
          ) : (
            <div className="code-placeholder">
              <FiCode size={24} />
              <p>Select a file to view its code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
