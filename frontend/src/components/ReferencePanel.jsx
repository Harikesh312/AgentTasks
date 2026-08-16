import { FiImage, FiClipboard, FiSettings, FiCheck } from 'react-icons/fi';
import './ReferencePanel.css';

export default function ReferencePanel({ question }) {
  return (
    <div className="reference-panel" id="reference-panel">
      <div className="ref-section">
        <h3 className="ref-heading"><FiImage size={15} /> Target Design</h3>
        <div className="ref-image-placeholder">
          <div className="placeholder-inner">
            <FiImage className="placeholder-icon" size={40} />
            <span className="placeholder-text">Reference Design Preview</span>
            <span className="placeholder-sub">{question.title}</span>
          </div>
        </div>
      </div>
      <div className="ref-section">
        <h3 className="ref-heading"><FiClipboard size={15} /> Requirements</h3>
        <ul className="ref-list">
          {question.requirements.map((req, i) => (
            <li key={i} className="ref-list-item">
              <FiCheck className="ref-check" size={14} />
              {req}
            </li>
          ))}
        </ul>
      </div>
      <div className="ref-section">
        <h3 className="ref-heading"><FiSettings size={15} /> Constraints</h3>
        <ul className="ref-list constraints-list">
          {question.constraints.map((c, i) => (
            <li key={i} className="ref-list-item constraint">
              <span className="ref-dot">•</span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
