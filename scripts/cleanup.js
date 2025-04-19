// Script to clean up duplicate .js files where a .ts file exists
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Find duplicate JS files (where a TS file with the same name exists)
const duplicates = new Set();

walkDir(path.join(projectRoot, 'src'), (filePath) => {
  if (filePath.endsWith('.js')) {
    const tsPath = filePath.replace(/\.js$/, '.ts');
    const tsxPath = filePath.replace(/\.js$/, '.tsx');
    
    if (fs.existsSync(tsPath) || fs.existsSync(tsxPath)) {
      duplicates.add(filePath);
    }
  }
});

console.log(`Found ${duplicates.size} duplicate JavaScript files to remove:`);
duplicates.forEach(file => {
  console.log(`- ${file}`);
  // Uncomment the next line to actually delete the files
  // fs.unlinkSync(file);
});

console.log("\nReview the list above, then edit this script to uncomment the fs.unlinkSync line to actually delete the files.");
console.log("Or run with --delete flag to delete immediately.");

// If run with --delete flag, delete the files
if (process.argv.includes('--delete')) {
  duplicates.forEach(file => {
    console.log(`Deleting ${file}...`);
    fs.unlinkSync(file);
  });
  console.log(`Deleted ${duplicates.size} duplicate JavaScript files.`);
} 