import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Discussion from './models/Discussion.js';
import Reply from './models/Reply.js';
import questions from '../frontend/src/data/questions.js';

dotenv.config();

const SEED_USERS = [
  { name: 'Alex', email: 'alex@seed.local', password: 'password123' },
  { name: 'Priya', email: 'priya@seed.local', password: 'password123' },
  { name: 'Rahul', email: 'rahul@seed.local', password: 'password123' },
  { name: 'Aarav', email: 'aarav@seed.local', password: 'password123' },
  { name: 'Maya', email: 'maya@seed.local', password: 'password123' }
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDateWithinDays(days) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  date.setHours(date.getHours() - Math.floor(Math.random() * 24));
  return date;
}

function getRandomUpvotes(users, count) {
  const shuffled = [...users].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(u => u._id);
}

function generateDiscussionContent(problem, type, seedUsers) {
  const reqSample = problem.requirements && problem.requirements.length > 0 
    ? problem.requirements[0].toLowerCase() 
    : 'the main layout';

  switch (type) {
    case 'Question':
      return {
        title: `How did you handle ${reqSample}?`,
        content: `I can get the overall layout close, but my implementation of ${reqSample} still looks slightly different from the reference. What approach worked for you when dealing with this ${problem.category.toLowerCase()}?`,
        tags: [problem.category.split(' ')[0], 'Help', 'UI']
      };
    case 'Solution':
      return {
        title: `Best approach for ${problem.title.split(' ')[0]}`,
        content: `I found that focusing on the ${reqSample} first gave me a much closer result overall. If you make sure to follow the constraints, the agent handles the rest surprisingly well.`,
        tags: ['Solution', 'Guide']
      };
    case 'Issue':
      return {
        title: `Agent ignores ${reqSample}`,
        content: `My preview looks correct initially, but the agent keeps ignoring the requirement for ${reqSample}. Is anyone else seeing this? I had to explicitly tell it to fix it in a follow-up turn.`,
        tags: ['Issue', 'Agent Behavior']
      };
    case 'Tip':
      return {
        title: `Tip: Focus on the ${problem.category.toLowerCase()} structure`,
        content: `A small adjustment to how you prompt the ${problem.category.toLowerCase()} structure makes the final result much closer to the reference. Don't overcomplicate the instructions.`,
        tags: ['Tip', 'Strategy']
      };
    case 'Prompt':
      return {
        title: `This prompt worked best for me`,
        content: `I used this exact prompt and got a nearly perfect score on the first try:\n\n"Build a ${problem.category.toLowerCase()} that includes ${reqSample}. Make sure to strictly follow the reference design and use modern CSS practices."\n\nHope this helps someone!`,
        tags: ['Prompt', 'Success']
      };
    default:
      return {
        title: `Thoughts on ${problem.title}?`,
        content: `Just finished this problem. It was definitely a ${problem.difficulty.toLowerCase()} one.`,
        tags: ['General']
      };
  }
}

function generateReplies(discussionType, problem, users, discussionAuthorId) {
  const reqSample = problem.requirements && problem.requirements.length > 0 
    ? problem.requirements[0].toLowerCase() 
    : 'the main layout';

  const otherUsers = users.filter(u => u._id.toString() !== discussionAuthorId.toString());
  
  if (discussionType === 'Question') {
    return [
      {
        author: getRandomItem(otherUsers)._id,
        content: `I used a flexbox container and adjusted the gaps rather than adding individual margins. That seemed to fix the issues with ${reqSample}.`,
        isAccepted: true
      },
      {
        author: getRandomItem(otherUsers)._id,
        content: `Same here. The agent usually gets it right if you specify the exact layout model to use.`,
        isAccepted: false
      },
      {
        author: getRandomItem(otherUsers)._id,
        content: `I actually found grid to be much easier for this specific problem.`,
        isAccepted: false
      }
    ].slice(0, Math.floor(Math.random() * 3) + 2); // 2 to 4 replies
  }
  
  if (discussionType === 'Solution') {
    return [
      {
        author: getRandomItem(otherUsers)._id,
        content: `Great find! I was struggling with exactly this part.`,
        isAccepted: false
      },
      {
        author: getRandomItem(otherUsers)._id,
        content: `I tried this but the agent still messed up the colors. Any tips for that?`,
        isAccepted: false
      }
    ].slice(0, Math.floor(Math.random() * 2) + 1); // 1 to 2 replies
  }

  if (discussionType === 'Issue') {
    return [
      {
        author: getRandomItem(otherUsers)._id,
        content: `Yes, I noticed this too. The agent seems to struggle with ${reqSample} on the first pass.`,
        isAccepted: false
      },
      {
        author: getRandomItem(otherUsers)._id,
        content: `You just have to be very explicit in your first prompt. Tell it exactly how to structure it.`,
        isAccepted: false
      }
    ].slice(0, Math.floor(Math.random() * 2) + 2); // 2 to 3 replies
  }

  return [
    {
      author: getRandomItem(otherUsers)._id,
      content: `Thanks for sharing this!`,
      isAccepted: false
    }
  ];
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Ensure Seed Users
    const dbUsers = [];
    for (const userData of SEED_USERS) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created seed user: ${user.name}`);
      }
      dbUsers.push(user);
    }

    // 2. Iterate through problems and seed discussions
    const types = ['Question', 'Solution', 'Issue', 'Tip', 'Prompt'];

    let totalDiscussionsCreated = 0;
    let totalRepliesCreated = 0;

    for (const problem of questions) {
      const count = await Discussion.countDocuments({ problemId: problem.id });
      
      if (count < 5) {
        const needed = 5 - count;
        console.log(`Problem ${problem.id} (${problem.title}) needs ${needed} discussions. Seeding...`);

        // We want a balanced mix, so we pick from 'types' array
        const typesToUse = [...types].sort(() => 0.5 - Math.random()).slice(0, needed);

        for (const type of typesToUse) {
          const author = getRandomItem(dbUsers);
          const { title, content, tags } = generateDiscussionContent(problem, type, dbUsers);
          const createdAt = getRandomDateWithinDays(14);
          
          const upvotesCount = Math.floor(Math.random() * 15) + 1; // 1 to 15 upvotes
          const upvotes = getRandomUpvotes(dbUsers, Math.min(upvotesCount, dbUsers.length));

          // Create Discussion
          const discussion = await Discussion.create({
            problemId: problem.id,
            author: author._id,
            title,
            content,
            type,
            tags,
            upvotes,
            views: Math.floor(Math.random() * 100) + 10,
            repliesCount: 0,
            hasAcceptedAnswer: false,
            createdAt,
            updatedAt: createdAt
          });

          totalDiscussionsCreated++;

          // Create Replies
          const repliesData = generateReplies(type, problem, dbUsers, author._id);
          let hasAccepted = false;

          for (let i = 0; i < repliesData.length; i++) {
            const replyData = repliesData[i];
            const replyCreatedAt = new Date(createdAt.getTime() + (Math.random() * 86400000)); // Within 24h of discussion

            const replyUpvotesCount = Math.floor(Math.random() * 5);
            const replyUpvotes = getRandomUpvotes(dbUsers, Math.min(replyUpvotesCount, dbUsers.length));

            const isAccepted = type === 'Question' && replyData.isAccepted;
            if (isAccepted) hasAccepted = true;

            await Reply.create({
              discussionId: discussion._id,
              author: replyData.author,
              content: replyData.content,
              upvotes: replyUpvotes,
              isAccepted,
              createdAt: replyCreatedAt,
              updatedAt: replyCreatedAt
            });

            totalRepliesCreated++;
          }

          // Update discussion stats
          discussion.repliesCount = repliesData.length;
          discussion.hasAcceptedAnswer = hasAccepted;
          await discussion.save();
        }
      } else {
        console.log(`Problem ${problem.id} already has ${count} discussions. Skipping.`);
      }
    }

    console.log(`\nSeeding complete!`);
    console.log(`Created ${totalDiscussionsCreated} discussions and ${totalRepliesCreated} replies.`);
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
