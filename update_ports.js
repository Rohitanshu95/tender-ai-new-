import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/rohitanshu.dhar/Desktop/projects/procurement/client/src';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

walk(dir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('localhost:5000')) {
      console.log(`Updating ${filePath}`);
      content = content.replace(/localhost:5000/g, 'localhost:5001');
      fs.writeFileSync(filePath, content);
    }
  }
});
