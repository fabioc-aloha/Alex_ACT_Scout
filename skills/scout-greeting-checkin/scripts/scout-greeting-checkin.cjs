#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function readJson(file, label) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        throw new Error(`${label} is not readable JSON: ${file}`);
    }
}

function defaultInstalledRoot() {
    return path.join(os.homedir(), '.scout', 'skills');
}

function defaultManifestPath() {
    return path.resolve(__dirname, '..', 'package-manifest.json');
}

function parseArgs(args) {
    const [command, ...rest] = args;
    if (command !== 'status') throw new Error(`unknown greeting check command: ${command || '<missing>'}`);
    const options = {
        command,
        packageRoot: null,
        installedRoot: defaultInstalledRoot(),
        manifestPath: defaultManifestPath(),
        config: path.join(os.homedir(), '.scout', 'component-evidence.json'),
        mcpRegistry: path.join(os.homedir(), '.scout', 'm-mcp-servers.json'),
        releaseRepository: null,
    };
    const values = new Map([
        ['--package-root', 'packageRoot'],
        ['--installed-root', 'installedRoot'],
        ['--manifest', 'manifestPath'],
        ['--config', 'config'],
        ['--mcp-registry', 'mcpRegistry'],
        ['--release-repository', 'releaseRepository'],
    ]);
    for (let index = 0; index < rest.length; index += 1) {
        const argument = rest[index];
        if (!values.has(argument)) throw new Error(`unknown argument: ${argument}`);
        const value = rest[index + 1];
        if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
        const key = values.get(argument);
        if (key !== 'releaseRepository' && !path.isAbsolute(value)) {
            throw new Error(`${argument} must be absolute`);
        }
        options[key] = key === 'releaseRepository' ? value : path.resolve(value);
        index += 1;
    }
    return options;
}

function packageFromRoot(packageRoot) {
    const packageJson = readJson(path.join(packageRoot, 'package.json'), 'package metadata');
    const core = readJson(path.join(packageRoot, 'scout-skills.json'), 'core catalog');
    const visual = readJson(path.join(packageRoot, 'scout-skills-visual.json'), 'visual catalog');
    const installedManifest = readJson(path.join(
        packageRoot, 'skills', 'scout-greeting-checkin', 'package-manifest.json'), 'package manifest');
    return {
        version: packageJson.version,
        releaseRepository: installedManifest.releaseRepository,
        coreSkills: core.map((entry) => entry.name),
        visualSkills: visual.map((entry) => entry.name),
    };
}

function packageFromManifest(manifestPath) {
    const manifest = readJson(manifestPath, 'installed package manifest');
    if (manifest.schemaVersion !== 1 || typeof manifest.version !== 'string'
        || !Array.isArray(manifest.coreSkills) || !Array.isArray(manifest.visualSkills)) {
        throw new Error('installed package manifest has an unsupported schema');
    }
    return manifest;
}

function installationStatus(installedRoot, skills) {
    const missing = skills.filter((skill) => !fs.existsSync(path.join(installedRoot, skill, 'SKILL.md')));
    return { expected: skills.length, installed: skills.length - missing.length, missing };
}

function sharedDataStatus(configPath) {
    if (!fs.existsSync(configPath)) {
        return { configured: false, ledgerReady: false, assessmentReady: false, knowledgeBaseReady: false };
    }
    const config = readJson(configPath, 'component evidence configuration');
    if (config.schemaVersion !== 1 || typeof config.evidenceRoot !== 'string'
        || !path.isAbsolute(config.evidenceRoot)) {
        return { configured: false, ledgerReady: false, assessmentReady: false, knowledgeBaseReady: false };
    }
    const evidenceRoot = path.resolve(config.evidenceRoot);
    const sharedRoot = path.basename(evidenceRoot) === 'component-evidence-data'
        ? path.dirname(evidenceRoot)
        : null;
    return {
        configured: true,
        ledgerReady: fs.existsSync(path.join(evidenceRoot, 'component-evidence', 'events.ndjson')),
        assessmentReady: fs.existsSync(path.join(evidenceRoot, 'assessment.json')),
        knowledgeBaseReady: Boolean(sharedRoot && fs.existsSync(path.join(sharedRoot, 'knowledge-base', 'index.md'))),
    };
}

function flintStatus(registryPath) {
    if (!fs.existsSync(registryPath)) return { registered: false, launcherExists: false };
    const registry = readJson(registryPath, 'MCP registry');
    const flint = registry.servers && registry.servers.flint;
    if (!flint || !flint.config || flint.config.command !== 'node' || !Array.isArray(flint.config.args)) {
        return { registered: false, launcherExists: false };
    }
    return {
        registered: true,
        launcherExists: typeof flint.config.args[0] === 'string' && fs.existsSync(flint.config.args[0]),
    };
}

function parseVersion(value) {
    const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value);
    return match ? match.slice(1).map(Number) : null;
}

function isNewer(candidate, current) {
    const candidateParts = parseVersion(candidate);
    const currentParts = parseVersion(current);
    if (!candidateParts || !currentParts) return false;
    return candidateParts.some((part, index) => part !== currentParts[index]
        && part > currentParts[index]
        && candidateParts.slice(0, index).every((previous, priorIndex) => previous === currentParts[priorIndex]));
}

function remoteStatus(repository, currentVersion) {
    if (!repository) return { status: 'not-configured', latestVersion: null, updateAvailable: false };
    const result = spawnSync('git', ['ls-remote', '--tags', repository], {
        encoding: 'utf8',
        timeout: 10000,
    });
    if (result.error || result.status !== 0) {
        return {
            status: 'unavailable',
            latestVersion: null,
            updateAvailable: false,
            message: (result.stderr || result.error?.message || 'git ls-remote failed').trim(),
        };
    }
    const versions = result.stdout.split(/\r?\n/)
        .map((line) => line.split('\t')[1] || '')
        .map((reference) => /^refs\/tags\/v(\d+\.\d+\.\d+)\^\{\}$/.exec(reference))
        .filter(Boolean)
        .map((match) => match[1])
        .sort((left, right) => {
            const leftParts = parseVersion(left);
            const rightParts = parseVersion(right);
            return rightParts[0] - leftParts[0] || rightParts[1] - leftParts[1] || rightParts[2] - leftParts[2];
        });
    const latestVersion = versions[0] || null;
    return {
        status: latestVersion ? 'available' : 'no-release-tags',
        latestVersion,
        updateAvailable: Boolean(latestVersion && isNewer(latestVersion, currentVersion)),
    };
}

function inspect(options) {
    const packageInfo = options.packageRoot
        ? packageFromRoot(options.packageRoot)
        : packageFromManifest(options.manifestPath);
    const releaseRepository = options.releaseRepository || packageInfo.releaseRepository;
    return {
        schemaVersion: 1,
        package: { version: packageInfo.version, releaseRepository },
        installation: {
            core: installationStatus(options.installedRoot, packageInfo.coreSkills),
            visual: installationStatus(options.installedRoot, packageInfo.visualSkills),
        },
        sharedData: sharedDataStatus(options.config),
        flint: flintStatus(options.mcpRegistry),
        remote: { status: 'not-checked', latestVersion: null, updateAvailable: false },
    };
}

function run(options) {
    const report = inspect(options);
    report.remote = remoteStatus(report.package.releaseRepository, report.package.version);
    return report;
}

function main() {
    try {
        process.stdout.write(`${JSON.stringify(run(parseArgs(process.argv.slice(2))), null, 2)}\n`);
    } catch (error) {
        process.stderr.write(`scout-greeting-checkin: ${error.message}\n`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = { inspect, isNewer, parseArgs, parseVersion };
