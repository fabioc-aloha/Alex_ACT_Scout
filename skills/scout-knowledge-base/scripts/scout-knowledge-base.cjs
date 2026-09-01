#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const CATEGORIES = new Set([
    'decisions', 'failure-modes', 'anti-patterns', 'procedures', 'gotchas', 'archive',
]);

function parseArgs(args) {
    const [command, ...rest] = args;
    const options = { command, apply: false };
    const values = new Map([
        ['--shared-root', 'sharedRoot'], ['--record-file', 'recordFile'],
    ]);
    for (let index = 0; index < rest.length; index++) {
        const value = rest[index];
        if (value === '--apply') options.apply = true;
        else if (values.has(value)) {
            if (!rest[index + 1] || rest[index + 1].startsWith('--')) {
                throw new Error(`${value} requires a value`);
            }
            options[values.get(value)] = rest[++index];
        } else throw new Error(`unknown argument: ${value}`);
    }
    if (!['bootstrap', 'status', 'validate', 'deposit'].includes(command)) {
        throw new Error(`unknown knowledge command: ${command || '<missing>'}`);
    }
    if (options.sharedRoot) {
        if (!path.isAbsolute(options.sharedRoot)) throw new Error('--shared-root must be absolute');
        options.sharedRoot = path.resolve(options.sharedRoot);
    }
    return options;
}

function knowledgeRoot(options) {
    if (!options.sharedRoot) throw new Error('--shared-root is required');
    return path.join(options.sharedRoot, 'knowledge-base');
}

function writeAtomic(file, content) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temporary = `${file}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
    fs.writeFileSync(temporary, content, { flag: 'wx' });
    fs.renameSync(temporary, file);
}

function bootstrap(options) {
    const root = knowledgeRoot(options);
    const missing = [...CATEGORIES].filter((category) => !fs.existsSync(path.join(root, category)));
    if (!fs.existsSync(path.join(root, 'index.md'))) missing.unshift('index.md');
    if (options.apply) {
        for (const category of CATEGORIES) fs.mkdirSync(path.join(root, category), { recursive: true });
        const index = path.join(root, 'index.md');
        if (!fs.existsSync(index)) writeAtomic(index,
            '# Shared Scout knowledge base\n\n| Date | Category | Title | Tags |\n| --- | --- | --- | --- |\n');
    }
    return { schemaVersion: 1, command: 'bootstrap', apply: options.apply, missing };
}

function parseRecord(file) {
    if (!path.isAbsolute(file || '')) throw new Error('--record-file must be absolute');
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!match) throw new Error('knowledge record frontmatter is missing');
    const fields = {};
    for (const line of match[1].split(/\r?\n/)) {
        const entry = line.match(/^([A-Za-z][A-Za-z0-9-]*):\s*(.*)$/);
        if (entry) fields[entry[1]] = entry[2].trim();
    }
    if (!fields.title || !CATEGORIES.has(fields.category)
        || !/^\d{4}-\d{2}-\d{2}$/.test(fields.created)
        || !['high', 'medium', 'low'].includes(fields.confidence)) {
        throw new Error('knowledge record metadata is invalid');
    }
    if (/(?:password|secret|token|api[-_ ]?key|credential)\s*[:=]/i.test(content)
        || /(?:[A-Za-z]:[\\/]Users[\\/][^\s]+|\/(?:Users|home)\/[^\s]+)/i.test(content)
        || /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(content)) {
        throw new Error('knowledge record contains private or credential content');
    }
    return { content, fields };
}

function slug(value) {
    const output = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
    if (!output) throw new Error('knowledge title cannot produce a safe filename');
    return output;
}

function tableCell(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
}

function validate(options) {
    const record = parseRecord(options.recordFile);
    return {
        schemaVersion: 1, command: 'validate', status: 'valid',
        title: record.fields.title, category: record.fields.category,
    };
}

function deposit(options) {
    const root = knowledgeRoot(options);
    const record = parseRecord(options.recordFile);
    const filename = `${record.fields.created}-${slug(record.fields.title)}.md`;
    const destination = path.join(root, record.fields.category, filename);
    if (!fs.existsSync(path.join(root, 'index.md'))) throw new Error('knowledge base is not bootstrapped');
    if (fs.existsSync(destination)) {
        if (fs.readFileSync(destination, 'utf8') === record.content) {
            return { schemaVersion: 1, command: 'deposit', apply: options.apply, status: 'duplicate', filename };
        }
        throw new Error('knowledge record filename collision');
    }
    if (options.apply) {
        writeAtomic(destination, record.content);
        const indexFile = path.join(root, 'index.md');
        const row = `| ${record.fields.created} | ${record.fields.category} | ${tableCell(record.fields.title)} | ${tableCell(record.fields.tags)} |\n`;
        const updated = `${fs.readFileSync(indexFile, 'utf8').replace(/\s*$/, '')}\n${row}`;
        const temporary = `${indexFile}.tmp-${process.pid}`;
        fs.writeFileSync(temporary, updated, { flag: 'wx' });
        fs.renameSync(temporary, indexFile);
    }
    return {
        schemaVersion: 1, command: 'deposit', apply: options.apply,
        status: options.apply ? 'deposited' : 'ready', filename,
    };
}

function status(options) {
    const root = knowledgeRoot(options);
    const counts = {};
    for (const category of CATEGORIES) {
        try {
            counts[category] = fs.readdirSync(path.join(root, category), { withFileTypes: true })
                .filter((entry) => entry.isFile() && entry.name.endsWith('.md')).length;
        } catch {
            counts[category] = 0;
        }
    }
    return { schemaVersion: 1, command: 'status', configured: fs.existsSync(path.join(root, 'index.md')), counts };
}

function run(options) {
    if (options.command === 'bootstrap') return bootstrap(options);
    if (options.command === 'status') return status(options);
    if (options.command === 'validate') return validate(options);
    return deposit(options);
}

function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        process.stdout.write(`${JSON.stringify(run(options), null, 2)}\n`);
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = { parseArgs, run, tableCell };
