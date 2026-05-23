#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules']);
const TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.txt',
  '.yaml',
  '.yml',
]);

const walk = (directory, results = []) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(path.join(directory, entry.name), results);
      }
      continue;
    }

    if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      results.push(path.join(directory, entry.name));
    }
  }

  return results;
};

const files = walk(ROOT).sort();
const failures = [];

for (const file of files) {
  const relativePath = path.relative(ROOT, file);
  const lines = fs.readFileSync(file, 'utf8').split(/\n/);

  lines.forEach((line, index) => {
    if (/[ \t]$/.test(line)) {
      failures.push(`${relativePath}:${index + 1}: trailing whitespace`);
    }
  });
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Checked whitespace in ${files.length} text files.`);
