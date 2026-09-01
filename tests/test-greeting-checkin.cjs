'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const checkin = require(path.join(
    __dirname, '..', 'skills', 'scout-greeting-checkin', 'scripts', 'scout-greeting-checkin.cjs'));

function temporary(prefix) {
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function write(file, content) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
}

test('reports package-owned setup without modifying any target', (t) => {
    const root = temporary('scout-greeting-checkin-');
    const packageRoot = path.join(root, 'package');
    const installedRoot = path.join(root, 'installed');
    const evidenceRoot = path.join(root, 'shared', 'component-evidence-data');
    const config = path.join(root, 'config', 'component-evidence.json');
    const registry = path.join(root, 'config', 'm-mcp-servers.json');
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));

    write(path.join(packageRoot, 'package.json'), JSON.stringify({ version: '2.0.3' }));
    write(path.join(packageRoot, 'scout-skills.json'), JSON.stringify([
        { name: 'critical-thinking' },
    ]));
    write(path.join(packageRoot, 'scout-skills-visual.json'), JSON.stringify([
        { name: 'flint-chart' },
    ]));
    write(path.join(packageRoot, 'skills', 'scout-greeting-checkin', 'package-manifest.json'), JSON.stringify({
        schemaVersion: 1,
        releaseRepository: 'https://example.test/Alex_ACT_Scout.git',
    }));
    write(path.join(installedRoot, 'critical-thinking', 'SKILL.md'), '# Critical Thinking\n');
    write(path.join(evidenceRoot, 'assessment.json'), '{}');
    write(path.join(evidenceRoot, 'component-evidence', 'events.ndjson'), '');
    write(path.join(root, 'shared', 'knowledge-base', 'index.md'), '# Knowledge base\n');
    write(config, JSON.stringify({ schemaVersion: 1, evidenceRoot }));
    write(registry, JSON.stringify({
        servers: {
            flint: {
                config: {
                    command: 'node',
                    args: [path.join(root, 'flint-launcher.mjs'), 'flint'],
                },
            },
        },
    }));

    const before = JSON.stringify(fs.readdirSync(root, { recursive: true }).sort());
    const report = checkin.inspect({
        packageRoot,
        installedRoot,
        config,
        mcpRegistry: registry,
    });

    assert.deepEqual(report.installation, {
        core: { expected: 1, installed: 1, missing: [] },
        visual: { expected: 1, installed: 0, missing: ['flint-chart'] },
    });
    assert.deepEqual(report.sharedData, {
        configured: true,
        ledgerReady: true,
        assessmentReady: true,
        knowledgeBaseReady: true,
    });
    assert.deepEqual(report.flint, {
        registered: true,
        launcherExists: false,
    });
    assert.equal(report.package.version, '2.0.3');
    assert.equal(JSON.stringify(fs.readdirSync(root, { recursive: true }).sort()), before);
});
