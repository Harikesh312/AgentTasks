import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Question from '../models/Question.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedAdminAndQuestions = async () => {
  try {
    // 1. Seed Admin
    const adminEmail = 'priyarwt@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('Seeding admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('priyah@4123', salt);
      
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user seeded.');
    } else if (adminExists.role !== 'admin') {
      // Ensure the role is set to admin if account exists but wasn't admin
      adminExists.role = 'admin';
      await adminExists.save();
      console.log('User upgraded to admin.');
    }

    // 2. Seed Questions if empty
    const count = await Question.countDocuments();
    if (count === 0) {
      console.log('Seeding initial questions from data file...');
      try {
        // Read the hardcoded questions.js from frontend (it's a JS module, so we can't just JSON.parse it directly).
        // For simplicity since we are running in the backend, let's dynamically import it or use a simplified JSON version.
        // We'll construct the path. However, JS module export from frontend may be tricky. Let's just re-declare the core seed data here if we can't load it.
        // Let's try importing it. It might fail if there are React imports, but questions.js has none.
        const questionsModulePath = path.resolve(__dirname, '../../frontend/src/data/questions.js');
        const fileContent = fs.readFileSync(questionsModulePath, 'utf8');
        
        // Very basic parsing hack to extract the array, or we can just evaluate it
        // A safer way is to use a dynamic import:
        const fileUrl = 'file://' + questionsModulePath.replace(/\\/g, '/');
        const { default: questionsArray } = await import(fileUrl);
        
        await Question.insertMany(questionsArray);
        console.log('Questions seeded successfully.');
      } catch (err) {
        console.error('Failed to seed questions from frontend data:', err);
      }
    }
  } catch (error) {
    console.error('Error in seedAdminAndQuestions:', error);
  }
};
