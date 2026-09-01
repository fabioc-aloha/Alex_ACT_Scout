'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const setupScript = path.join(
    root, 'skills', 'scout-shared-data-setup', 'scripts', 'scout-shared-data-setup.cjs');

function temporary(prefix) {
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function run(...args) {
    return JSON.parse(execFileSync(process.execPath, [setupScript, ...args], {
        cwd: root,
        encoding: 'utf8',
    }));
}

test('previews and bootstraps configured evidence and knowledge-base folders', (t) => {
    const sharedRoot = temporary('scout-shared-data-');
    const config = path.join(temporary('scout-shared-data-config-'), 'component-evidence.json');
    t.after(() => {
        fs.rmSync(sharedRoot, { recursive: true, force: true });
        fs.rmSync(path.dirname(config), { recursive: true, force: true });
    });

    const preview = run('bootstrap', '--shared-root', sharedRoot, '--config', config);
    assert.equal(preview.apply, false);
    assert.equal(preview.assessment.status, 'missing');
    assert.equal(fs.existsSync(config), false);
    assert.equal(fs.existsSync(path.join(sharedRoot, 'component-evidence-data')), false);
    assert.equal(fs.existsSync(path.join(sharedRoot, 'knowledge-base')), false);

    const applied = run('bootstrap', '--shared-root', sharedRoot, '--config', config, '--apply');
    assert.equal(applied.status, 'bootstrapped');
    assert.deepEqual(JSON.parse(fs.readFileSync(config, 'utf8')), {
        schemaVersion: 1,
        evidenceRoot: path.join(sharedRoot, 'component-evidence-data'),
    });
    assert.equal(fs.existsSync(path.join(
        sharedRoot, 'component-evidence-data', 'component-evidence', 'events.ndjson')), true);
    assert.equal(fs.existsSync(path.join(sharedRoot, 'knowledge-base', 'index.md')), true);
    assert.equal(fs.existsSync(path.join(sharedRoot, 'component-evidence-data', 'assessment.json')), false);
});
