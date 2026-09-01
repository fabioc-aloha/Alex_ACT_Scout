'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const evidenceScript = path.join(
    root, 'skills', 'component-evidence', 'scripts', 'component-evidence.cjs');

function temporary(prefix) {
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function run(...args) {
    return JSON.parse(execFileSync(process.execPath, [evidenceScript, ...args], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
    }));
}

test('records minimal opt-in outcomes and combines them with static assessment', (t) => {
    const evidenceRoot = temporary('scout-component-evidence-');
    t.after(() => fs.rmSync(evidenceRoot, { recursive: true, force: true }));
    const assessment = path.join(evidenceRoot, 'assessment.json');
    fs.writeFileSync(assessment, JSON.stringify({
        schemaVersion: 2,
        skillImportance: [{
            id: 'compile-brain',
            path: 'skills/compile-brain/SKILL.md',
            staticImportanceScore: 30,
            maximumScore: 60,
            signals: {
                inboundRoutes: 1,
                outboundRoutes: 0,
                bundledResources: 1,
                uniqueBody: true,
            },
        }],
    }));

    assert.equal(run('bootstrap', '--evidence-root', evidenceRoot).apply, false);
    run('bootstrap', '--evidence-root', evidenceRoot, '--apply');
    assert.equal(run(
        'record',
        '--evidence-root', evidenceRoot,
        '--component', 'compile-brain',
        '--outcome', 'helped',
        '--timestamp', '2026-08-31T21:40:00Z',
    ).apply, false);

    const recorded = run(
        'record',
        '--evidence-root', evidenceRoot,
        '--component', 'compile-brain',
        '--outcome', 'helped',
        '--timestamp', '2026-08-31T21:40:00Z',
        '--apply',
    );
    assert.equal(recorded.status, 'recorded');

    const events = fs.readFileSync(
        path.join(evidenceRoot, 'component-evidence', 'events.ndjson'),
        'utf8',
    ).trim().split('\n').map((line) => JSON.parse(line));
    assert.deepEqual(events, [{
        schemaVersion: 1,
        component: 'compile-brain',
        outcome: 'helped',
        timestamp: '2026-08-31T21:40:00.000Z',
    }]);

    const report = run(
        'report',
        '--evidence-root', evidenceRoot,
        '--assessment', assessment,
    );
    assert.deepEqual(report.components, [{
        component: 'compile-brain',
        staticImportance: {
            score: 30,
            maximumScore: 60,
            signals: {
                inboundRoutes: 1,
                outboundRoutes: 0,
                bundledResources: 1,
                uniqueBody: true,
            },
        },
        usage: {
            recordedUses: 0,
            lastUsedAt: null,
        },
        usefulness: {
            recordedOutcomes: 1,
            helped: 1,
            neutral: 0,
            notHelpful: 0,
            score: 67,
            confidence: 'low',
            lastRecordedAt: '2026-08-31T21:40:00.000Z',
        },
        hybridScore: 60,
    }]);
});

test('records unique meditation inventory entries separately from usefulness outcomes', (t) => {
    const evidenceRoot = temporary('scout-component-inventory-');
    t.after(() => fs.rmSync(evidenceRoot, { recursive: true, force: true }));
    const assessment = path.join(evidenceRoot, 'assessment.json');
    fs.writeFileSync(assessment, JSON.stringify({
        schemaVersion: 2,
        skillImportance: [{
            id: 'compile-brain',
            path: 'skills/compile-brain/SKILL.md',
            staticImportanceScore: 30,
            maximumScore: 60,
            signals: {
                inboundRoutes: 1,
                outboundRoutes: 0,
                bundledResources: 1,
                uniqueBody: true,
            },
        }],
    }));

    run('bootstrap', '--evidence-root', evidenceRoot, '--apply');
    const preview = run(
        'inventory',
        '--evidence-root', evidenceRoot,
        '--components', 'compile-brain,compile-brain',
        '--timestamp', '2026-08-31T22:15:00Z',
    );
    assert.deepEqual(preview.components, ['compile-brain']);
    assert.equal(preview.apply, false);

    const recorded = run(
        'inventory',
        '--evidence-root', evidenceRoot,
        '--components', 'compile-brain,compile-brain',
        '--timestamp', '2026-08-31T22:15:00Z',
        '--apply',
    );
    assert.equal(recorded.status, 'recorded');
    assert.equal(recorded.recordedUses, 1);

    const report = run(
        'report',
        '--evidence-root', evidenceRoot,
        '--assessment', assessment,
    );
    assert.deepEqual(report.components, [{
        component: 'compile-brain',
        staticImportance: {
            score: 30,
            maximumScore: 60,
            signals: {
                inboundRoutes: 1,
                outboundRoutes: 0,
                bundledResources: 1,
                uniqueBody: true,
            },
        },
        usage: {
            recordedUses: 1,
            lastUsedAt: '2026-08-31T22:15:00.000Z',
        },
        usefulness: {
            recordedOutcomes: 0,
            helped: 0,
            neutral: 0,
            notHelpful: 0,
            score: null,
            confidence: 'none',
            lastRecordedAt: null,
        },
        hybridScore: null,
    }]);
});

test('uses an explicit configured evidence root and rejects components outside its assessment', (t) => {
    const evidenceRoot = temporary('scout-component-configured-root-');
    const config = path.join(temporary('scout-component-config-'), 'component-evidence.json');
    fs.writeFileSync(path.join(evidenceRoot, 'assessment.json'), JSON.stringify({
        schemaVersion: 2,
        skillImportance: [{
            id: 'compile-brain',
            path: 'skills/compile-brain/SKILL.md',
            staticImportanceScore: 30,
            maximumScore: 60,
            signals: {
                inboundRoutes: 1,
                outboundRoutes: 0,
                bundledResources: 1,
                uniqueBody: true,
            },
        }],
    }));
    t.after(() => {
        fs.rmSync(evidenceRoot, { recursive: true, force: true });
        fs.rmSync(path.dirname(config), { recursive: true, force: true });
    });

    const configured = run(
        'configure',
        '--config', config,
        '--evidence-root', evidenceRoot,
        '--apply',
    );
    assert.equal(configured.status, 'configured');
    run('bootstrap', '--config', config, '--apply');

    const inventory = run(
        'inventory',
        '--config', config,
        '--components', 'compile-brain',
        '--timestamp', '2026-08-31T22:30:00Z',
        '--apply',
    );
    assert.equal(inventory.status, 'recorded');
    assert.throws(() => run(
        'inventory',
        '--config', config,
        '--components', 'act-meditation-continuity',
    ), /not present in the configured assessment/);
});
