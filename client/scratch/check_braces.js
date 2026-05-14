
import fs from 'fs';
const content = fs.readFileSync('c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/components/AnalysisMatrix.jsx', 'utf8');
let stack = [];
let line = 1;
for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') line++;
    if (content[i] === '{') stack.push(line);
    if (content[i] === '}') {
        if (stack.length === 0) {
            console.log(`Unmatched } at line ${line}`);
        } else {
            stack.pop();
        }
    }
}
if (stack.length > 0) {
    console.log(`Unmatched { at lines: ${stack.join(', ')}`);
} else {
    console.log('Braces are balanced');
}
