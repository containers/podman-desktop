#!/usr/bin/env node

/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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
import { spawn } from 'child_process';
import { generateAsync } from 'dts-for-context-bridge';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  return build({
    ...sharedConfig,
    configFile,
    plugins: [{ name, writeBundle }],
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
        spawnProcess.off('exit', process.exit);
        spawnProcess.kill('SIGINT');
        spawnProcess = null;
      }

      const extensionArgs = [];
      extensions.forEach(extension => {
        extensionArgs.push(EXTENSION_OPTION);
        extensionArgs.push(extension);
      })
      spawnProcess = spawn(String(electronPath), [ '--remote-debugging-port=9223', '.', ...extensionArgs], { env: { ...process.env, ELECTRON_IS_DEV: 1 } });

      spawnProcess.stdout.on('data', d => d.toString().trim() && logger.warn(d.toString(), { timestamp: true }));
      spawnProcess.stderr.on('data', d => {
        const data = d.toString().trim();
        if (!data) return;
        const mayIgnore = stderrFilterPatterns.some(r => r.test(data));
        if (mayIgnore) return;
        logger.error(data, { timestamp: true });
      });

      // Stops the watch script when the application has been quit
      spawnProcess.on('exit', process.exit);
    },
  });
};

const setupUiPackageWatcher = () => {
  const logger = createLogger(LOG_LEVEL, {
    prefix: '[ui]',
  });

  /** @type {ChildProcessWithoutNullStreams | null} */
  let spawnProcess = null;

  if (spawnProcess !== null) {
    spawnProcess.off('exit', process.exit);
    spawnProcess.kill('SIGINT');
    spawnProcess = null;
  }

  const exe = join(__dirname, '..', 'node_modules', '.bin', 'svelte-package').concat(process.platform === 'win32' ? '.cmd': '');
  spawnProcess = spawn(exe, ['-w'], {
    cwd: './packages/ui/',
    env: { ...process.env },
    shell: process.platform === 'win32',
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
  spawnProcess.on('exit', process.exit);
};

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
  let spawnProcess;
  const folderName = resolve(name);

  console.log('dirname is', folderName);
  spawnProcess = spawn('yarn', ['--cwd', folderName, 'watch'], { shell: process.platform === 'win32' });

  spawnProcess.stdout.on('data', d => d.toString().trim() && console.warn(d.toString(), { timestamp: true }));
  spawnProcess.stderr.on('data', d => {
    const data = d.toString().trim();
    if (!data) return;
    console.error(data, { timestamp: true });
  });

  // Stops the watch script when the application has been quit
  spawnProcess.on('exit', process.exit);
};

(async () => {
  try {
    const extensions = []
    for(let index=0; index < process.argv.length;index++) {
      if (process.argv[index] === EXTENSION_OPTION && index < process.argv.length - 1) {
        extensions.push(resolve(process.argv[++index]));
      }
    }
    const viteDevServer = await createServer({
      ...sharedConfig,
      configFile: 'packages/renderer/vite.config.js',
      extensions: extensions
    });

    await viteDevServer.listen();

    // get extensions folder
    const extensionsFolder = resolve(__dirname, '../extensions/');

    // loop on all subfolders from the extensions folder
    readdirSync(extensionsFolder, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && existsSync(join(extensionsFolder, dirent.name, 'package.json')))
      .forEach(dirent => setupExtensionApiWatcher(join(extensionsFolder, dirent.name)));

    for (const extension of extensions) {
      setupExtensionApiWatcher(extension);
    }
    await setupPreloadPackageWatcher(viteDevServer);
    await setupPreloadDockerExtensionPackageWatcher(viteDevServer);
    await setupPreloadWebviewPackageWatcher(viteDevServer);
    await setupUiPackageWatcher();
    await setupMainPackageWatcher(viteDevServer);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
