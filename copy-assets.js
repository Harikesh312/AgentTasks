import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Since this script is now in the root AgentPrep directory, 
// we point directly to the frontend/public directory
const destDir = path.join(__dirname, 'frontend', 'public');

// Ensure the directory exists
if (!fs.existsSync(destDir)) {
  console.log(`Directory ${destDir} doesn't exist, please run from the correct directory.`);
  process.exit(1);
}

const files = [
  { src: 'C:\\Users\\rawat\\.gemini\\antigravity-ide\\brain\\09ef881e-e226-486a-960a-0d3385dc81a5\\discuss_hero_1786975264706.jpg', dest: 'discuss_hero.jpg' },
  { src: 'C:\\Users\\rawat\\.gemini\\antigravity-ide\\brain\\09ef881e-e226-486a-960a-0d3385dc81a5\\contest_hero_1786934156642.jpg', dest: 'contest-hero.jpg' },
  { src: 'C:\\Users\\rawat\\.gemini\\antigravity-ide\\brain\\09ef881e-e226-486a-960a-0d3385dc81a5\\gold_trophy_1786935616680.jpg', dest: 'gold_trophy.jpg' },
  { src: 'C:\\Users\\rawat\\.gemini\\antigravity-ide\\brain\\09ef881e-e226-486a-960a-0d3385dc81a5\\silver_medal_1786936116531.jpg', dest: 'silver_medal.jpg' },
  { src: 'C:\\Users\\rawat\\.gemini\\antigravity-ide\\brain\\09ef881e-e226-486a-960a-0d3385dc81a5\\bronze_medal_1786936401145.jpg', dest: 'bronze_medal.jpg' }
];

files.forEach(f => {
  try {
    fs.copyFileSync(f.src, path.join(destDir, f.dest));
    console.log('Successfully copied ' + f.dest);
  } catch (e) {
    console.error('Failed to copy ' + f.dest, e.message);
  }
});
