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

test('Scout v2.0.6 release metadata and catalogs are publishable', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
    const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'scout-skills.json'), 'utf8'));
    const visualCatalog = JSON.parse(fs.readFileSync(path.join(root, 'scout-skills-visual.json'), 'utf8'));

    assert.equal(packageJson.version, '2.0.6');
    assert.equal(version, packageJson.version);
    assert.equal(packageJson.private, true);
    assert.match(changelog, /## \[Unreleased\][\s\S]*## \[2\.0\.6\] - 2026-09-01[\s\S]*## \[2\.0\.5\] - 2026-09-01[\s\S]*## \[2\.0\.4\] - 2026-09-01[\s\S]*## \[2\.0\.3\] - 2026-09-01[\s\S]*## \[2\.0\.2\] - 2026-08-31[\s\S]*## \[2\.0\.1\] - 2026-08-31[\s\S]*## \[1\.0\.0\] - 2026-08-15/);
    assert.equal(catalog.length, 32);
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
    assert.equal(fs.existsSync(path.join(
        target, 'scout-shared-data-setup', 'scripts', 'scout-shared-data-setup.cjs')), true);
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

test('Mermaid skill selects custom SVG when needed and checks document drift', () => {
    const skillPath = path.join(root, 'skills', 'markdown-mermaid', 'SKILL.md');
    const content = fs.readFileSync(skillPath, 'utf8');
    const catalog = JSON.parse(fs.readFileSync(path.join(root, 'scout-skills.json'), 'utf8'));
    const entry = catalog.find((skill) => skill.name === 'markdown-mermaid');

    assert.match(content, /## Diagram brief/);
    assert.match(content, /## Choose custom SVG when it fits better/);
    assert.match(content, /If the optional visual add-on is installed/);
    assert.match(content,
        /In a\s+core-only\s+installation,\s+inspect\s+the\s+available\s+target\s+renderer\s+or\s+ask\s+the\s+user\s+to\s+confirm\s+the\s+visual\s+result\./);
    assert.match(content, /## Document drift check/);
    assert.match(content, /\*\*Diagram drift\*\*/);
    assert.doesNotMatch(content, /%%\{init:|classDef\s|linkStyle\s/);
    assert.equal(fs.existsSync(path.join(root, 'skills', 'markdown-mermaid', 'markdown-light.css')), false);
    for (const reference of [
        'diagram-reference.md',
        'markdown-best-practices.md',
        'pitfalls.md',
        'tool-ecosystem.md',
    ]) {
        assert.equal(fs.existsSync(path.join(
            root, 'skills', 'markdown-mermaid', 'references', reference)), false);
    }
    assert.equal(entry.description,
        "Create and maintain Mermaid or custom SVG diagrams as concise visual arguments tied to a document's Big Idea. Use when a diagram must clarify a process, decision, relationship, or state, or when document edits may have made one stale.");
});

test('README uses raw Mermaid and accessible continuity SVGs', () => {
    const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
    const diagrams = [...readme.matchAll(/```mermaid\r?\n([\s\S]*?)\r?\n```/g)];

    assert.equal(diagrams.length, 1);
    assert.match(diagrams[0][1], /flowchart TD/);
    assert.doesNotMatch(diagrams[0][1], /%%\{init:|classDef\s|linkStyle\s|^\s*style\s/m);
    assert.match(readme, /!\[OneDrive memory bus: approved knowledge and evidence capture from a Scout session, with raw task content excluded\.\]\(assets\/onedrive-memory-bus\.svg\)/);
    assert.match(readme, /!\[Skill-development evidence lifecycle: acceptance checks precede a versioned skill release; tester evidence and reusable lessons inform the next skill revision\.\]\(assets\/skill-evidence-lifecycle\.svg\)/);
    for (const layoutEntry of [
        'CHANGELOG.md',
        'package.json',
        'VERSION',
        'DEFENSIBLE-DECISION-FLINT-GALLERY.html',
        'onedrive-memory-bus.svg',
        'skill-evidence-lifecycle.svg',
    ]) {
        assert.match(readme, new RegExp(layoutEntry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
    for (const [file, title] of [
        ['onedrive-memory-bus.svg', 'OneDrive memory bus'],
        ['skill-evidence-lifecycle.svg', 'Skill development evidence lifecycle'],
    ]) {
        const svg = fs.readFileSync(path.join(root, 'assets', file), 'utf8');

        assert.match(svg, /viewBox="/);
        assert.match(svg, /role="img"/);
        assert.match(svg, new RegExp(`<title id="title">${title}</title>`));
        assert.doesNotMatch(svg, /<script\b|<image\b/i);
    }
    const lifecycle = fs.readFileSync(path.join(
        root, 'assets', 'skill-evidence-lifecycle.svg'), 'utf8');
    assert.match(lifecycle, /BEFORE A SKILL RELEASE/);
    assert.match(lifecycle, /Is this skill change ready\?/);
    assert.match(lifecycle, /AFTER USERS TRY THE SKILL/);
    assert.match(lifecycle, /What did we learn\?/);
    assert.match(lifecycle, /improve the next skill revision/);
});

test('decision workflows require a bounded shared knowledge consultation', () => {
    const skills = [
        ['skills', 'adversarial-review'],
        ['skills', 'code-review'],
        ['skills', 'compile-brain'],
        ['skills', 'critical-thinking'],
        ['skills', 'doc-hygiene'],
        ['skills', 'ethical-reasoning'],
        ['skills', 'markdown-sanitization-chain'],
        ['skills', 'mcp-builder'],
        ['skills', 'plan'],
        ['skills', 'problem-framing-audit'],
        ['skills', 'risk-analysis'],
        ['skills', 'security-and-hardening'],
        ['skills', 'spike'],
        ['skills', 'status-reporting'],
        ['skills', 'systematic-debugging'],
        ['skills-visual', 'chart-big-idea'],
        ['skills-visual', 'chart-vocabulary'],
        ['skills-visual', 'flint-chart'],
        ['skills-visual', 'render-verify'],
    ];

    for (const [library, skill] of skills) {
        const content = fs.readFileSync(path.join(root, library, skill, 'SKILL.md'), 'utf8');
        assert.match(content, /## Shared Knowledge Gate/);
        assert.match(content, /scout-knowledge-base/);
    }
});

test('meditation requests optional session compaction after capture', () => {
    const meditation = fs.readFileSync(path.join(root, 'skills', 'meditation', 'SKILL.md'), 'utf8');

    assert.match(meditation, /## Session Compaction/);
    assert.match(meditation, /Do not compact automatically/);
});

test('greeting checkin manifest matches the core and visual catalogs', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(
        root, 'skills', 'scout-greeting-checkin', 'package-manifest.json'), 'utf8'));
    const core = JSON.parse(fs.readFileSync(path.join(root, 'scout-skills.json'), 'utf8'))
        .map((entry) => entry.name).sort();
    const visual = JSON.parse(fs.readFileSync(path.join(root, 'scout-skills-visual.json'), 'utf8'))
        .map((entry) => entry.name).sort();

    assert.equal(manifest.version, '2.0.3');
    assert.deepEqual([...manifest.coreSkills].sort(), core);
    assert.deepEqual([...manifest.visualSkills].sort(), visual);
});
