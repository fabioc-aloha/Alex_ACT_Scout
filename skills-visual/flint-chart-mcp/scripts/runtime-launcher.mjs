#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const command = process.argv[2] ?? 'flint';

if (command !== 'flint') {
  console.error(`Unsupported runtime command: ${command}`);
  console.error('Usage: node runtime-launcher.mjs flint');
  process.exit(2);
}

const runtimeRoot = process.env.ALEX_ACT_SCOUT_FLINT_RUNTIME
  ?? join(homedir(), '.scout', 'plugin-data', 'alex-act-scout', 'flint-runtime');
const cliPath = join(runtimeRoot, 'node_modules', 'flint-chart-mcp', 'dist', 'cli.js');

if (!existsSync(cliPath)) {
  console.error(`Flint MCP CLI not found: ${cliPath}`);
  console.error('Run setup-flint-runtime first, then restart Scout.');
  process.exit(1);
}

const child = spawn(process.execPath, [cliPath], {
  stdio: 'inherit',
  windowsHide: true,
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Flint MCP exited from signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(`Failed to start Flint MCP: ${error.message}`);
  process.exit(1);
});
