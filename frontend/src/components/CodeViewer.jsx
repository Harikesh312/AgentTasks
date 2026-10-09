import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiSun, FiMoon } from 'react-icons/fi';
import './CodeViewer.css';

export default function CodeViewer({ code, fileName }) {
  const [isDark, setIsDark] = useState(true);
  
  const ext = fileName ? fileName.split('.').pop() : '';
  let lang = ext;
  if (ext === 'js' || ext === 'jsx') lang = 'javascript';
  else if (ext === 'html') lang = 'markup'; // prism uses markup for HTML

  return (
    <div className="code-viewer" id="code-viewer" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: isDark ? '#1e1e1e' : '#ffffff' }}>
      <div className="cv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: isDark ? '#2d2d2d' : '#f3f4f6', borderBottom: isDark ? '1px solid #404040' : '1px solid #e5e7eb', color: isDark ? '#d4d4d4' : '#374151' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="cv-filename" style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'monospace' }}>{fileName}</span>
        </div>
        <button 
          onClick={() => setIsDark(!isDark)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: isDark ? '#d4d4d4' : '#374151', fontSize: '12px', fontWeight: 500 }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
        </button>
      </div>
      <div className="cv-body" style={{ flex: 1, overflow: 'auto', margin: 0 }}>
        <SyntaxHighlighter 
          language={lang} 
          style={isDark ? vscDarkPlus : vs}
          showLineNumbers={true}
          customStyle={{ margin: 0, padding: '16px', height: '100%', boxSizing: 'border-box', background: isDark ? '#1e1e1e' : '#ffffff', fontSize: '13px' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
