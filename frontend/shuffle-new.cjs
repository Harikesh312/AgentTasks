
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src/data/questions.js");
let fileContent = fs.readFileSync(filePath, "utf-8");

// Try to parse the JS by stripping export and reading it
let contentToEval = fileContent.replace("export default questions;", "");
// Add module.exports so we can eval it easily
contentToEval += "\nmodule.exports = questions;";

const questions = eval(contentToEval);

const original = questions.slice(0, 28);
const newQs = questions.slice(28);

// Shuffle newQs
for (let i = newQs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newQs[i], newQs[j]] = [newQs[j], newQs[i]];
}

// Re-assign IDs to the shuffled array
newQs.forEach((q, index) => {
    q.id = 29 + index;
});

const allQs = [...original, ...newQs];

const finalStr = "const questions = " + JSON.stringify(allQs, null, 2) + ";\n\nexport default questions;\n";

fs.writeFileSync(filePath, finalStr);
console.log("Shuffled successfully");

