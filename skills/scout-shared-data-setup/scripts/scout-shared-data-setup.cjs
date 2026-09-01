#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const componentEvidence = require('../../component-evidence/scripts/component-evidence.cjs');
const knowledgeBase = require('../../scout-knowledge-base/scripts/scout-knowledge-base.cjs');

function parseArgs(args) {
    const [command, ...rest] = args;
    if (!['bootstrap', 'status'].includes(command)) {
        throw new Error(`unknown shared data command: ${command || '<missing>'}`);
    }
    const options = {
        command,
        apply: false,
        config: path.join(os.homedir(), '.scout', 'component-evidence.json'),
    };
    const values = new Map([
        ['--shared-root', 'sharedRoot'],
        ['--config', 'config'],
    ]);
    for (let index = 0; index < rest.length; index += 1) {
        const argument = rest[index];
        if (argument === '--apply') {
            options.apply = true;
        } else if (values.has(argument)) {
            const value = rest[index + 1];
            if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
            options[values.get(argument)] = value;
            index += 1;
        } else {
            throw new Error(`unknown argument: ${argument}`);
        }
    }
    if (!path.isAbsolute(options.sharedRoot || '')) {
        throw new Error('--shared-root must be absolute');
    }
    if (!path.isAbsolute(options.config)) {
        throw new Error('--config must be absolute');
    }
    options.sharedRoot = path.resolve(options.sharedRoot);
    options.config = path.resolve(options.config);
    return options;
}

function paths(options) {
    return {
        evidenceRoot: path.join(options.sharedRoot, 'component-evidence-data'),
        knowledgeBaseRoot: path.join(options.sharedRoot, 'knowledge-base'),
        assessmentPath: path.join(options.sharedRoot, 'component-evidence-data', 'assessment.json'),
    };
}

function status(options) {
    const sharedPaths = paths(options);
    return {
        schemaVersion: 1,
        command: 'status',
        sharedRoot: options.sharedRoot,
        evidence: {
            configured: fs.existsSync(options.config),
            ledgerReady: fs.existsSync(path.join(sharedPaths.evidenceRoot, 'component-evidence', 'events.ndjson')),
        },
        knowledgeBase: {
            ready: fs.existsSync(path.join(sharedPaths.knowledgeBaseRoot, 'index.md')),
        },
        assessment: {
            status: fs.existsSync(sharedPaths.assessmentPath) ? 'present' : 'missing',
        },
    };
}

function bootstrap(options) {
    const sharedPaths = paths(options);
    const preview = status(options);
    if (options.apply) {
        componentEvidence.run({
            command: 'configure',
            apply: true,
            config: options.config,
            evidenceRoot: sharedPaths.evidenceRoot,
        });
        componentEvidence.run({
            command: 'bootstrap',
            apply: true,
            config: options.config,
            evidenceRoot: sharedPaths.evidenceRoot,
        });
        knowledgeBase.run({
            command: 'bootstrap',
            apply: true,
            sharedRoot: options.sharedRoot,
        });
    }
    return {
        ...preview,
        command: 'bootstrap',
        apply: options.apply,
        status: options.apply ? 'bootstrapped' : 'ready',
        assessment: {
            status: preview.assessment.status,
            action: preview.assessment.status === 'present'
                ? 'none'
                : 'generate with Alex ACT Brain Compiler before recording skill usage',
        },
    };
}

function run(options) {
    return options.command === 'bootstrap' ? bootstrap(options) : status(options);
}

function main() {
    try {
        process.stdout.write(`${JSON.stringify(run(parseArgs(process.argv.slice(2))), null, 2)}\n`);
    } catch (error) {
        process.stderr.write(`scout-shared-data-setup: ${error.message}\n`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = { parseArgs, run };
