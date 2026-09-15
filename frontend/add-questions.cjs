
const fs = require("fs");
const path = require("path");

const newQuestions = [
  // 7 EASY
  {
    id: 29,
    title: "Find the Missing Digit",
    difficulty: "Easy",
    category: "Arrays & Strings",
    isOptimizationTrap: false,
    avgAttempts: 1.5,
    description: "Given a string representing a sequence of numbers from 1 to N, one digit is missing. Find the missing digit.",
    referenceImage: "/images/references/q29_missing_digit.svg",
    requirements: ["Return the missing digit as an integer", "Handle cases where the missing digit is 0", "Time complexity should be O(N)"],
    constraints: ["1 <= N <= 100", "String contains only digits"],
    maxPromptTurns: 5
  },
  {
    id: 30,
    title: "Valid Parenthesis Pairs",
    difficulty: "Easy",
    category: "Stacks",
    isOptimizationTrap: false,
    avgAttempts: 1.3,
    description: "Determine if a string containing only parentheses is valid. Every open parenthesis must have a corresponding closing parenthesis.",
    referenceImage: "/images/references/q30_parentheses.svg",
    requirements: ["Return true if valid, false otherwise", "Time complexity O(N)", "Space complexity O(N)"],
    constraints: ["1 <= s.length <= 10^4", "String contains only ( and )"],
    maxPromptTurns: 5
  },
  {
    id: 31,
    title: "Merge Two Sorted Arrays",
    difficulty: "Easy",
    category: "Two Pointers",
    isOptimizationTrap: false,
    avgAttempts: 1.6,
    description: "Merge two sorted integer arrays into a single sorted array. Do this in-place if possible, or return a new array.",
    referenceImage: "/images/references/q31_merge_arrays.svg",
    requirements: ["Return the merged sorted array", "Time complexity O(N+M)", "Space complexity O(1) extra space"],
    constraints: ["0 <= N, M <= 1000"],
    maxPromptTurns: 5
  },
  {
    id: 32,
    title: "First Unique Character",
    difficulty: "Easy",
    category: "Hash Maps",
    isOptimizationTrap: false,
    avgAttempts: 1.2,
    description: "Find the first non-repeating character in a string and return its index. If it does not exist, return -1.",
    referenceImage: "/images/references/q32_unique_char.svg",
    requirements: ["Return the index of the character", "Time complexity O(N)", "Space complexity O(1) (26 alphabet chars)"],
    constraints: ["1 <= s.length <= 10^5", "String contains only lowercase English letters"],
    maxPromptTurns: 5
  },
  {
    id: 33,
    title: "Reverse a String",
    difficulty: "Easy",
    category: "Two Pointers",
    isOptimizationTrap: false,
    avgAttempts: 1.1,
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    referenceImage: "/images/references/q33_reverse_string.svg",
    requirements: ["Modify the array in-place", "Time complexity O(N)", "Space complexity O(1)"],
    constraints: ["1 <= s.length <= 10^5"],
    maxPromptTurns: 5
  },
  {
    id: 34,
    title: "Intersection of Two Arrays",
    difficulty: "Easy",
    category: "Sets",
    isOptimizationTrap: false,
    avgAttempts: 1.8,
    description: "Given two integer arrays, return an array of their intersection. Each element in the result must be unique.",
    referenceImage: "/images/references/q34_intersection.svg",
    requirements: ["Return unique intersecting elements", "Order does not matter"],
    constraints: ["1 <= arr.length <= 1000", "0 <= arr[i] <= 1000"],
    maxPromptTurns: 5
  },
  {
    id: 35,
    title: "Binary Search Implementation",
    difficulty: "Easy",
    category: "Binary Search",
    isOptimizationTrap: false,
    avgAttempts: 1.4,
    description: "Implement binary search to find the index of a target element in a sorted array.",
    referenceImage: "/images/references/q35_binary_search.svg",
    requirements: ["Return the index if target exists, else -1", "Time complexity O(log N)", "Space complexity O(1)"],
    constraints: ["1 <= arr.length <= 10^4", "Array is sorted in ascending order"],
    maxPromptTurns: 5
  },
  
  // 8 MEDIUM
  {
    id: 36,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    isOptimizationTrap: true,
    avgAttempts: 2.5,
    description: "Given a string, find the length of the longest substring without repeating characters.",
    referenceImage: "/images/references/q36_sliding_window.svg",
    requirements: ["Return the integer length", "Time complexity O(N)", "Space complexity O(K) where K is alphabet size"],
    constraints: ["0 <= s.length <= 5 * 10^4"],
    maxPromptTurns: 8
  },
  {
    id: 37,
    title: "Subarray Sum Equals K",
    difficulty: "Medium",
    category: "Prefix Sums",
    isOptimizationTrap: true,
    avgAttempts: 3.1,
    description: "Given an array of integers and an integer k, return the total number of subarrays whose sum equals to k.",
    referenceImage: "/images/references/q37_prefix_sum.svg",
    requirements: ["Return the integer count", "Time complexity O(N)", "Use a hash map to store prefix sums"],
    constraints: ["1 <= nums.length <= 2 * 10^4", "-1000 <= nums[i] <= 1000"],
    maxPromptTurns: 8
  },
  {
    id: 38,
    title: "Group Anagrams",
    difficulty: "Medium",
    category: "Hash Maps",
    isOptimizationTrap: false,
    avgAttempts: 2.2,
    description: "Given an array of strings, group the anagrams together. You can return the answer in any order.",
    referenceImage: "/images/references/q38_anagrams.svg",
    requirements: ["Return a list of lists of strings", "Time complexity O(N * K log K) or O(N * K)"],
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100"],
    maxPromptTurns: 8
  },
  {
    id: 39,
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Intervals",
    isOptimizationTrap: false,
    avgAttempts: 2.7,
    description: "Given an array of intervals, merge all overlapping intervals and return an array of the non-overlapping intervals.",
    referenceImage: "/images/references/q39_intervals.svg",
    requirements: ["Return the merged intervals", "Time complexity O(N log N)"],
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2"],
    maxPromptTurns: 8
  },
  {
    id: 40,
    title: "Level Order Traversal",
    difficulty: "Medium",
    category: "Trees",
    isOptimizationTrap: false,
    avgAttempts: 2.1,
    description: "Given the root of a binary tree, return the level order traversal of its nodes values.",
    referenceImage: "/images/references/q40_tree_level.svg",
    requirements: ["Return a list of lists representing levels", "Time complexity O(N)"],
    constraints: ["0 <= Number of nodes <= 2000"],
    maxPromptTurns: 8
  },
  {
    id: 41,
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Graphs",
    isOptimizationTrap: false,
    avgAttempts: 2.9,
    description: "Given a 2D grid map of 1s (land) and 0s (water), count the number of islands. An island is surrounded by water.",
    referenceImage: "/images/references/q41_islands.svg",
    requirements: ["Return the integer count", "Time complexity O(M * N)"],
    constraints: ["1 <= m, n <= 300", "grid[i][j] is 0 or 1"],
    maxPromptTurns: 8
  },
  {
    id: 42,
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    category: "Heaps",
    isOptimizationTrap: true,
    avgAttempts: 2.8,
    description: "Given an integer array nums and an integer k, return the k most frequent elements.",
    referenceImage: "/images/references/q42_top_k.svg",
    requirements: ["Return an array of integers", "Time complexity better than O(N log N)"],
    constraints: ["1 <= nums.length <= 10^5", "1 <= k <= number of unique elements"],
    maxPromptTurns: 8
  },
  {
    id: 43,
    title: "Word Search",
    difficulty: "Medium",
    category: "Backtracking",
    isOptimizationTrap: false,
    avgAttempts: 3.4,
    description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid.",
    referenceImage: "/images/references/q43_word_search.svg",
    requirements: ["Return true or false", "Time complexity O(N * 3^L) where L is word length"],
    constraints: ["1 <= m, n <= 6", "1 <= word.length <= 15"],
    maxPromptTurns: 8
  },
  
  // 7 HARD
  {
    id: 44,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    category: "Two Pointers",
    isOptimizationTrap: true,
    avgAttempts: 4.5,
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap.",
    referenceImage: "/images/references/q44_rain_water.svg",
    requirements: ["Return the integer amount of trapped water", "Time complexity O(N)", "Space complexity O(1)"],
    constraints: ["1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    maxPromptTurns: 12
  },
  {
    id: 45,
    title: "Word Ladder",
    difficulty: "Hard",
    category: "Graphs",
    isOptimizationTrap: true,
    avgAttempts: 5.1,
    description: "Find the length of the shortest transformation sequence from beginWord to endWord, such that only one letter can be changed at a time.",
    referenceImage: "/images/references/q45_word_ladder.svg",
    requirements: ["Return the length of the sequence", "Time complexity O(M^2 * N)", "Use BFS"],
    constraints: ["1 <= beginWord.length <= 10", "1 <= wordList.length <= 5000"],
    maxPromptTurns: 12
  },
  {
    id: 46,
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    category: "Heaps",
    isOptimizationTrap: false,
    avgAttempts: 3.9,
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.",
    referenceImage: "/images/references/q46_merge_k.svg",
    requirements: ["Return the head of the merged linked list", "Time complexity O(N log K)"],
    constraints: ["0 <= k <= 10^4", "0 <= lists[i].length <= 500"],
    maxPromptTurns: 12
  },
  {
    id: 47,
    title: "N-Queens",
    difficulty: "Hard",
    category: "Backtracking",
    isOptimizationTrap: false,
    avgAttempts: 4.8,
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Return all distinct solutions.",
    referenceImage: "/images/references/q47_n_queens.svg",
    requirements: ["Return a list of board configurations", "Time complexity O(N!)"],
    constraints: ["1 <= n <= 9"],
    maxPromptTurns: 12
  },
  {
    id: 48,
    title: "Alien Dictionary",
    difficulty: "Hard",
    category: "Graphs",
    isOptimizationTrap: true,
    avgAttempts: 5.5,
    description: "Given a list of words from an alien language dictionary, deduce the alphabetical order of its characters.",
    referenceImage: "/images/references/q48_alien_dict.svg",
    requirements: ["Return a string of the unique characters in order", "Topological sort"],
    constraints: ["1 <= words.length <= 100", "1 <= words[i].length <= 100"],
    maxPromptTurns: 12
  },
  {
    id: 49,
    title: "Edit Distance",
    difficulty: "Hard",
    category: "Dynamic Programming",
    isOptimizationTrap: false,
    avgAttempts: 4.2,
    description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.",
    referenceImage: "/images/references/q49_edit_distance.svg",
    requirements: ["Return the integer min operations", "Time complexity O(M * N)", "Space complexity O(M * N)"],
    constraints: ["0 <= word1.length, word2.length <= 500"],
    maxPromptTurns: 12
  },
  {
    id: 50,
    title: "Largest Rectangle in Histogram",
    difficulty: "Hard",
    category: "Stacks",
    isOptimizationTrap: true,
    avgAttempts: 5.9,
    description: "Given an array of integers heights representing the histograms bar height where the width of each bar is 1, return the area of the largest rectangle.",
    referenceImage: "/images/references/q50_histogram.svg",
    requirements: ["Return the integer area", "Time complexity O(N)", "Use a monotonic stack"],
    constraints: ["1 <= heights.length <= 10^5", "0 <= heights[i] <= 10^4"],
    maxPromptTurns: 12
  }
];

const filePath = path.join(__dirname, "src/data/questions.js");
let fileContent = fs.readFileSync(filePath, "utf-8");

// Remove export and closing bracket temporarily
const exportIdx = fileContent.lastIndexOf("];");
const cleanContent = fileContent.substring(0, exportIdx).trim();

// Ensure there is a trailing comma before appending new objects
let newContent = cleanContent;
if (!newContent.endsWith(",")) {
  newContent += ",";
}

const objectsStr = newQuestions.map(q => JSON.stringify(q, null, 2)).join(",\n");

newContent += "\n" + objectsStr + "\n];\n\nexport default questions;\n";

fs.writeFileSync(filePath, newContent);

// Generate SVGs
const imagesDir = path.join(__dirname, "public/images/references");
newQuestions.forEach(q => {
  const fileName = path.basename(q.referenceImage);
  const p = path.join(imagesDir, fileName);
  
  // A simple placeholder SVG that looks somewhat decent
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <rect width="800" height="450" fill="#f8fafc" />
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect x="350" y="150" width="100" height="100" rx="20" fill="url(#grad)" opacity="0.2" />
    <text x="400" y="200" font-family="sans-serif" font-size="28" font-weight="bold" fill="#334155" text-anchor="middle">${q.title}</text>
    <text x="400" y="240" font-family="sans-serif" font-size="16" fill="#64748b" text-anchor="middle">${q.category} - ${q.difficulty}</text>
    <path d="M 200 350 Q 400 250 600 350" stroke="#cbd5e1" stroke-width="4" fill="none" stroke-dasharray="8 8" />
    <circle cx="200" cy="350" r="8" fill="#3b82f6" />
    <circle cx="600" cy="350" r="8" fill="#8b5cf6" />
  </svg>`;
  
  fs.writeFileSync(p, svg);
});

console.log("SUCCESS");

