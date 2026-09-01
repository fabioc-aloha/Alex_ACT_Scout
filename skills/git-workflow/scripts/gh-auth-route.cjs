#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');

function parseRepository(value) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) {
        throw new Error('--repo must be an owner/repository identifier');
    }
    return value;
}

function parseAccounts(status) {
    const accounts = [];
    let activeAccount = null;
    let lastAccount = null;
    for (const line of String(status).split(/\r?\n/)) {
        const account = line.match(/Logged in to github\.com account ([^\s(]+)/);
        if (account) {
            lastAccount = account[1];
            accounts.push(lastAccount);
        }
        if (/Active account:\s*true/i.test(line) && lastAccount) activeAccount = lastAccount;
    }
    return { accounts: [...new Set(accounts)].sort(), activeAccount };
}

function selectRoute(repository, status) {
    const normalizedRepository = parseRepository(repository);
    const owner = normalizedRepository.split('/')[0];
    const { accounts, activeAccount } = parseAccounts(status);
    const targetAccount = accounts.includes(owner) ? owner : null;
    return {
        repository: normalizedRepository,
        owner,
        accounts,
        activeAccount,
        targetAccount,
        action: targetAccount ? targetAccount === activeAccount ? 'already-selected' : 'switch' : 'manual-selection-required',
    };
}

function parseArgs(args) {
    const [command, ...rest] = args;
    if (!['status', 'switch'].includes(command)) {
        throw new Error(`unknown GitHub auth command: ${command || '<missing>'}`);
    }
    const options = { command, apply: false, repo: null };
    for (let index = 0; index < rest.length; index += 1) {
        const argument = rest[index];
        if (argument === '--apply') {
            options.apply = true;
        } else if (argument === '--repo') {
            const value = rest[index + 1];
            if (!value || value.startsWith('--')) throw new Error('--repo requires a value');
            options.repo = parseRepository(value);
            index += 1;
        } else {
            throw new Error(`unknown argument: ${argument}`);
        }
    }
    if (!options.repo) throw new Error('--repo is required');
    return options;
}

function executeGh(args) {
    const result = spawnSync('gh', args, { encoding: 'utf8' });
    if (result.error) throw result.error;
    if (result.status !== 0) {
        throw new Error(`gh ${args.join(' ')} failed: ${(result.stderr || result.stdout).trim()}`);
    }
    return `${result.stdout || ''}${result.stderr || ''}`;
}

function inspectRoute(repository) {
    return selectRoute(repository, executeGh(['auth', 'status', '--hostname', 'github.com']));
}

function run(options) {
    const route = inspectRoute(options.repo);
    if (options.command === 'status') return { schemaVersion: 1, command: 'status', ...route };
    if (!route.targetAccount) {
        throw new Error(`repository owner ${route.owner} does not match a configured gh account; select an authorized account explicitly`);
    }
    if (route.action === 'already-selected' && !options.apply) {
        return { schemaVersion: 1, command: 'switch', apply: options.apply, status: 'already-selected', ...route };
    }
    if (!options.apply) {
        return { schemaVersion: 1, command: 'switch', apply: false, status: 'ready', ...route };
    }
    if (route.action === 'switch') {
        executeGh(['auth', 'switch', '--hostname', 'github.com', '--user', route.targetAccount]);
    }
    executeGh(['auth', 'setup-git', '--hostname', 'github.com']);
    const resolved = JSON.parse(executeGh(['repo', 'view', route.repository, '--json', 'nameWithOwner']));
    if (resolved.nameWithOwner !== route.repository) {
        throw new Error('selected gh account cannot verify the requested repository');
    }
    const verifiedRoute = inspectRoute(options.repo);
    if (verifiedRoute.activeAccount !== route.targetAccount) {
        throw new Error('gh did not activate the requested account');
    }
    return { schemaVersion: 1, command: 'switch', apply: true, status: 'switched', ...verifiedRoute };
}

function main() {
    try {
        process.stdout.write(`${JSON.stringify(run(parseArgs(process.argv.slice(2))), null, 2)}\n`);
    } catch (error) {
        process.stderr.write(`gh-auth-route: ${error.message}\n`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = { parseAccounts, parseArgs, parseRepository, selectRoute };
