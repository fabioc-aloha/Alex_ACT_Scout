'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const knowledgeScript = path.join(
    root, 'skills', 'scout-knowledge-base', 'scripts', 'scout-knowledge-base.cjs');

function temporary(prefix) {
    return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

test('Scout v2.0.2 release metadata and catalogs are publishable', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
    const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'scout-skills.json'), 'utf8'));
    const visualCatalog = JSON.parse(fs.readFileSync(path.join(root, 'scout-skills-visual.json'), 'utf8'));

    assert.equal(packageJson.version, '2.0.2');
    assert.equal(version, packageJson.version);
    assert.equal(packageJson.private, true);
    assert.match(changelog, /## \[Unreleased\][\s\S]*## \[2\.0\.2\] - 2026-08-31[\s\S]*## \[2\.0\.1\] - 2026-08-31[\s\S]*## \[2\.0\.0\] - 2026-08-31[\s\S]*## \[1\.0\.0\] - 2026-08-15/);
    assert.equal(catalog.length, 30);
    assert.equal(visualCatalog.length, 6);
});

test('Scout knowledge base previews, validates, deposits, and indexes reviewed lessons', (t) => {
    const target = temporary('scout-knowledge-base-');
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));
    const lesson = path.join(target, 'lesson.md');
    fs.writeFileSync(lesson, [
        '---',
        'title: Verify | before reporting success',
        'category: procedures',
        'created: 2099-01-02',
        'confidence: high',
        'tags: verification|testing',
        '---',
        '',
        '# Verify before reporting success',
        '',
        '## Lesson',
        '',
        'Run the executable check before claiming completion.',
        '',
    ].join('\n'));
    const bootstrapArgs = [knowledgeScript, 'bootstrap', '--shared-root', target];
    const preview = JSON.parse(execFileSync(process.execPath, bootstrapArgs, {
        cwd: root, encoding: 'utf8',
    }));
    assert.equal(preview.apply, false);
    execFileSync(process.execPath, [...bootstrapArgs, '--apply'], { cwd: root, encoding: 'utf8' });

    const validation = JSON.parse(execFileSync(process.execPath, [
        knowledgeScript, 'validate', '--record-file', lesson,
    ], { cwd: root, encoding: 'utf8' }));
    assert.equal(validation.status, 'valid');

    const depositArgs = [
        knowledgeScript, 'deposit', '--shared-root', target, '--record-file', lesson,
    ];
    assert.equal(JSON.parse(execFileSync(process.execPath, depositArgs, {
        cwd: root, encoding: 'utf8',
    })).apply, false);
    const deposited = JSON.parse(execFileSync(process.execPath, [...depositArgs, '--apply'], {
        cwd: root, encoding: 'utf8',
    }));
    assert.equal(deposited.status, 'deposited');
    assert.equal(fs.existsSync(path.join(target, 'knowledge-base', 'procedures', deposited.filename)), true);
    assert.match(fs.readFileSync(path.join(target, 'knowledge-base', 'index.md'), 'utf8'),
        /Verify \\| before reporting success/);
    assert.match(fs.readFileSync(path.join(target, 'knowledge-base', 'index.md'), 'utf8'),
        /verification\\|testing/);
});

test('Scout installer preserves continuity scripts in the installed skill payload', (t) => {
    const target = temporary('scout-install-continuity-');
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));
    execFileSync('powershell.exe', [
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'install.ps1'),
        '-Destination', target, '-Apply',
    ], { cwd: root, encoding: 'utf8' });
    assert.equal(fs.existsSync(path.join(
        target, 'scout-knowledge-base', 'scripts', 'scout-knowledge-base.cjs')), true);
    assert.equal(fs.existsSync(path.join(
        target, 'component-evidence', 'scripts', 'component-evidence.cjs')), true);
});

test('Scout installer removes retired message bus skills from an existing install', (t) => {
    const target = temporary('scout-install-retired-skills-');
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));
    for (const skill of ['scout-message-bus', 'scout-message-bus-heartbeat']) {
        fs.mkdirSync(path.join(target, skill), { recursive: true });
        fs.writeFileSync(path.join(target, skill, 'SKILL.md'), '# Retired skill\n');
    }

    execFileSync('powershell.exe', [
        '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'install.ps1'),
        '-Destination', target, '-Apply',
    ], { cwd: root, encoding: 'utf8' });

    assert.equal(fs.existsSync(path.join(target, 'scout-message-bus')), false);
    assert.equal(fs.existsSync(path.join(target, 'scout-message-bus-heartbeat')), false);
});

test('Scout catalog excludes retired message bus capabilities', () => {
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'scout-skills.json'), 'utf8'));

    assert.equal(catalog.some((skill) => skill.name === 'scout-message-bus'), false);
    assert.equal(catalog.some((skill) => skill.name === 'scout-message-bus-heartbeat'), false);
});
