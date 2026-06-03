const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Allow imports from DesignSyncMobile-2/shared (e.g. ../../../shared/payments).
config.watchFolders = [workspaceRoot];

module.exports = config;
