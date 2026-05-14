
import fs from 'fs';
import * as parser from '@babel/parser';

const code = fs.readFileSync('c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src/components/AnalysisMatrix.jsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('Successfully parsed');
} catch (e) {
  console.log('Parse error:');
  console.log(e.message);
  console.log('At position:', e.pos);
  console.log('Line:', e.loc.line, 'Column:', e.loc.column);
}
