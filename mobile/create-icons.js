#!/usr/bin/env node
const { execFileSync } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'scripts', 'import-canva-icon.py');
execFileSync('python3', [script], { stdio: 'inherit' });
