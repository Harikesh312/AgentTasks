import './CodeViewer.css';

function highlightSyntax(code, fileName) {
  const ext = fileName.split('.').pop();
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/|\/\/.*$|&lt;!--[\s\S]*?--&gt;)/gm, '<span class="syn-comment">$1</span>');
  // Strings
  highlighted = highlighted.replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="syn-string">$1</span>');
  // HTML tags
  if (ext === 'html') {
    highlighted = highlighted.replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="syn-tag">$2</span>');
    highlighted = highlighted.replace(/([\w-]+)(=)/g, '<span class="syn-attr">$1</span>$2');
  }
  // CSS properties
  if (ext === 'css') {
    highlighted = highlighted.replace(/([\w-]+)(\s*:)/g, '<span class="syn-prop">$1</span>$2');
    highlighted = highlighted.replace(/([.#][\w-]+)/g, '<span class="syn-selector">$1</span>');
  }
  // Keywords
  highlighted = highlighted.replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|from|class|new|this)\b/g, '<span class="syn-keyword">$1</span>');

  return highlighted;
}

export default function CodeViewer({ code, fileName }) {
  const lines = code.split('\n');

  return (
    <div className="code-viewer" id="code-viewer">
      <div className="cv-header">
        <span className="cv-filename">{fileName}</span>
        <span className="cv-lang">{fileName.split('.').pop().toUpperCase()}</span>
      </div>
      <div className="cv-body">
        <div className="line-numbers">
          {lines.map((_, i) => (
            <span key={i} className="line-num">{i + 1}</span>
          ))}
        </div>
        <pre className="code-content">
          <code dangerouslySetInnerHTML={{ __html: highlightSyntax(code, fileName) }} />
        </pre>
      </div>
    </div>
  );
}
