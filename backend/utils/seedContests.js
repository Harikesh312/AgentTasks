import Contest from '../models/Contest.js';

export async function ensureContestsSeeded() {
  try {
    const count = await Contest.countDocuments();
    if (count > 0) {
      // Check if live contest exists and is active; if expired, refresh its time window so Live Now remains testable
      const live = await Contest.findOne({ id: 100 });
      if (live && (new Date(live.endTime) < new Date())) {
        const now = Date.now();
        live.startTime = new Date(now - 45 * 60 * 1000);
        live.endTime = new Date(now + 45 * 60 * 1000);
        live.status = 'live';
        await live.save();
      }
      return;
    }

    console.log('Seeding contests into MongoDB...');
    const now = Date.now();
    const DAY = 86400000;
    const HOUR = 3600000;
    const MINUTE = 60000;

    const liveContestProblems = [
      {
        id: 1,
        title: 'Agent Task Scheduling',
        difficulty: 'Easy',
        points: 100,
        description: 'An AI orchestrator receives a sequence of task execution times. Given an array of integers representing execution times and a maximum total time budget, calculate the maximum number of tasks the agent can execute sequentially without exceeding the budget.',
        constraints: [
          '1 <= tasks.length <= 10^5',
          '1 <= tasks[i] <= 10^4',
          '1 <= budget <= 10^9'
        ],
        examples: [
          {
            input: '[4, 2, 1, 5, 3]\n8',
            output: '3',
            explanation: 'Sorted tasks are [1, 2, 3, 4, 5]. Tasks 1, 2, and 3 take 1 + 2 + 3 = 6 time units (<= 8). Adding task 4 would exceed 8. Total tasks = 3.'
          },
          {
            input: '[5, 5, 5]\n10',
            output: '2',
            explanation: 'Executing 2 tasks takes 10 time units.'
          }
        ],
        testCases: [
          { input: '[4, 2, 1, 5, 3]\n8', expectedOutput: '3', isHidden: false },
          { input: '[5, 5, 5]\n10', expectedOutput: '2', isHidden: false },
          { input: '[1, 2, 3, 4, 5]\n15', expectedOutput: '5', isHidden: true },
          { input: '[10, 20, 30]\n5', expectedOutput: '0', isHidden: true },
          { input: '[100, 20, 50, 10, 30]\n90', expectedOutput: '3', isHidden: true }
        ],
        starterCode: {
          javascript: `const fs = require('fs');

function solve(input) {
  const lines = input.trim().split('\\n');
  if (lines.length < 2) return 0;
  const tasks = JSON.parse(lines[0]);
  const budget = parseInt(lines[1], 10);
  
  tasks.sort((a, b) => a - b);
  let count = 0;
  let spent = 0;
  for (const t of tasks) {
    if (spent + t <= budget) {
      spent += t;
      count++;
    } else {
      break;
    }
  }
  return count;
}

const input = fs.readFileSync(0, 'utf-8');
console.log(solve(input));`,
          python: `import sys
import json

def solve(input_data):
    lines = input_data.strip().split('\\n')
    if len(lines) < 2:
        return 0
    tasks = json.loads(lines[0])
    budget = int(lines[1])
    
    tasks.sort()
    count = 0
    spent = 0
    for t in tasks:
        if spent + t <= budget:
            spent += t
            count += 1
        else:
            break
    return count

if __name__ == '__main__':
    data = sys.stdin.read()
    print(solve(data))`
        }
      },
      {
        id: 2,
        title: 'Prompt Token Deduplication',
        difficulty: 'Medium',
        points: 250,
        description: 'When generating system prompts for an AI agent, redundant duplicate instructions waste tokens. Given a newline-separated list of instructions, remove duplicate instructions while preserving their original order, then output the deduplicated instructions followed by "Tokens saved: X" where X is the count of words saved from eliminated duplicates.',
        constraints: [
          '1 <= instructions.length <= 1000',
          'Instructions contain alphanumeric characters and spaces'
        ],
        examples: [
          {
            input: 'Be helpful\\nBe concise\\nBe helpful',
            output: 'Be helpful\\nBe concise\\nTokens saved: 2',
            explanation: 'The duplicate "Be helpful" (2 words) is removed, saving 2 tokens.'
          }
        ],
        testCases: [
          { input: 'Be helpful\nBe concise\nBe helpful', expectedOutput: 'Be helpful\nBe concise\nTokens saved: 2', isHidden: false },
          { input: 'Write code\nWrite code\nWrite code', expectedOutput: 'Write code\nTokens saved: 4', isHidden: false },
          { input: 'A\nB\nC', expectedOutput: 'A\nB\nC\nTokens saved: 0', isHidden: true },
          { input: 'System: act as agent\nSystem: act as agent', expectedOutput: 'System: act as agent\nTokens saved: 4', isHidden: true }
        ],
        starterCode: {
          javascript: `const fs = require('fs');

function solve(input) {
  const lines = input.trim().split('\\n').map(l => l.trim()).filter(Boolean);
  const seen = new Set();
  const unique = [];
  let savedWords = 0;

  for (const line of lines) {
    if (seen.has(line)) {
      savedWords += line.split(/\\s+/).filter(Boolean).length;
    } else {
      seen.add(line);
      unique.push(line);
    }
  }

  unique.push(\`Tokens saved: \${savedWords}\`);
  return unique.join('\\n');
}

const input = fs.readFileSync(0, 'utf-8');
console.log(solve(input));`,
          python: `import sys

def solve(input_data):
    lines = [l.strip() for l in input_data.strip().split('\\n') if l.strip()]
    seen = set()
    unique = []
    saved_words = 0

    for line in lines:
        if line in seen:
            saved_words += len(line.split())
        else:
            seen.add(line)
            unique.append(line)

    unique.append(f"Tokens saved: {saved_words}")
    return '\\n'.join(unique)

if __name__ == '__main__':
    data = sys.stdin.read()
    print(solve(data))`
        }
      },
      {
        id: 3,
        title: 'Tool Call Bracket Validator',
        difficulty: 'Medium',
        points: 350,
        description: 'An AI agent produces complex nested tool call expressions. Given a string expression containing brackets "(", ")", "[", "]", "{", "}", verify whether all brackets are correctly paired and nested. Output "VALID" if all brackets match, or "INVALID" otherwise.',
        constraints: [
          '1 <= expression.length <= 10^5'
        ],
        examples: [
          {
            input: '{[()]}',
            output: 'VALID',
            explanation: 'All brackets are properly nested.'
          },
          {
            input: '{[(])}',
            output: 'INVALID',
            explanation: 'The brackets overlap incorrectly.'
          }
        ],
        testCases: [
          { input: '{[()]}', expectedOutput: 'VALID', isHidden: false },
          { input: '{[(])}', expectedOutput: 'INVALID', isHidden: false },
          { input: 'tool(get_weather[location={"city": "Tokyo"}])', expectedOutput: 'VALID', isHidden: true },
          { input: '((', expectedOutput: 'INVALID', isHidden: true },
          { input: '[]', expectedOutput: 'VALID', isHidden: true }
        ],
        starterCode: {
          javascript: `const fs = require('fs');

function solve(input) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };
  
  for (const char of input.trim()) {
    if (char === '(' || char === '[' || char === '{') {
      stack.push(char);
    } else if (char === ')' || char === ']' || char === '}') {
      if (stack.length === 0 || stack[stack.length - 1] !== map[char]) {
        return 'INVALID';
      }
      stack.pop();
    }
  }
  return stack.length === 0 ? 'VALID' : 'INVALID';
}

const input = fs.readFileSync(0, 'utf-8');
console.log(solve(input));`,
          python: `import sys

def solve(input_data):
    stack = []
    mapping = {')': '(', ']': '[', '}': '{'}
    
    for char in input_data.strip():
        if char in '([{':
            stack.append(char)
        elif char in ')]}':
            if not stack or stack[-1] != mapping[char]:
                return 'INVALID'
            stack.pop()
            
    return 'VALID' if not stack else 'INVALID'

if __name__ == '__main__':
    data = sys.stdin.read()
    print(solve(data))`
        }
      },
      {
        id: 4,
        title: 'Concurrent Workflow Scheduler',
        difficulty: 'Hard',
        points: 500,
        description: 'You have N agent tasks labeled 1 to N, and a list of dependencies where [A, B] means task A must complete before task B begins. Independent tasks in the same stage run concurrently. Compute the minimum number of execution stages needed to complete all tasks. If a cyclic deadlock occurs, output -1.',
        constraints: [
          '1 <= N <= 10^4',
          '0 <= dependencies.length <= 5 * 10^4'
        ],
        examples: [
          {
            input: '4\\n[[1, 2], [2, 3], [1, 4]]',
            output: '3',
            explanation: 'Stage 1: Task 1. Stage 2: Tasks 2 and 4. Stage 3: Task 3. Total = 3 stages.'
          },
          {
            input: '2\\n[[1, 2], [2, 1]]',
            output: '-1',
            explanation: 'Circular dependency prevents completion.'
          }
        ],
        testCases: [
          { input: '4\n[[1, 2], [2, 3], [1, 4]]', expectedOutput: '3', isHidden: false },
          { input: '2\n[[1, 2], [2, 1]]', expectedOutput: '-1', isHidden: false },
          { input: '3\n[]', expectedOutput: '1', isHidden: true },
          { input: '5\n[[1, 2], [2, 3], [3, 4], [4, 5]]', expectedOutput: '5', isHidden: true }
        ],
        starterCode: {
          javascript: `const fs = require('fs');

function solve(input) {
  const lines = input.trim().split('\\n');
  const N = parseInt(lines[0], 10);
  const deps = JSON.parse(lines[1] || '[]');
  
  const inDegree = new Array(N + 1).fill(0);
  const adj = Array.from({ length: N + 1 }, () => []);
  
  for (const [u, v] of deps) {
    adj[u].push(v);
    inDegree[v]++;
  }
  
  let queue = [];
  for (let i = 1; i <= N; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  
  let stages = 0;
  let visited = 0;
  
  while (queue.length > 0) {
    stages++;
    const nextQueue = [];
    for (const node of queue) {
      visited++;
      for (const next of adj[node]) {
        inDegree[next]--;
        if (inDegree[next] === 0) nextQueue.push(next);
      }
    }
    queue = nextQueue;
  }
  
  return visited === N ? stages : -1;
}

const input = fs.readFileSync(0, 'utf-8');
console.log(solve(input));`,
          python: `import sys
import json
from collections import deque

def solve(input_data):
    lines = input_data.strip().split('\\n')
    N = int(lines[0])
    deps = json.loads(lines[1]) if len(lines) > 1 and lines[1].strip() else []
    
    in_degree = [0] * (N + 1)
    adj = [[] for _ in range(N + 1)]
    
    for u, v in deps:
        adj[u].append(v)
        in_degree[v] += 1
        
    queue = deque([i for i in range(1, N + 1) if in_degree[i] == 0])
    stages = 0
    visited = 0
    
    while queue:
        stages += 1
        for _ in range(len(queue)):
            node = queue.popleft()
            visited += 1
            for nxt in adj[node]:
                in_degree[nxt] -= 1
                if in_degree[nxt] == 0:
                    queue.append(nxt)
                    
    return stages if visited == N else -1

if __name__ == '__main__':
    data = sys.stdin.read()
    print(solve(data))`
        }
      }
    ];

    const contestsToSeed = [
      // 1. Live Contest
      {
        id: 100,
        name: 'AgentTasks Flash Challenge #07',
        type: 'Weekly',
        startTime: new Date(now - 45 * MINUTE),
        endTime: new Date(now + 45 * MINUTE),
        duration: '90 Minutes',
        durationMs: 90 * MINUTE,
        difficulty: 'Medium',
        status: 'live',
        description: 'A fast-paced flash challenge designed to test your algorithmic problem solving and AI agent coordination under real contest conditions. Currently live!',
        rules: [
          'You may solve problems using JavaScript or Python',
          'Each problem earns points upon passing all test cases',
          'Code execution enforces a 4000ms timeout per test case',
          'Speed bonus applies based on submission time'
        ],
        scoring: 'Total score is calculated from points earned for each accepted problem minus any penalty for wrong submissions before accept.',
        initialParticipantsCount: 847,
        problems: liveContestProblems
      },
      // 2. Upcoming Contests
      {
        id: 1,
        name: 'AgentTasks Weekly Contest #01',
        type: 'Weekly',
        startTime: new Date(now + 2 * DAY + 14 * HOUR),
        endTime: new Date(now + 2 * DAY + 15 * HOUR + 30 * MINUTE),
        duration: '90 Minutes',
        durationMs: 90 * MINUTE,
        difficulty: 'Easy → Hard',
        status: 'upcoming',
        description: 'Compete in our flagship weekly contest! Solve 4 AI agent prompting and coding challenges of increasing difficulty. Top performers earn badges and leaderboard placement.',
        rules: [
          'Registration is required prior to contest start',
          'Each problem has a time bonus for early completion',
          'Submissions are evaluated against hidden test cases',
          'Top 10 receive exclusive badges'
        ],
        scoring: 'Points are awarded based on correctness (60%), efficiency (25%), and speed bonus (15%).',
        initialParticipantsCount: 1248,
        problems: liveContestProblems
      },
      {
        id: 2,
        name: 'AgentTasks Weekly Contest #02',
        type: 'Weekly',
        startTime: new Date(now + 9 * DAY + 10 * HOUR),
        endTime: new Date(now + 9 * DAY + 11 * HOUR + 30 * MINUTE),
        duration: '90 Minutes',
        durationMs: 90 * MINUTE,
        difficulty: 'Mixed',
        status: 'upcoming',
        description: 'A mixed-difficulty contest designed to test versatility across algorithm optimization and tool calling.',
        rules: ['Registration open to all members', 'Standard contest rules apply'],
        scoring: 'Standard scoring applies.',
        initialParticipantsCount: 982,
        problems: liveContestProblems
      },
      {
        id: 3,
        name: 'AgentTasks Biweekly Challenge',
        type: 'Biweekly',
        startTime: new Date(now + 5 * DAY + 16 * HOUR),
        endTime: new Date(now + 5 * DAY + 18 * HOUR),
        duration: '120 Minutes',
        durationMs: 120 * MINUTE,
        difficulty: 'Medium → Hard',
        status: 'upcoming',
        description: 'Our biweekly challenge features 6 problems with a focus on medium and hard difficulty.',
        rules: ['Registration open to all members', 'Standard contest rules apply'],
        scoring: 'Weighted scoring applies.',
        initialParticipantsCount: 764,
        problems: liveContestProblems
      },
      {
        id: 4,
        name: 'AgentTasks Monthly Championship',
        type: 'Monthly',
        startTime: new Date(now + 18 * DAY + 12 * HOUR),
        endTime: new Date(now + 18 * DAY + 15 * HOUR),
        duration: '180 Minutes',
        durationMs: 180 * MINUTE,
        difficulty: 'Easy → Expert',
        status: 'upcoming',
        description: 'The ultimate monthly showdown. 8 problems across all difficulty levels. The top 3 earn exclusive champion badges.',
        rules: ['Registration open to all members'],
        scoring: 'Progressive scoring with multipliers.',
        initialParticipantsCount: 2341,
        problems: liveContestProblems
      },
      {
        id: 5,
        name: 'Beginner Bootcamp Contest',
        type: 'Beginner',
        startTime: new Date(now + 3 * DAY + 8 * HOUR),
        endTime: new Date(now + 3 * DAY + 9 * HOUR),
        duration: '60 Minutes',
        durationMs: 60 * MINUTE,
        difficulty: 'Easy',
        status: 'upcoming',
        description: 'A beginner-friendly contest with easy problems. Perfect for your first AgentTasks competition!',
        rules: ['Designed for new participants', 'Hints available for each problem'],
        scoring: 'Simple scoring: correctness only.',
        initialParticipantsCount: 1560,
        problems: liveContestProblems
      },
      {
        id: 6,
        name: 'Advanced Prompt Engineering Duel',
        type: 'Advanced',
        startTime: new Date(now + 12 * DAY + 18 * HOUR),
        endTime: new Date(now + 12 * DAY + 20 * HOUR),
        duration: '120 Minutes',
        durationMs: 120 * MINUTE,
        difficulty: 'Hard → Expert',
        status: 'upcoming',
        description: 'For elite prompt engineers and developers only. Tackle the hardest agent orchestration challenges.',
        rules: ['All problems are Hard or Expert difficulty'],
        scoring: 'Efficiency-weighted scoring.',
        initialParticipantsCount: 423,
        problems: liveContestProblems
      },
      // 3. Past Contests
      {
        id: 201,
        name: 'AgentTasks Weekly Contest #12',
        type: 'Weekly',
        startTime: new Date(now - 7 * DAY),
        endTime: new Date(now - 7 * DAY + 90 * MINUTE),
        duration: '90 Minutes',
        durationMs: 90 * MINUTE,
        difficulty: 'Easy → Hard',
        status: 'completed',
        description: 'Weekly contest concluded.',
        initialParticipantsCount: 1284,
        problems: liveContestProblems
      },
      {
        id: 202,
        name: 'AgentTasks Biweekly Challenge #06',
        type: 'Biweekly',
        startTime: new Date(now - 14 * DAY),
        endTime: new Date(now - 14 * DAY + 120 * MINUTE),
        duration: '120 Minutes',
        durationMs: 120 * MINUTE,
        difficulty: 'Medium → Hard',
        status: 'completed',
        description: 'Biweekly challenge concluded.',
        initialParticipantsCount: 956,
        problems: liveContestProblems
      },
      {
        id: 203,
        name: 'AgentTasks Monthly Championship #03',
        type: 'Monthly',
        startTime: new Date(now - 30 * DAY),
        endTime: new Date(now - 30 * DAY + 180 * MINUTE),
        duration: '180 Minutes',
        durationMs: 180 * MINUTE,
        difficulty: 'Easy → Expert',
        status: 'completed',
        description: 'Monthly championship concluded.',
        initialParticipantsCount: 2108,
        problems: liveContestProblems
      },
      {
        id: 204,
        name: 'Beginner Bootcamp #04',
        type: 'Beginner',
        startTime: new Date(now - 21 * DAY),
        endTime: new Date(now - 21 * DAY + 60 * MINUTE),
        duration: '60 Minutes',
        durationMs: 60 * MINUTE,
        difficulty: 'Easy',
        status: 'completed',
        description: 'Bootcamp completed.',
        initialParticipantsCount: 1890,
        problems: liveContestProblems
      },
      {
        id: 205,
        name: 'Advanced Prompt Duel #02',
        type: 'Advanced',
        startTime: new Date(now - 45 * DAY),
        endTime: new Date(now - 45 * DAY + 120 * MINUTE),
        duration: '120 Minutes',
        durationMs: 120 * MINUTE,
        difficulty: 'Hard → Expert',
        status: 'completed',
        description: 'Advanced duel concluded.',
        initialParticipantsCount: 389,
        problems: liveContestProblems
      }
    ];

    await Contest.insertMany(contestsToSeed);
    console.log('Contests seeded successfully.');
  } catch (err) {
    console.error('Failed to seed contests:', err);
  }
}
