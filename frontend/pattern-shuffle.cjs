
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src/data/questions.js");
let fileContent = fs.readFileSync(filePath, "utf-8");

let contentToEval = fileContent.replace("export default questions;", "");
contentToEval += "\nmodule.exports = questions;";
const questions = eval(contentToEval);

const original = questions.slice(0, 28);
const newQs = questions.slice(28);

const easys = newQs.filter(q => q.difficulty === "Easy");
const mediums = newQs.filter(q => q.difficulty === "Medium");
const hards = newQs.filter(q => q.difficulty === "Hard");

const patterned = [];
while (easys.length > 0 || mediums.length > 0 || hards.length > 0) {
    if (easys.length > 0) patterned.push(easys.shift());
    if (mediums.length > 0) patterned.push(mediums.shift());
    if (hards.length > 0) patterned.push(hards.shift());
}

patterned.forEach((q, index) => {
    q.id = 29 + index;
});

const allQs = [...original, ...patterned];
const finalStr = "const questions = " + JSON.stringify(allQs, null, 2) + ";\n\nexport default questions;\n";
fs.writeFileSync(filePath, finalStr);
console.log("Patterned successfully");

