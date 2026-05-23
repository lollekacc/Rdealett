#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules']);

const walk = (directory, results = []) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(path.join(directory, entry.name), results);
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(path.join(directory, entry.name));
    }
  }

  return results;
};

const files = walk(ROOT).sort();
let failed = false;

for (const file of files) {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    failed = true;
    const relativePath = path.relative(ROOT, file);
    console.error(`${relativePath}: ${error.message}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Checked ${files.length} JSON files.`);
