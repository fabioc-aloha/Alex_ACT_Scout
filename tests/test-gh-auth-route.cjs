'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const route = require(path.join(
    __dirname, '..', 'skills', 'git-workflow', 'scripts', 'gh-auth-route.cjs'));

test('routes a personal repository to its matching authenticated account', () => {
    const status = [
        'github.com',
        '  ✓ Logged in to github.com account owner-a (keyring)',
        '  - Active account: true',
        '  ✓ Logged in to github.com account owner-b (keyring)',
        '  - Active account: false',
    ].join('\n');

    assert.deepEqual(route.selectRoute('owner-b/example', status), {
        repository: 'owner-b/example',
        owner: 'owner-b',
        accounts: ['owner-a', 'owner-b'],
        activeAccount: 'owner-a',
        targetAccount: 'owner-b',
        action: 'switch',
    });
});

test('does not guess an account for organization-owned repositories', () => {
    const status = [
        'github.com',
        '  ✓ Logged in to github.com account fabioc-aloha (keyring)',
        '  - Active account: true',
    ].join('\n');

    assert.deepEqual(route.selectRoute('m365-core/project', status), {
        repository: 'm365-core/project',
        owner: 'm365-core',
        accounts: ['fabioc-aloha'],
        activeAccount: 'fabioc-aloha',
        targetAccount: null,
        action: 'manual-selection-required',
    });
});
