const generateTrace = (isHard, turn) => {
  const base = [
    { step: "Parsing prompt...", status: "done", icon: "edit" },
    { step: "Analyzing reference image...", status: "done", icon: "search" },
    { step: "Generating layout structure...", status: "done", icon: "layout" },
    { step: "Applying styles and themes...", status: "done", icon: "palette" },
  ];
  if (isHard && turn === 1) {
    base.push({ step: "Warning: fixed widths used, may not be responsive", status: "warning", icon: "warning" });
  }
  if (turn > 1) {
    base.push({ step: "Applying corrections from follow-up prompt...", status: "done", icon: "wrench" });
    base.push({ step: "Optimizing output...", status: "done", icon: "check" });
  }
  base.push({ step: "Done", status: "done", icon: "check" });
  return base;
};

const defaultFiles = (turn) => ({
  "index.html": `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div class="container">\n    <h1>Generated Output — Turn ${turn}</h1>\n    <p>This is the agent-generated markup.</p>\n  </div>\n</body>\n</html>`,
  "styles.css": `/* Generated styles — Turn ${turn} */\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: 'Inter', sans-serif; background: #fafafa; color: #1a1a1a; }\n.container { max-width: 1200px; margin: 0 auto; padding: 2rem; }\nh1 { font-size: 2rem; margin-bottom: 1rem; }`,
});

const makeRun = (qId, isHard, keywords) => {
  const turns = [
    {
      agentMessage: isHard
        ? "Done — I generated the component using fixed pixel widths and inline sizing. The layout is functional but may not adapt well to different screen sizes."
        : "Done — I've generated the component matching the reference design. Used flexbox for layout, semantic HTML, and responsive units.",
      files: defaultFiles(1),
      trace: generateTrace(isHard, 1),
      preview: isHard
        ? "<div style='padding:24px;font-family:Inter,sans-serif'><div style='background:#fff3e9;padding:16px;border-radius:8px;border-left:4px solid #ff6b35;margin-bottom:16px'><strong>⚠ Known Issue:</strong> Layout uses fixed widths — may break on resize</div><div style='display:flex;gap:12px'><div style='width:300px;height:200px;background:#ffe0c2;border-radius:8px;display:flex;align-items:center;justify-content:center'>Fixed 300px Card</div><div style='width:300px;height:200px;background:#ffe0c2;border-radius:8px;display:flex;align-items:center;justify-content:center'>Fixed 300px Card</div></div></div>"
        : "<div style='padding:24px;font-family:Inter,sans-serif'><div style='background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:48px;border-radius:12px;text-align:center;color:white'><h1 style='font-size:2.5rem;margin-bottom:12px;background:linear-gradient(90deg,#ff6b35,#ffb088);-webkit-background-clip:text;-webkit-text-fill-color:transparent'>Beautiful Hero Section</h1><p style='opacity:0.8;margin-bottom:24px'>Perfectly crafted by the AI agent</p><button style='background:#ff6b35;color:white;border:none;padding:12px 32px;border-radius:8px;font-size:1rem;cursor:pointer'>Get Started</button></div></div>",
    },
    {
      agentMessage: isHard
        ? "Updated! I've replaced fixed widths with CSS Grid using fr units, added media queries for tablet (768px) and mobile (480px) breakpoints, and implemented fluid typography. The layout is now fully responsive."
        : "Refined — I've improved spacing, added subtle hover animations, and optimized the CSS structure based on your feedback.",
      files: {
        "index.html": `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Component — Improved</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div class="container">\n    <h1>Improved Output — Turn 2</h1>\n    <p>Responsive and optimized version.</p>\n  </div>\n</body>\n</html>`,
        "styles.css": `/* Improved styles — Turn 2 */\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: 'Inter', sans-serif; background: #fafafa; color: #1a1a1a; }\n.container { max-width: 1200px; margin: 0 auto; padding: clamp(1rem, 3vw, 2rem); }\n@media (max-width: 768px) {\n  .container { padding: 1rem; }\n}`,
      },
      trace: generateTrace(isHard, 2),
      preview: "<div style='padding:24px;font-family:Inter,sans-serif'><div style='background:#e8f5e9;padding:16px;border-radius:8px;border-left:4px solid #4caf50;margin-bottom:16px'><strong>✅ Improved:</strong> Now using responsive grid with proper breakpoints</div><div style='display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px'><div style='height:200px;background:#ffe0c2;border-radius:8px;display:flex;align-items:center;justify-content:center'>Responsive Card</div><div style='height:200px;background:#ffe0c2;border-radius:8px;display:flex;align-items:center;justify-content:center'>Responsive Card</div><div style='height:200px;background:#ffe0c2;border-radius:8px;display:flex;align-items:center;justify-content:center'>Responsive Card</div></div></div>",
    },
  ];

  const evalResult = (turnsUsed) => ({
    score: isHard ? (turnsUsed <= 2 ? 84 : 72) : (turnsUsed <= 1 ? 95 : 88),
    visualMatch: isHard ? (turnsUsed <= 2 ? 88 : 78) : 92,
    codeOptimization: isHard ? (turnsUsed <= 2 ? 75 : 60) : 90,
    promptEfficiency: Math.max(40, 100 - (turnsUsed - 1) * 21),
    feedback: isHard
      ? turnsUsed <= 2
        ? "Good recovery. You identified the responsiveness issue and fixed it in a follow-up prompt. Try specifying breakpoints upfront next time to save a turn."
        : "The output improved but took too many turns. Be more specific about responsive requirements in your initial prompt."
      : turnsUsed <= 1
        ? "Excellent first prompt! You covered all requirements clearly and the agent nailed it on the first try."
        : "Good result. Your follow-up refined the output nicely. Consider including more detail in your initial prompt.",
  });

  return { turns, keywords: keywords || ["responsive", "optimize", "fix", "breakpoint", "grid", "media query", "fluid", "improve", "refactor", "pagination", "virtualize", "lazy"], evalResult };
};

const mockAgentRuns = {
  1: makeRun(1, false),
  2: makeRun(2, false),
  3: makeRun(3, true, ["responsive", "grid", "breakpoint", "media query", "fluid", "fr unit", "auto-fit", "fix"]),
  4: makeRun(4, true, ["paginate", "pagination", "virtualize", "lazy", "optimize", "performance", "chunk", "limit", "batch"]),
  5: makeRun(5, false),
  6: makeRun(6, false),
  7: makeRun(7, true, ["responsive", "breakpoint", "media query", "mobile", "tablet", "fluid", "fix", "overflow"]),
  8: makeRun(8, false),
  9: makeRun(9, false),
  10: makeRun(10, false),
  11: makeRun(11, false),
  12: makeRun(12, false),
  13: makeRun(13, false),
  14: makeRun(14, false),
  15: makeRun(15, true, ["debounce", "loading", "state"]),
  16: makeRun(16, false),
  17: makeRun(17, false),
  18: makeRun(18, false),
  19: makeRun(19, true, ["drag", "drop", "state", "reorder"]),
  20: makeRun(20, true, ["filter", "sort", "pagination", "search"]),
  21: makeRun(21, false),
  22: makeRun(22, false),
  23: makeRun(23, false),
  24: makeRun(24, true, ["virtualize", "scroll", "performance"]),
  25: makeRun(25, true, ["optimistic", "real-time", "collaboration"]),
  26: makeRun(26, false),
  27: makeRun(27, false),
  28: makeRun(28, true, ["keyboard", "search", "accessibility"]),
};

export default mockAgentRuns;
