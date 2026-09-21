const now = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

export const discussCategories = [
  'All',
  'Interview Experience',
  'Prompt Strategies',
  'Optimization',
  'Career & AI',
  'Feedback'
];

export const discussPosts = [
  {
    id: 1,
    type: "prompt-share",
    questionId: 3,
    title: "How I handled the Analytics Dashboard responsive layout",
    category: "Prompt Strategies",
    author: "Priyanka Rawat",
    authorBadge: "Prompt Master",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priyanka",
    body: "The agent kept creating fixed-width containers until I explicitly asked it to use CSS Grid with `minmax` values. The key is to tell the agent exactly which containers need fluid behavior before it writes any CSS.",
    promptText: "Build the Analytics Dashboard layout. \nCRITICAL RESPONSIVE REQUIREMENT: Use CSS Grid for the main layout. The sidebar should be fixed width (250px), but the main content area MUST use a fluid grid (minmax(0, 1fr)) to prevent overflow. Do not use any hardcoded pixel widths for cards, use percentages or flex-basis.",
    turnsUsed: 1,
    scoreAchieved: 94,
    upvotes: 42,
    commentCount: 2,
    createdAt: new Date(now - 2 * HOUR).toISOString(),
    comments: [
      {
        id: 101,
        author: "DevSamurai",
        authorBadge: "Problem Solver",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DevSamurai",
        body: "This is brilliant! I was stuck on turn 4 trying to fix the overflow. The minmax trick worked immediately.",
        upvotes: 8,
        createdAt: new Date(now - 1 * HOUR).toISOString()
      },
      {
        id: 102,
        author: "AlexChen",
        authorBadge: "Agent Expert",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        body: "I also found that mentioning `overflow-x: hidden` on the root container helps if the agent gets stubborn about table widths.",
        upvotes: 5,
        createdAt: new Date(now - 30 * 60000).toISOString()
      }
    ]
  },
  {
    id: 2,
    type: "interview-exp",
    questionId: null,
    title: "Got the AI-agent round at a top product company — here's what they asked",
    category: "Interview Experience",
    author: "Sarah Chen",
    authorBadge: "Interview Pro",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    body: "Just finished my onsite. The second round was purely evaluating how well I could guide an AI agent to build a complex multi-step form. \n\nThey didn't care about the final code as much as they cared about my prompting process. They specifically looked for:\n1. Did I provide context up front?\n2. How did I handle the agent's inevitable hallucination on the validation logic?\n3. Was my follow-up prompt precise or vague?\n\nHighly recommend practicing the 'Multi-Step Form' question here on AgentTasks. It was almost exactly the same scenario.",
    promptText: null,
    turnsUsed: null,
    scoreAchieved: null,
    upvotes: 128,
    commentCount: 0,
    createdAt: new Date(now - 1 * DAY).toISOString(),
    comments: []
  },
  {
    id: 3,
    type: "trap-breakdown",
    questionId: 4,
    title: "Why your Data Table is freezing the browser",
    category: "Optimization",
    author: "Marcus_Tech",
    authorBadge: "Rising Coder",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    body: "If you just tell the agent 'render 10,000 rows', it will happily generate a massive DOM tree and crash your preview. The trap here is not realizing you need virtualization. You MUST explicitly prompt for `react-window` or a similar virtualization technique.",
    promptText: null,
    turnsUsed: null,
    scoreAchieved: null,
    upvotes: 56,
    commentCount: 1,
    createdAt: new Date(now - 3 * DAY).toISOString(),
    comments: [
      {
        id: 301,
        author: "harikeshkumar",
        authorBadge: "Contest Champion",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=harikesh",
        body: "Alternatively, you can just prompt it to implement simple pagination first! Much easier for the agent to get right in a single turn.",
        upvotes: 12,
        createdAt: new Date(now - 2 * DAY).toISOString()
      }
    ]
  },
  {
    id: 4,
    type: "strategy",
    questionId: null,
    title: "The 'Context-Constraint-Format' prompting framework",
    category: "Prompt Strategies",
    author: "AI_Whisperer",
    authorBadge: "Prompt Master",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Whisperer",
    body: "I've consistently scored 90+ on AgentTasks using the CCF framework:\n\n**1. Context:** 'You are an expert frontend developer building a React component.'\n**2. Constraint:** 'Do not use Tailwind. Write pure CSS. Must be responsive.'\n**3. Format:** 'Output only the complete App.jsx and index.css files.'\n\nStop writing conversational prompts and start writing structured specifications.",
    promptText: null,
    turnsUsed: null,
    scoreAchieved: null,
    upvotes: 312,
    commentCount: 0,
    createdAt: new Date(now - 5 * DAY).toISOString(),
    comments: []
  },
  {
    id: 5,
    type: "question",
    questionId: 7,
    title: "Agent keeps missing the mobile breakpoint completely",
    category: "Optimization",
    author: "BeginnerDev01",
    authorBadge: null,
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beginner",
    body: "I'm trying to fix the responsive breakpoints on the Portfolio UI, but the agent keeps writing `@media (min-width: 1024px)` and ignoring mobile-first design. How do I force it to write mobile-first CSS?",
    promptText: null,
    turnsUsed: null,
    scoreAchieved: null,
    upvotes: 15,
    commentCount: 0,
    createdAt: new Date(now - 4 * HOUR).toISOString(),
    comments: []
  }
];
