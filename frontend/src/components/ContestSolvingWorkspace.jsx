import { useState, useEffect, useRef } from 'react';
import {
  FiArrowLeft,
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiAlertCircle,
  FiRotateCcw,
  FiCopy,
  FiCheck,
  FiTerminal,
  FiList,
  FiCode,
  FiAward,
} from 'react-icons/fi';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import './ContestSolvingWorkspace.css';

export default function ContestSolvingWorkspace({ contest: initialContest, onExit }) {
  const { memoryToken } = useAuth();
  const [contest, setContest] = useState(initialContest);
  const [problems, setProblems] = useState([]);
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);

  // User code storage: { [problemId]: { javascript: '...', python: '...' } }
  const [userCodes, setUserCodes] = useState({});

  // Countdown timer state
  const [remainingSec, setRemainingSec] = useState(() => {
    return Math.floor((initialContest?.remainingMs || 90 * 60 * 1000) / 1000);
  });

  // Console panel state
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // 'testcases' | 'output' | 'submissions'
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [customInputText, setCustomInputText] = useState('');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runOutput, setRunOutput] = useState(null);
  const [submitOutput, setSubmitOutput] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Toast notification
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync line numbers
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Fetch full contest details and problems
  useEffect(() => {
    const fetchContestData = async () => {
      try {
        const headers = {};
        if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

        const res = await fetch(`${API_URL}/api/contests/${initialContest.id}`, {
          headers,
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setContest(data);
          setProblems(data.problems || []);

          if (data.remainingMs != null) {
            setRemainingSec(Math.max(0, Math.floor(data.remainingMs / 1000)));
          }

          if (Array.isArray(data.userSubmissions)) {
            setSubmissions(data.userSubmissions);
          }

          // Initialize starter codes
          const initialCodes = {};
          (data.problems || []).forEach((p) => {
            initialCodes[p.id] = {
              javascript: p.starterCode?.javascript || '// Write your solution here\n',
              python: p.starterCode?.python || '# Write your solution here\n',
            };
          });
          setUserCodes(initialCodes);
        }
      } catch (err) {
        console.error('Failed to load contest details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContestData();
  }, [initialContest.id, memoryToken]);

  // Countdown tick
  useEffect(() => {
    if (remainingSec <= 0) return;
    const interval = setInterval(() => {
      setRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSec]);

  const currentProblem = problems[currentProblemIdx] || null;
  const currentCode =
    (currentProblem && userCodes[currentProblem.id]?.[language]) || '';

  // Synchronize textarea scroll with line numbers
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Handle Tab key inside textarea
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = currentCode.substring(0, start) + '  ' + currentCode.substring(end);

      setUserCodes((prev) => ({
        ...prev,
        [currentProblem.id]: {
          ...prev[currentProblem.id],
          [language]: newCode,
        },
      }));

      // Set cursor position after inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setUserCodes((prev) => ({
      ...prev,
      [currentProblem.id]: {
        ...prev[currentProblem.id],
        [language]: val,
      },
    }));
  };

  const handleResetCode = () => {
    if (!currentProblem) return;
    const starter = currentProblem.starterCode?.[language] || '';
    setUserCodes((prev) => ({
      ...prev,
      [currentProblem.id]: {
        ...prev[currentProblem.id],
        [language]: starter,
      },
    }));
    showToast('Code reset to default starter template');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Run Code
  const handleRunCode = async () => {
    if (!currentProblem || isRunning) return;
    setIsRunning(true);
    setRunOutput(null);
    setActiveConsoleTab('output');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const body = {
        problemId: currentProblem.id,
        language,
        code: currentCode,
      };

      if (useCustomInput) {
        body.customInput = customInputText;
      }

      const res = await fetch(`${API_URL}/api/contests/${contest.id}/run`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const result = await res.json();
      setRunOutput(result);

      if (result.verdict === 'Accepted' || result.status === 'success') {
        showToast('Sample test cases passed!');
      } else {
        showToast(`Run failed: ${result.verdict || 'Check output'}`);
      }
    } catch (err) {
      console.error('Run code error:', err);
      setRunOutput({
        status: 'error',
        verdict: 'Runtime Error',
        stderr: err.message,
      });
      showToast('Code execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code
  const handleSubmitCode = async () => {
    if (!currentProblem || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitOutput(null);
    setActiveConsoleTab('output');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

      const res = await fetch(`${API_URL}/api/contests/${contest.id}/submit`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          problemId: currentProblem.id,
          language,
          code: currentCode,
        }),
      });

      const result = await res.json();
      setSubmitOutput(result);

      if (result.verdict === 'Accepted') {
        showToast(`🎉 Accepted! +${result.points || currentProblem.points} Points`);

        // Update problem status in local state
        setProblems((prev) =>
          prev.map((p, idx) =>
            idx === currentProblemIdx ? { ...p, status: 'solved' } : p
          )
        );
      } else {
        showToast(`Verdict: ${result.verdict} (${result.passedCount}/${result.totalCount} passed)`);
        setProblems((prev) =>
          prev.map((p, idx) =>
            idx === currentProblemIdx && p.status !== 'solved'
              ? { ...p, status: 'attempted' }
              : p
          )
        );
      }

      // Add to local submissions history
      setSubmissions((prev) => [
        {
          id: result.submissionId || Date.now(),
          problemId: currentProblem.id,
          language,
          verdict: result.verdict,
          passedCount: result.passedCount,
          totalCount: result.totalCount,
          executionTimeMs: result.executionTimeMs,
          points: result.points,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitOutput({
        verdict: 'Runtime Error',
        stderr: err.message,
      });
      showToast('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate total score and solved count
  const solvedCount = problems.filter((p) => p.status === 'solved').length;
  const totalScore = problems
    .filter((p) => p.status === 'solved')
    .reduce((sum, p) => sum + (p.points || 0), 0);

  const hours = Math.floor(remainingSec / 3600);
  const minutes = Math.floor((remainingSec % 3600) / 60);
  const seconds = remainingSec % 60;
  const timerDisplay = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const lineCount = Math.max(currentCode.split('\n').length, 25);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="csw-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading contest workspace...</p>
      </div>
    );
  }

  return (
    <div className="csw-container" id="contest-solving-workspace">
      {/* ── Top Header ── */}
      <header className="csw-header">
        <div className="csw-header-left">
          <button className="csw-btn-back" onClick={onExit} title="Return to Contest Overview">
            <FiArrowLeft size={16} /> Exit Contest
          </button>
          <div className="csw-contest-title-wrap">
            <h1 className="csw-contest-name">{contest.name}</h1>
            <span className="csw-live-pill">
              <span className="csw-live-dot" /> LIVE NOW
            </span>
          </div>
        </div>

        <div className="csw-header-center">
          <div className="csw-timer-box" title="Remaining Contest Time">
            <FiClock size={16} className="csw-timer-icon" />
            <span>{timerDisplay}</span>
          </div>
        </div>

        <div className="csw-header-right">
          <div className="csw-score-stat">
            Solved: <strong>{solvedCount} / {problems.length}</strong>
          </div>
          <div className="csw-score-stat">
            Score: <strong>{totalScore} pts</strong>
          </div>
        </div>
      </header>

      {/* ── Problem Navigation Tabs ── */}
      <nav className="csw-problems-nav">
        {problems.map((p, idx) => {
          const isCurrent = idx === currentProblemIdx;
          const diffClass =
            p.difficulty === 'Easy'
              ? 'csw-diff-easy'
              : p.difficulty === 'Hard'
              ? 'csw-diff-hard'
              : 'csw-diff-medium';

          return (
            <button
              key={p.id}
              className={`csw-prob-tab ${isCurrent ? 'active' : ''}`}
              onClick={() => {
                setCurrentProblemIdx(idx);
                setRunOutput(null);
                setSubmitOutput(null);
              }}
            >
              {p.status === 'solved' ? (
                <FiCheckCircle size={15} className="csw-status-icon-solved" title="Solved" />
              ) : p.status === 'attempted' ? (
                <FiClock size={15} className="csw-status-icon-attempted" title="Attempted" />
              ) : (
                <span className="csw-status-icon-unsolved">•</span>
              )}
              <span>P{idx + 1}. {p.title}</span>
              <span className={`csw-prob-diff-pill ${diffClass}`}>{p.difficulty}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Main Two-Column Workspace ── */}
      {currentProblem && (
        <main className="csw-main">
          {/* Left Panel: Problem Statement */}
          <section className="csw-left-panel">
            <div className="csw-problem-header">
              <div className="csw-problem-title-row">
                <h2 className="csw-problem-title">
                  {currentProblemIdx + 1}. {currentProblem.title}
                </h2>
                <div className="csw-problem-badges">
                  <span className={`csw-prob-diff-pill csw-diff-${currentProblem.difficulty.toLowerCase()}`}>
                    {currentProblem.difficulty}
                  </span>
                  <span className="csw-points-badge">
                    {currentProblem.points} Points
                  </span>
                  <span className={`csw-status-badge ${currentProblem.status}`}>
                    {currentProblem.status === 'solved'
                      ? '✓ Solved'
                      : currentProblem.status === 'attempted'
                      ? '⏳ Attempted'
                      : 'Unsolved'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="csw-section-title">Description</h3>
              <p className="csw-description-text">{currentProblem.description}</p>
            </div>

            {/* Constraints */}
            {Array.isArray(currentProblem.constraints) && currentProblem.constraints.length > 0 && (
              <div>
                <h3 className="csw-section-title">Constraints</h3>
                <ul className="csw-constraints-list">
                  {currentProblem.constraints.map((c, i) => (
                    <li key={i}><code>{c}</code></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            {Array.isArray(currentProblem.examples) && currentProblem.examples.length > 0 && (
              <div>
                <h3 className="csw-section-title">Examples</h3>
                {currentProblem.examples.map((ex, i) => (
                  <div className="csw-example-card" key={i}>
                    <div className="csw-example-header">Example {i + 1}</div>
                    <div className="csw-example-field">
                      <span className="csw-example-label">Input:</span>
                      <code className="csw-example-code">{ex.input}</code>
                    </div>
                    <div className="csw-example-field">
                      <span className="csw-example-label">Output:</span>
                      <code className="csw-example-code">{ex.output}</code>
                    </div>
                    {ex.explanation && (
                      <div className="csw-example-field">
                        <span className="csw-example-label">Explanation:</span>
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{ex.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right Panel: Code Editor & Execution Console */}
          <section className="csw-right-panel">
            {/* Editor Toolbar */}
            <div className="csw-editor-toolbar">
              <select
                className="csw-lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
              </select>

              <div className="csw-editor-actions">
                <button
                  className="csw-btn-tool"
                  onClick={handleResetCode}
                  title="Reset to starter template"
                >
                  <FiRotateCcw size={13} /> Reset
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="csw-editor-box">
              <div className="csw-line-numbers" ref={lineNumbersRef}>
                {lineNumbers.map((num) => (
                  <div key={num}>{num}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                className="csw-code-textarea"
                value={currentCode}
                onChange={handleCodeChange}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                placeholder="// Write your solution here..."
              />
            </div>

            {/* Bottom Console Panel */}
            <div className="csw-console-box">
              <div className="csw-console-header">
                <button
                  className={`csw-console-tab ${activeConsoleTab === 'testcases' ? 'active' : ''}`}
                  onClick={() => setActiveConsoleTab('testcases')}
                >
                  <FiList size={14} style={{ marginRight: 6 }} /> Test Cases
                </button>
                <button
                  className={`csw-console-tab ${activeConsoleTab === 'output' ? 'active' : ''}`}
                  onClick={() => setActiveConsoleTab('output')}
                >
                  <FiTerminal size={14} style={{ marginRight: 6 }} /> Console Output
                </button>
                <button
                  className={`csw-console-tab ${activeConsoleTab === 'submissions' ? 'active' : ''}`}
                  onClick={() => setActiveConsoleTab('submissions')}
                >
                  <FiAward size={14} style={{ marginRight: 6 }} /> Submissions ({submissions.filter((s) => s.problemId === currentProblem.id).length})
                </button>
              </div>

              <div className="csw-console-body">
                {/* 1. Test Cases View */}
                {activeConsoleTab === 'testcases' && (
                  <div className="csw-testcases-view">
                    <div className="csw-tc-selectors">
                      {(currentProblem.sampleTestCases || []).map((_, i) => (
                        <button
                          key={i}
                          className={`csw-tc-btn ${!useCustomInput && activeTestCaseIdx === i ? 'active' : ''}`}
                          onClick={() => {
                            setUseCustomInput(false);
                            setActiveTestCaseIdx(i);
                          }}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                      <button
                        className={`csw-tc-btn ${useCustomInput ? 'active' : ''}`}
                        onClick={() => setUseCustomInput(true)}
                      >
                        + Custom Input
                      </button>
                    </div>

                    {useCustomInput ? (
                      <div className="csw-tc-detail-row">
                        <div className="csw-tc-detail-label">Custom Stdin Input:</div>
                        <textarea
                          className="csw-custom-input-box"
                          value={customInputText}
                          onChange={(e) => setCustomInputText(e.target.value)}
                          placeholder="Enter your custom input..."
                        />
                      </div>
                    ) : (
                      currentProblem.sampleTestCases && currentProblem.sampleTestCases[activeTestCaseIdx] && (
                        <div>
                          <div className="csw-tc-detail-row">
                            <div className="csw-tc-detail-label">Input:</div>
                            <div className="csw-tc-detail-content">
                              {currentProblem.sampleTestCases[activeTestCaseIdx].input}
                            </div>
                          </div>
                          <div className="csw-tc-detail-row">
                            <div className="csw-tc-detail-label">Expected Output:</div>
                            <div className="csw-tc-detail-content">
                              {currentProblem.sampleTestCases[activeTestCaseIdx].expectedOutput}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* 2. Output View */}
                {activeConsoleTab === 'output' && (
                  <div className="csw-output-view">
                    {submitOutput ? (
                      <div>
                        <div
                          className={`csw-verdict-banner ${
                            submitOutput.verdict === 'Accepted'
                              ? 'accepted'
                              : submitOutput.verdict === 'Time Limit Exceeded'
                              ? 'timeout'
                              : 'wrong'
                          }`}
                        >
                          {submitOutput.verdict === 'Accepted' ? (
                            <FiCheckCircle size={18} />
                          ) : (
                            <FiAlertCircle size={18} />
                          )}
                          <span>
                            {submitOutput.verdict} — {submitOutput.passedCount} / {submitOutput.totalCount} Test Cases Passed
                          </span>
                        </div>
                        {submitOutput.failedDetails && (
                          <div className="csw-output-section" style={{ marginTop: 12 }}>
                            <div className="csw-output-label">
                              Failed on Test Case #{submitOutput.failedDetails.testCaseNumber}:
                            </div>
                            <div className="csw-tc-detail-content">
                              <div><strong>Input:</strong> {submitOutput.failedDetails.input}</div>
                              <div><strong>Expected:</strong> {submitOutput.failedDetails.expectedOutput}</div>
                              <div><strong>Actual:</strong> {submitOutput.failedDetails.actualOutput}</div>
                            </div>
                          </div>
                        )}
                        <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#a1a1aa' }}>
                          Execution time: {submitOutput.executionTimeMs}ms
                        </div>
                      </div>
                    ) : runOutput ? (
                      <div>
                        <div
                          className={`csw-verdict-banner ${
                            runOutput.verdict === 'Accepted' || runOutput.status === 'success'
                              ? 'accepted'
                              : 'wrong'
                          }`}
                        >
                          {runOutput.verdict === 'Accepted' || runOutput.status === 'success' ? (
                            <FiCheckCircle size={18} />
                          ) : (
                            <FiAlertCircle size={18} />
                          )}
                          <span>
                            {runOutput.verdict} {runOutput.totalTestCases ? `(${runOutput.passedTestCases}/${runOutput.totalTestCases} passed)` : ''}
                          </span>
                        </div>

                        {runOutput.stdout && (
                          <div className="csw-output-section" style={{ marginTop: 10 }}>
                            <div className="csw-output-label">Stdout:</div>
                            <div className="csw-output-code">{runOutput.stdout}</div>
                          </div>
                        )}

                        {runOutput.stderr && (
                          <div className="csw-output-section" style={{ marginTop: 10 }}>
                            <div className="csw-output-label">Stderr / Errors:</div>
                            <div className="csw-output-code csw-error-code">{runOutput.stderr}</div>
                          </div>
                        )}

                        {Array.isArray(runOutput.testResults) && runOutput.testResults.length > 0 && (
                          <div style={{ marginTop: 10 }}>
                            {runOutput.testResults.map((tr) => (
                              <div key={tr.index} style={{ marginBottom: 8, fontSize: '0.8rem' }}>
                                <span style={{ color: tr.passed ? '#34d399' : '#f87171', fontWeight: 700 }}>
                                  Test Case {tr.index}: {tr.passed ? 'PASSED ✓' : 'FAILED ✗'}
                                </span>
                                {!tr.passed && (
                                  <div className="csw-tc-detail-content" style={{ marginTop: 4 }}>
                                    <div>Expected: {tr.expectedOutput}</div>
                                    <div>Output: {tr.actualOutput}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: '#71717a', textAlign: 'center', padding: '24px 0' }}>
                        Click "Run Code" to test against sample test cases, or "Submit Code" to evaluate your solution.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Submissions View */}
                {activeConsoleTab === 'submissions' && (
                  <div>
                    {submissions.filter((s) => s.problemId === currentProblem.id).length === 0 ? (
                      <p style={{ color: '#71717a', textAlign: 'center', padding: '20px 0' }}>
                        No submissions for this problem yet.
                      </p>
                    ) : (
                      <table className="csw-subs-table">
                        <thead>
                          <tr>
                            <th>Verdict</th>
                            <th>Passed</th>
                            <th>Time</th>
                            <th>Language</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions
                            .filter((s) => s.problemId === currentProblem.id)
                            .map((s) => (
                              <tr key={s.id}>
                                <td style={{ color: s.verdict === 'Accepted' ? '#34d399' : '#f87171', fontWeight: 700 }}>
                                  {s.verdict}
                                </td>
                                <td>{s.passedCount}/{s.totalCount}</td>
                                <td>{s.executionTimeMs}ms</td>
                                <td style={{ textTransform: 'capitalize' }}>{s.language}</td>
                                <td style={{ color: '#71717a' }}>{new Date(s.createdAt).toLocaleTimeString()}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="csw-action-footer">
              <div className="csw-footer-status">
                {isRunning ? (
                  <span>Running code...</span>
                ) : isSubmitting ? (
                  <span>Submitting & evaluating test cases...</span>
                ) : (
                  <span>Ready</span>
                )}
              </div>

              <div className="csw-footer-buttons">
                <button
                  className="csw-btn-run"
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                >
                  <FiPlay size={14} /> {isRunning ? 'Running...' : 'Run Code'}
                </button>

                <button
                  className="csw-btn-submit"
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                >
                  <FiCheckCircle size={15} /> {isSubmitting ? 'Evaluating...' : 'Submit Code'}
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Toast Notification */}
      {toast && <div className="csw-toast">{toast}</div>}
    </div>
  );
}
