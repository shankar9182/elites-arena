const fs = require('fs');
const filePath = 'd:/elites arena/client/src/pages/PlayerDashboard.jsx';
const content = fs.readFileSync(filePath, 'utf8');

const openDivs = (content.match(/<div/g) || []).length;
const closeDivs = (content.match(/<\/div>/g) || []).length;
const openBraces = (content.match(/\{/g) || []).length;
const closeBraces = (content.match(/\}/g) || []).length;
const openParens = (content.match(/\(/g) || []).length;
const closeParens = (content.match(/\)/g) || []).length;

console.log(`Divs: <div ${openDivs}, </div> ${closeDivs}`);
console.log(`Braces: { ${openBraces}, } ${closeBraces}`);
console.log(`Parens: ( ${openParens}, ) ${closeParens}`);

// Find unclosed elements
let stack = [];
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Simple check for unclosed blocks
}
