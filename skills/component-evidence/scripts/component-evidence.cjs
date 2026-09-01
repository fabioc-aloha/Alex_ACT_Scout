#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const OUTCOMES = new Set(['helped', 'neutral', 'not-helpful']);

function parseArgs(args) {
    const [command, ...rest] = args;
    if (!['configure', 'bootstrap', 'record', 'inventory', 'report'].includes(command)) {
        throw new Error(`unknown component-evidence command: ${command || '<missing>'}`);
    }
    const options = { command, apply: false };
    const values = new Map([
        ['--evidence-root', 'evidenceRoot'],
        ['--config', 'config'],
        ['--component', 'component'],
        ['--components', 'components'],
        ['--outcome', 'outcome'],
        ['--timestamp', 'timestamp'],
        ['--assessment', 'assessment'],
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
    options.config = options.config || path.join(os.homedir(), '.scout', 'component-evidence.json');
    if (!path.isAbsolute(options.config)) {
        throw new Error('--config must be absolute');
    }
    options.config = path.resolve(options.config);
    if (options.evidenceRoot) {
        if (!path.isAbsolute(options.evidenceRoot)) {
            throw new Error('--evidence-root must be absolute');
        }
        options.evidenceRoot = path.resolve(options.evidenceRoot);
    } else if (options.command === 'configure') {
        throw new Error('--evidence-root is required for configure');
    } else {
        options.evidenceRoot = configuredEvidenceRoot(options.config);
    }
    if (options.assessment) {
        if (!path.isAbsolute(options.assessment)) throw new Error('--assessment must be absolute');
        options.assessment = path.resolve(options.assessment);
    }
    return options;
}

function configuredEvidenceRoot(configFile) {
    let config;
    try {
        config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch {
        throw new Error('component evidence is not configured; run configure with an explicit shared evidence root');
    }
    if (config.schemaVersion !== 1 || typeof config.evidenceRoot !== 'string'
        || !path.isAbsolute(config.evidenceRoot)) {
        throw new Error('component evidence configuration is invalid');
    }
    return path.resolve(config.evidenceRoot);
}

function writeAtomic(file, content) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temporary = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporary, file);
}

function evidenceDirectory(options) {
    return path.join(options.evidenceRoot, 'component-evidence');
}

function eventsFile(options) {
    return path.join(evidenceDirectory(options), 'events.ndjson');
}

function requireBootstrapped(options) {
    if (!fs.existsSync(eventsFile(options))) {
        throw new Error('component evidence is not bootstrapped');
    }
}

function validComponent(value) {
    if (typeof value !== 'string' || !/^[a-z][a-z0-9-]{1,80}$/.test(value)) {
        throw new Error('--component must be a lowercase component identifier');
    }
    return value;
}

function parseComponents(value) {
    if (typeof value !== 'string') throw new Error('--components requires at least one component');
    const components = value.split(',').map((component) => component.trim()).filter(Boolean);
    if (components.length === 0) throw new Error('--components requires at least one component');
    return [...new Set(components.map(validComponent))].sort();
}

function isoTimestamp(value) {
    const timestamp = value || new Date().toISOString();
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp)
        || !Number.isFinite(Date.parse(timestamp))) {
        throw new Error('--timestamp must be an ISO 8601 timestamp');
    }
    return new Date(timestamp).toISOString();
}

function bootstrap(options) {
    const file = eventsFile(options);
    const configured = fs.existsSync(file);
    if (options.apply && !configured) {
        fs.mkdirSync(evidenceDirectory(options), { recursive: true });
        fs.writeFileSync(file, '', { encoding: 'utf8', flag: 'wx' });
    }
    return {
        schemaVersion: 1,
        command: 'bootstrap',
        apply: options.apply,
        status: configured ? 'configured' : options.apply ? 'bootstrapped' : 'ready',
    };
}

function configure(options) {
    const config = {
        schemaVersion: 1,
        evidenceRoot: options.evidenceRoot,
    };
    if (options.apply) writeAtomic(options.config, `${JSON.stringify(config, null, 2)}\n`);
    return {
        schemaVersion: 1,
        command: 'configure',
        apply: options.apply,
        status: options.apply ? 'configured' : 'ready',
    };
}

function record(options) {
    requireBootstrapped(options);
    const event = {
        schemaVersion: 1,
        component: validComponent(options.component),
        outcome: options.outcome,
        timestamp: isoTimestamp(options.timestamp),
    };
    if (!OUTCOMES.has(event.outcome)) {
        throw new Error(`--outcome must be one of: ${[...OUTCOMES].join(', ')}`);
    }
    if (options.apply) fs.appendFileSync(eventsFile(options), `${JSON.stringify(event)}\n`, 'utf8');
    return {
        schemaVersion: 1,
        command: 'record',
        apply: options.apply,
        status: options.apply ? 'recorded' : 'ready',
        event,
    };
}

function inventory(options) {
    requireBootstrapped(options);
    const components = parseComponents(options.components);
    const assessedComponents = new Set(readAssessment(options).map((entry) => entry.id));
    for (const component of components) {
        if (!assessedComponents.has(component)) {
            throw new Error(`component is not present in the configured assessment: ${component}`);
        }
    }
    const timestamp = isoTimestamp(options.timestamp);
    const events = components.map((component) => ({
        schemaVersion: 1,
        event: 'used',
        component,
        timestamp,
    }));
    if (options.apply) {
        fs.appendFileSync(eventsFile(options), events.map((event) => `${JSON.stringify(event)}\n`).join(''), 'utf8');
    }
    return {
        schemaVersion: 1,
        command: 'inventory',
        apply: options.apply,
        status: options.apply ? 'recorded' : 'ready',
        components,
        recordedUses: events.length,
    };
}

function readEvents(options) {
    requireBootstrapped(options);
    const content = fs.readFileSync(eventsFile(options), 'utf8').trim();
    if (!content) return [];
    return content.split(/\r?\n/).map((line, index) => {
        let event;
        try {
            event = JSON.parse(line);
        } catch {
            throw new Error(`event ${index + 1} is not valid JSON`);
        }
        if (event.schemaVersion !== 1 || event.event === 'used') {
            if (event.event !== 'used' || event.outcome !== undefined) {
                throw new Error(`event ${index + 1} has an unsupported schema or event`);
            }
        } else if (!OUTCOMES.has(event.outcome)) {
            throw new Error(`event ${index + 1} has an unsupported schema or outcome`);
        }
        validComponent(event.component);
        isoTimestamp(event.timestamp);
        return event;
    });
}

function readAssessment(options) {
    const assessmentPath = options.assessment || path.join(options.evidenceRoot, 'assessment.json');
    let assessment;
    try {
        assessment = JSON.parse(fs.readFileSync(assessmentPath, 'utf8'));
    } catch {
        throw new Error('assessment.json must exist in the evidence root or --assessment must name a readable JSON file');
    }
    if (assessment.schemaVersion !== 2 || !Array.isArray(assessment.skillImportance)) {
        throw new Error('--assessment must be a Brain Compiler schema version 2 report');
    }
    return assessment.skillImportance.map((entry) => {
        if (typeof entry.id !== 'string' || !Number.isFinite(entry.staticImportanceScore)
            || !Number.isFinite(entry.maximumScore) || entry.maximumScore <= 0) {
            throw new Error('--assessment contains an invalid skillImportance entry');
        }
        return entry;
    });
}

function usage(events) {
    const useEvents = events.filter((event) => event.event === 'used');
    const lastUsedAt = useEvents.reduce((latest, event) => !latest
        || Date.parse(event.timestamp) > Date.parse(latest) ? event.timestamp : latest, null);
    return { recordedUses: useEvents.length, lastUsedAt };
}

function usefulness(events) {
    const counts = { helped: 0, neutral: 0, notHelpful: 0 };
    const outcomeEvents = events.filter((event) => event.event !== 'used');
    for (const event of outcomeEvents) {
        if (event.outcome === 'not-helpful') counts.notHelpful += 1;
        else counts[event.outcome] += 1;
    }
    const recordedOutcomes = outcomeEvents.length;
    const lastRecordedAt = outcomeEvents.reduce((latest, event) => !latest
        || Date.parse(event.timestamp) > Date.parse(latest) ? event.timestamp : latest, null);
    if (recordedOutcomes === 0) {
        return { recordedOutcomes, ...counts, score: null, confidence: 'none', lastRecordedAt };
    }
    const score = Math.round(((counts.helped + (counts.neutral * 0.5) + 1)
        / (recordedOutcomes + 2)) * 100);
    const confidence = recordedOutcomes >= 15 ? 'high' : recordedOutcomes >= 5 ? 'medium' : 'low';
    return { recordedOutcomes, ...counts, score, confidence, lastRecordedAt };
}

function report(options) {
    const events = readEvents(options);
    const importance = readAssessment(options);
    const eventsByComponent = new Map();
    for (const event of events) {
        const componentEvents = eventsByComponent.get(event.component) || [];
        componentEvents.push(event);
        eventsByComponent.set(event.component, componentEvents);
    }
    const importanceByComponent = new Map(importance.map((entry) => [entry.id, entry]));
    const componentNames = new Set([...importanceByComponent.keys(), ...eventsByComponent.keys()]);
    const components = [...componentNames].sort().map((component) => {
        const staticEntry = importanceByComponent.get(component);
        const componentUsefulness = usefulness(eventsByComponent.get(component) || []);
        const componentUsage = usage(eventsByComponent.get(component) || []);
        const staticImportance = staticEntry ? {
            score: staticEntry.staticImportanceScore,
            maximumScore: staticEntry.maximumScore,
            signals: staticEntry.signals,
        } : null;
        const hybridScore = staticImportance && componentUsefulness.score !== null
            ? Math.round(((staticImportance.score / staticImportance.maximumScore) * 40)
                + (componentUsefulness.score * 0.6))
            : null;
        return {
            component,
            staticImportance,
            usage: componentUsage,
            usefulness: componentUsefulness,
            hybridScore,
        };
    });
    return { schemaVersion: 1, command: 'report', components };
}

function run(options) {
    if (options.command === 'configure') return configure(options);
    if (options.command === 'bootstrap') return bootstrap(options);
    if (options.command === 'record') return record(options);
    if (options.command === 'inventory') return inventory(options);
    return report(options);
}

function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        process.stdout.write(`${JSON.stringify(run(options), null, 2)}\n`);
    } catch (error) {
        process.stderr.write(`component-evidence: ${error.message}\n`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = { parseArgs, run };
