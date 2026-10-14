#!/usr/bin/env node

/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { createServer, build, createLogger } from 'vite';
import electronPath from 'electron';
import { execFile as execFileCb, spawn, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';
import { generateAsync } from 'dts-for-context-bridge';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { watch as watchUiPackage } from '../node_modules/@sveltejs/package/src/index.js';
import { load_config as loadUiPackageConfig } from '../node_modules/@sveltejs/package/src/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Spawned child processes tracked so we can tear them all down on exit.
 * @type {Set<import('node:child_process').ChildProcess>}
 */
const childrenProcesses = new Set();

/**
 * Track a child process so it can be killed together with the watch script.
 * @param {import('node:child_process').ChildProcess} child
 */
function trackChildProcess(child) {
  childrenProcesses.add(child);
  child.once('exit', () => childrenProcesses.delete(child));
}

/**
 * Kill a single child process and its descendants using platform-specific
 * process-tree termination.
 * @param {import('node:child_process').ChildProcess} child
 * @param {NodeJS.Signals} signal
 */
function killChild(child, signal) {
  if (child.pid === undefined) {
    return;
  }
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      process.kill(-child.pid, signal);
    }
  } catch {
    try {
      child.kill(signal);
    } catch {
      // Process already exited.
    }
  }
}

/**
 * Kill every tracked child process by sending the signal to its whole
 * process group (which also kills its own descendants, e.g. pnpm → vite).
 * @param {NodeJS.Signals} signal
 */
function killChildren(signal) {
  for (const child of childrenProcesses) {
    killChild(child, signal);
  }
  childrenProcesses.clear();
}

/**
 * Kill everything spawned by this script and exit. The default terminal
 * behavior only kills the direct `pnpm watch` process, leaving spawned
 * package watchers (and their vite processes) orphaned.
 * @param {NodeJS.Signals | number} signal
 */
function cleanupAndExit(signal) {
  killChildren('SIGTERM');
  if (typeof signal === 'string' && signal.startsWith('SIG')) {
    // Re-raise so the parent shell sees the real exit reason.
    process.removeListener(signal, cleanupAndExit);
    process.kill(process.pid, signal);
  } else {
    process.exit(typeof signal === 'number' ? signal : 0);
  }
}

/**
 * Preserve whether a child exited with a status code or a signal.
 * @param {number | null} code
 * @param {NodeJS.Signals | null} signal
 */
function cleanupOnChildExit(code, signal) {
  cleanupAndExit(signal ?? code ?? 0);
}

// Ensure termination propagates to all child processes.
process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);
process.on('SIGQUIT', cleanupAndExit);

const execFileAsync = promisify(execFileCb);

async function getGitBranch() {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    return stdout.trim();
  } catch (error) {
    const reason = error.stderr?.trim() ?? error.message;
    console.error(`[dev] Could not determine git branch: ${reason}`);
    return '';
  }
}

/** @type 'production' | 'development'' */
const mode = (process.env.MODE = process.env.MODE || 'development');

/** @type {import('vite').LogLevel} */
const LOG_LEVEL = 'info';

/** @type {import('vite').InlineConfig} */
const sharedConfig = {
  mode,
  build: {
    watch: {},
  },
  logLevel: LOG_LEVEL,
};

/** Messages on stderr that match any of the contained patterns will be stripped from output */
const stderrFilterPatterns = [
  // warning about devtools extension
  // https://github.com/cawa-93/vite-electron-builder/issues/492
  // https://github.com/MarshallOfSound/electron-devtools-installer/issues/143
  /ExtensionLoadWarning/,
];

/**
 * @param {{name: string; configFile: string; writeBundle: import('rollup').OutputPlugin['writeBundle'] }} param0
 */
const getWatcher = ({ name, configFile, writeBundle }) => {
  return new Promise((resolve, reject) => {
    let resolved = false;
    build({
      ...sharedConfig,
      configFile,
      plugins: [
        {
          name,
          writeBundle(...args) {
            writeBundle?.(...args);
            if (!resolved) {
              resolved = true;
              resolve();
            }
          },
        },
      ],
    }).catch(reject);
  });
};

const EXTENSION_OPTION = '--extension-folder';

/**
 * Start or restart App when source files are changed
 * @param {{config: {server: import('vite').ResolvedServerOptions}}} ResolvedServerOptions
 */
const setupMainPackageWatcher = ({ config: { server, extensions } }) => {
  // Create VITE_DEV_SERVER_URL environment variable to pass it to the main process.
  {
    const protocol = server.https ? 'https:' : 'http:';
    const host = server.host || 'localhost';
    const port = server.port; // Vite searches for and occupies the first free port: 3000, 3001, 3002 and so on
    const path = '/';
    process.env.VITE_DEV_SERVER_URL = `${protocol}//${host}:${port}${path}`;
  }

  const logger = createLogger(LOG_LEVEL, {
    prefix: '[main]',
  });

  /** @type {ChildProcessWithoutNullStreams | null} */
  let spawnProcess = null;

  return getWatcher({
    name: 'reload-app-on-main-package-change',
    configFile: 'packages/main/vite.config.js',
    writeBundle() {
      if (spawnProcess !== null) {
        spawnProcess.off('exit', cleanupOnChildExit);
        killChild(spawnProcess, 'SIGINT');
        spawnProcess = null;
      }

      const extensionArgs = [];
      extensions.forEach(extension => {
        extensionArgs.push(EXTENSION_OPTION);
        extensionArgs.push(extension);
      });
      spawnProcess = spawn(String(electronPath), ['--remote-debugging-port=9223', '.', ...extensionArgs], {
        env: { ...process.env, ELECTRON_IS_DEV: 1 },
        detached: process.platform !== 'win32',
      });

      spawnProcess.stdout.on('data', d => d.toString().trim() && logger.warn(d.toString(), { timestamp: true }));
      spawnProcess.stderr.on('data', d => {
        const data = d.toString().trim();
        if (!data) return;
        const mayIgnore = stderrFilterPatterns.some(r => r.test(data));
        if (mayIgnore) return;
        logger.error(data, { timestamp: true });
      });

      // Stops the watch script when the application has been quit
      spawnProcess.on('exit', cleanupOnChildExit);

      // Register cleanup first so the process group remains tracked while
      // cleanupAndExit terminates any surviving descendants.
      trackChildProcess(spawnProcess);
    },
  });
};

/**
 * Start `packages/ui`'s incremental watcher and wait for its first build to complete.
 *
 * The renderer's Vite dev server resolves bare imports of `@podman-desktop/ui-svelte`
 * against `packages/ui/dist`. Vite's dependency optimizer can scan for these as soon as
 * `createServer`/`listen` runs — independent of when the page is actually requested — and
 * a failed resolution there is cached for the rest of the dev server's life (reloading the
 * page does not clear it). This must be awaited before `createServer` is called.
 *
 * `@sveltejs/package`'s `watch()` performs and awaits its first build before returning,
 * so awaiting it here is a direct signal that `dist` is ready — no subprocess or stdout
 * pattern matching needed.
 * @returns {Promise<void>} resolves once the first build has produced `dist`
 */
const setupUiPackageWatcher = async () => {
  const cwd = join(__dirname, '..', 'packages/ui');
  const config = await loadUiPackageConfig({ cwd });

  const { watcher, ready, settled } = await watchUiPackage({
    cwd,
    input: 'src/lib',
    output: 'dist',
    preserve_output: false,
    types: true,
    config,
  });

  await ready;

  process.once('exit', () => watcher.close());
};

/**
 * Start or restart App when source files are changed
 * @param {{ws: import('vite').WebSocketServer}} WebSocketServer
 */
const setupCoreApiPackageWatcher = ({ ws }) =>
  getWatcher({
    name: 'reload-page-on-core-api-package-change',
    configFile: 'packages/api/vite.config.js',
    writeBundle() {
      if (ws) {
        ws.send({
          type: 'full-reload',
        });
      }
    },
  });

/**
 * Start or restart App when source files are changed
 * @param {{ws: import('vite').WebSocketServer}} WebSocketServer
 */
const setupPreloadPackageWatcher = ({ ws }) =>
  getWatcher({
    name: 'reload-page-on-preload-package-change',
    configFile: 'packages/preload/vite.config.js',
    writeBundle() {
      // Generating exposedInMainWorld.d.ts when preload package is changed.
      generateAsync({
        input: 'packages/preload/tsconfig.json',
        output: 'packages/preload/exposedInMainWorld.d.ts',
      });
      if (ws) {
        ws.send({
          type: 'full-reload',
        });
      }
    },
  });

const setupPreloadDockerExtensionPackageWatcher = ({ ws }) =>
  getWatcher({
    name: 'reload-page-on-preload-docker-extension-package-change',
    configFile: 'packages/preload-docker-extension/vite.config.js',
    writeBundle() {
      // Generating exposedInMainWorld.d.ts when preload package is changed.
      generateAsync({
        input: 'packages/preload-docker-extension/tsconfig.json',
        output: 'packages/preload-docker-extension/exposedInDockerExtension.d.ts',
      });

      if (ws) {
        ws.send({
          type: 'full-reload',
        });
      }
    },
  });

const setupPreloadWebviewPackageWatcher = ({ ws }) =>
  getWatcher({
    name: 'reload-page-on-preload-webview-package-change',
    configFile: 'packages/preload-webview/vite.config.js',
    writeBundle() {
      // Generating exposedInWebview.d.ts when preload package is changed.
      generateAsync({
        input: 'packages/preload-webview/tsconfig.json',
        output: 'packages/preload-webview/exposedInWebview.d.ts',
      });

      if (ws) {
        ws.send({
          type: 'full-reload',
        });
      }
    },
  });

/**
 * Start or restart App when source files are changed
 * @param {{ws: import('vite').WebSocketServer}} WebSocketServer
 */
const setupExtensionApiWatcher = name => {
  const folderName = resolve(name);

  console.log('dirname is', folderName);
  const spawnProcess = spawn('pnpm', ['watch'], {
    cwd: folderName,
    shell: process.platform === 'win32',
    detached: process.platform !== 'win32',
  });

  spawnProcess.stdout.on('data', d => d.toString().trim() && console.warn(d.toString(), { timestamp: true }));
  spawnProcess.stderr.on('data', d => {
    const data = d.toString().trim();
    if (!data) return;
    console.error(data, { timestamp: true });
  });

  // Stops the watch script when the application has been quit
  spawnProcess.on('exit', cleanupOnChildExit);

  // Register cleanup first so the process group remains tracked while
  // cleanupAndExit terminates any surviving descendants.
  trackChildProcess(spawnProcess);
  spawnProcess.unref();
};

(async () => {
  try {
    const extensions = [];
    for (let index = 0; index < process.argv.length; index++) {
      if (process.argv[index] === EXTENSION_OPTION && index < process.argv.length - 1) {
        extensions.push(resolve(process.argv[++index]));
      }
    }
    process.env.VITE_GIT_BRANCH ??= await getGitBranch();

    await setupUiPackageWatcher();

    const viteDevServer = await createServer({
      ...sharedConfig,
      configFile: 'packages/renderer/vite.config.js',
      extensions: extensions,
    });

    await viteDevServer.listen();

    // get extensions folder
    const extensionsFolder = resolve(__dirname, '../extensions/');

    // Loop on all subfolders from the extensions folder.
    // If package.json is present it is an extension without API.
    // If package.json is missing look into packages/extension folder
    // and if package.json is present it is na extension with API.
    readdirSync(extensionsFolder, { withFileTypes: true })
      .filter(
        dirent =>
          dirent.isDirectory() &&
          (existsSync(join(extensionsFolder, dirent.name, 'package.json')) ||
            existsSync(extensionsFolder, dirent.name, 'packages', 'extension', 'package.json')),
      )
      .forEach(dirent => {
        const apiExtPath = join(extensionsFolder, dirent.name, 'packages', 'extension');
        if (existsSync(join(apiExtPath, 'package.json'))) {
          setupExtensionApiWatcher(apiExtPath);
        } else if (existsSync(join(extensionsFolder, dirent.name, 'package.json'))) {
          setupExtensionApiWatcher(join(extensionsFolder, dirent.name));
        }
      });

    for (const extension of extensions) {
      setupExtensionApiWatcher(extension);
    }
    await setupCoreApiPackageWatcher(viteDevServer);
    await setupPreloadPackageWatcher(viteDevServer);
    await setupPreloadDockerExtensionPackageWatcher(viteDevServer);
    await setupPreloadWebviewPackageWatcher(viteDevServer);
    await setupMainPackageWatcher(viteDevServer);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
