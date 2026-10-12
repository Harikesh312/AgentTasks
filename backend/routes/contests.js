import express from 'express';
import Contest from '../models/Contest.js';
import ContestSubmission from '../models/ContestSubmission.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { executeCode, compareOutputs } from '../utils/codeRunner.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * Helper to optionally extract authenticated user without rejecting unauthenticated requests
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    } catch {}
  }
  next();
};

/**
 * GET /api/contests
 * Fetch all contests categorized with real countdowns and registration states
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: 1 });
    const now = Date.now();
    const userId = req.user?._id;

    let liveContest = null;
    const upcoming = [];
    const past = [];

    for (const c of contests) {
      const startMs = new Date(c.startTime).getTime();
      const endMs = new Date(c.endTime).getTime();

      let currentStatus = c.status;
      if (now < startMs) {
        currentStatus = 'upcoming';
      } else if (now >= startMs && now <= endMs) {
        currentStatus = 'live';
      } else {
        currentStatus = 'completed';
      }

      // Update status in memory and persist if changed
      if (c.status !== currentStatus) {
        c.status = currentStatus;
        await c.save();
      }

      const isRegistered = userId
        ? c.participants.some((p) => p.userId && p.userId.equals(userId))
        : false;

      const totalParticipants = (c.initialParticipantsCount || 0) + (c.participants?.length || 0);

      const remainingMs = currentStatus === 'live'
        ? Math.max(0, endMs - now)
        : currentStatus === 'upcoming'
        ? Math.max(0, startMs - now)
        : 0;

      const contestObj = {
        id: c.id,
        name: c.name,
        type: c.type,
        date: c.startTime.toISOString(),
        startTime: c.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC',
        duration: c.duration,
        durationMs: c.durationMs,
        problems: c.problems.length,
        participants: totalParticipants,
        difficulty: c.difficulty,
        status: currentStatus,
        remainingMs,
        description: c.description,
        rules: c.rules,
        scoring: c.scoring,
        isRegistered,
      };

      if (currentStatus === 'live' && !liveContest) {
        liveContest = contestObj;
      } else if (currentStatus === 'upcoming') {
        upcoming.push(contestObj);
      } else {
        past.push(contestObj);
      }
    }

    res.json({
      liveContest,
      upcomingContests: upcoming,
      pastContests: past,
    });
  } catch (err) {
    console.error('Error fetching contests:', err);
    res.status(500).json({ error: 'Failed to fetch contests', message: err.message });
  }
});

/**
 * GET /api/contests/user/stats
 * Get user contest rating, rank, and participation statistics
 */
router.get('/user/stats', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.json({
        rating: 1200,
        globalRank: '—',
        totalContests: 0,
        problemsSolved: 0,
      });
    }

    // Real submissions by user
    const submissions = await ContestSubmission.find({ userId });
    const acceptedSubmissions = submissions.filter((s) => s.verdict === 'Accepted');

    // Unique solved problems
    const solvedProblemKeys = new Set(
      acceptedSubmissions.map((s) => `${s.contestId}-${s.problemId}`)
    );

    // Contests user participated in
    const participatedContestIds = new Set(submissions.map((s) => s.contestId));

    // Also check registrations
    const registeredContests = await Contest.find({ 'participants.userId': userId });
    for (const c of registeredContests) {
      participatedContestIds.add(c.id);
    }

    // Total points earned
    const totalPoints = acceptedSubmissions.reduce((sum, s) => sum + (s.points || 0), 0);
    const calculatedRating = 1200 + Math.floor(totalPoints * 0.5);

    // Calculate rank among all users who submitted
    const allAccepted = await ContestSubmission.aggregate([
      { $match: { verdict: 'Accepted' } },
      { $group: { _id: '$userId', totalScore: { $sum: '$points' } } },
      { $sort: { totalScore: -1 } },
    ]);

    let globalRank = '—';
    const userIndex = allAccepted.findIndex((a) => a._id.equals(userId));
    if (userIndex !== -1) {
      globalRank = userIndex + 1;
    } else if (participatedContestIds.size > 0) {
      globalRank = allAccepted.length + 1;
    }

    res.json({
      rating: calculatedRating,
      globalRank,
      totalContests: participatedContestIds.size,
      problemsSolved: solvedProblemKeys.size,
    });
  } catch (err) {
    console.error('Error calculating user contest stats:', err);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

/**
 * GET /api/contests/leaderboard
 * Global or default contest leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const topSubmissions = await ContestSubmission.aggregate([
      { $match: { verdict: 'Accepted' } },
      {
        $group: {
          _id: '$userId',
          user: { $first: '$userName' },
          score: { $sum: '$points' },
          solved: { $addToSet: '$problemId' },
          totalTimeMs: { $sum: '$executionTimeMs' },
        },
      },
      {
        $project: {
          user: 1,
          score: 1,
          solved: { $size: '$solved' },
          totalTimeMs: 1,
        },
      },
      { $sort: { score: -1, solved: -1, totalTimeMs: 1 } },
      { $limit: 10 },
    ]);

    if (topSubmissions.length > 0) {
      const results = topSubmissions.map((s, index) => {
        const mins = Math.floor(s.totalTimeMs / 60000);
        const secs = Math.floor((s.totalTimeMs % 60000) / 1000);
        return {
          rank: index + 1,
          user: s.user || 'Contestant',
          score: s.score,
          solved: s.solved,
          time: `${mins}m ${secs}s`,
        };
      });
      return res.json(results);
    }

    // Default seeded leaderboard if no submissions exist yet
    res.json([
      { rank: 1, user: 'prompt_wizard', score: 4820, solved: 4, time: '12m 34s' },
      { rank: 2, user: 'agent_master', score: 4650, solved: 4, time: '13m 02s' },
      { rank: 3, user: 'ai_whisperer', score: 4510, solved: 4, time: '14m 18s' },
      { rank: 4, user: 'code_ninja_42', score: 4320, solved: 3, time: '15m 45s' },
      { rank: 5, user: 'dev_samurai', score: 4180, solved: 3, time: '16m 12s' },
      { rank: 6, user: 'neural_hacker', score: 3990, solved: 3, time: '17m 30s' },
      { rank: 7, user: 'syntax_sensei', score: 3840, solved: 3, time: '18m 05s' },
      { rank: 8, user: 'algo_queen', score: 3710, solved: 2, time: '19m 22s' },
      { rank: 9, user: 'byte_breaker', score: 3580, solved: 2, time: '20m 10s' },
      { rank: 10, user: 'prompt_pro', score: 3420, solved: 2, time: '21m 48s' },
    ]);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/contests/:id
 * Fetch single contest with assigned problems and user solving state
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const contestId = Number(req.params.id);
    const contest = await Contest.findOne({ id: contestId });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const userId = req.user?._id;
    const now = Date.now();
    const startMs = new Date(contest.startTime).getTime();
    const endMs = new Date(contest.endTime).getTime();

    let currentStatus = contest.status;
    if (now < startMs) currentStatus = 'upcoming';
    else if (now >= startMs && now <= endMs) currentStatus = 'live';
    else currentStatus = 'completed';

    // Fetch user submissions for this contest if authenticated
    let userSubmissions = [];
    if (userId) {
      userSubmissions = await ContestSubmission.find({ contestId, userId }).sort({ createdAt: -1 });
    }

    const solvedProblemIds = new Set(
      userSubmissions.filter((s) => s.verdict === 'Accepted').map((s) => s.problemId)
    );
    const attemptedProblemIds = new Set(userSubmissions.map((s) => s.problemId));

    // Format problems — hide hidden test cases from the client response to maintain judging integrity
    const problems = (contest.problems || []).map((p) => {
      const sampleCases = (p.testCases || [])
        .filter((tc) => !tc.isHidden)
        .map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput }));

      let status = 'unsolved';
      if (solvedProblemIds.has(p.id)) status = 'solved';
      else if (attemptedProblemIds.has(p.id)) status = 'attempted';

      return {
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        points: p.points,
        description: p.description,
        constraints: p.constraints,
        examples: p.examples,
        sampleTestCases: sampleCases,
        starterCode: p.starterCode,
        status,
      };
    });

    const isRegistered = userId
      ? contest.participants.some((p) => p.userId && p.userId.equals(userId))
      : false;

    const remainingMs = currentStatus === 'live' ? Math.max(0, endMs - now) : 0;

    res.json({
      id: contest.id,
      name: contest.name,
      type: contest.type,
      startTime: contest.startTime,
      endTime: contest.endTime,
      duration: contest.duration,
      durationMs: contest.durationMs,
      difficulty: contest.difficulty,
      status: currentStatus,
      remainingMs,
      description: contest.description,
      rules: contest.rules,
      scoring: contest.scoring,
      isRegistered,
      participantsCount: (contest.initialParticipantsCount || 0) + contest.participants.length,
      problems,
      userSubmissions: userSubmissions.map((s) => ({
        id: s._id,
        problemId: s.problemId,
        language: s.language,
        verdict: s.verdict,
        passedCount: s.passedCount,
        totalCount: s.totalCount,
        executionTimeMs: s.executionTimeMs,
        points: s.points,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error fetching contest detail:', err);
    res.status(500).json({ error: 'Failed to fetch contest detail' });
  }
});

/**
 * POST /api/contests/:id/register
 * Register user for contest
 */
router.post('/:id/register', protect, async (req, res) => {
  try {
    const contestId = Number(req.params.id);
    const contest = await Contest.findOne({ id: contestId });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const userId = req.user._id;
    const alreadyRegistered = contest.participants.some(
      (p) => p.userId && p.userId.equals(userId)
    );

    if (alreadyRegistered) {
      return res.json({
        success: true,
        message: 'You are already registered for this contest.',
        isRegistered: true,
        participantsCount: (contest.initialParticipantsCount || 0) + contest.participants.length,
      });
    }

    contest.participants.push({ userId, registeredAt: new Date() });
    await contest.save();

    res.json({
      success: true,
      message: 'Successfully registered for the contest!',
      isRegistered: true,
      participantsCount: (contest.initialParticipantsCount || 0) + contest.participants.length,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', message: err.message });
  }
});

/**
 * POST /api/contests/:id/run
 * Run code against sample or custom test cases
 */
router.post('/:id/run', optionalAuth, async (req, res) => {
  const { problemId, language, code, customInput } = req.body;
  const contestId = Number(req.params.id);

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    const contest = await Contest.findOne({ id: contestId });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const problem = contest.problems.find((p) => p.id === Number(problemId));
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found in contest' });
    }

    // If customInput is provided, run only against custom input
    if (customInput !== undefined && customInput !== null && customInput !== '') {
      const execResult = await executeCode({ language, code, input: customInput });
      return res.json({
        status: execResult.status,
        verdict: execResult.verdict,
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        executionTimeMs: execResult.executionTimeMs,
        isCustom: true,
      });
    }

    // Otherwise, execute against the problem's sample test cases
    const sampleCases = (problem.testCases || []).filter((tc) => !tc.isHidden);
    const testResults = [];
    let overallVerdict = 'Accepted';
    let totalTime = 0;

    for (let i = 0; i < sampleCases.length; i++) {
      const tc = sampleCases[i];
      const execResult = await executeCode({ language, code, input: tc.input });
      totalTime += execResult.executionTimeMs;

      if (execResult.status !== 'success') {
        overallVerdict = execResult.verdict;
        testResults.push({
          index: i + 1,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: execResult.stderr || execResult.stdout,
          passed: false,
          error: execResult.stderr,
        });
        break; // Stop on first error
      }

      const passed = compareOutputs(execResult.stdout, tc.expectedOutput);
      if (!passed && overallVerdict === 'Accepted') {
        overallVerdict = 'Wrong Answer';
      }

      testResults.push({
        index: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: execResult.stdout.trim(),
        passed,
      });
    }

    res.json({
      status: overallVerdict === 'Accepted' ? 'success' : 'failed',
      verdict: overallVerdict,
      totalTestCases: sampleCases.length,
      passedTestCases: testResults.filter((r) => r.passed).length,
      executionTimeMs: totalTime,
      testResults,
    });
  } catch (err) {
    console.error('Run code error:', err);
    res.status(500).json({ error: 'Execution failed', message: err.message });
  }
});

/**
 * POST /api/contests/:id/submit
 * Submit code against all test cases and record judging verdict
 */
router.post('/:id/submit', optionalAuth, async (req, res) => {
  const { problemId, language, code } = req.body;
  const contestId = Number(req.params.id);

  if (!req.user) {
    return res.status(401).json({
      error: 'Please log in to submit your solution and record your score',
      requireAuth: true,
    });
  }

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    const contest = await Contest.findOne({ id: contestId });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const problem = contest.problems.find((p) => p.id === Number(problemId));
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found in contest' });
    }

    const allTestCases = problem.testCases || [];
    let passedCount = 0;
    let overallVerdict = 'Accepted';
    let totalTime = 0;
    let failedDetails = null;

    for (let i = 0; i < allTestCases.length; i++) {
      const tc = allTestCases[i];
      const execResult = await executeCode({ language, code, input: tc.input });
      totalTime += execResult.executionTimeMs;

      if (execResult.status !== 'success') {
        overallVerdict = execResult.verdict;
        failedDetails = {
          testCaseNumber: i + 1,
          isHidden: tc.isHidden,
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput: execResult.stderr || execResult.stdout,
          error: execResult.stderr,
        };
        break;
      }

      const passed = compareOutputs(execResult.stdout, tc.expectedOutput);
      if (passed) {
        passedCount++;
      } else {
        overallVerdict = 'Wrong Answer';
        failedDetails = {
          testCaseNumber: i + 1,
          isHidden: tc.isHidden,
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput: execResult.stdout.trim(),
        };
        break;
      }
    }

    const points = overallVerdict === 'Accepted' ? problem.points : 0;

    // Save submission to database
    const submission = await ContestSubmission.create({
      contestId,
      problemId: problem.id,
      userId: req.user._id,
      userName: req.user.name || 'Anonymous',
      language,
      code,
      verdict: overallVerdict,
      passedCount,
      totalCount: allTestCases.length,
      executionTimeMs: totalTime,
      points,
      details: failedDetails,
    });

    res.json({
      success: true,
      submissionId: submission._id,
      verdict: overallVerdict,
      passedCount,
      totalCount: allTestCases.length,
      executionTimeMs: totalTime,
      points,
      failedDetails,
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Submission evaluation failed', message: err.message });
  }
});

export default router;
