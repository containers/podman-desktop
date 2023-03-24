#!/usr/bin/env node

const { createServer, build, createLogger } = require('vite');
const electronPath = require('electron');
const { spawn } = require('child_process');
const { generateAsync } = require('dts-for-context-bridge');
const path = require('path');

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

/**
 * Start or restart App when source files are changed
 * @param {{ws: import('vite').WebSocketServer}} WebSocketServer
 */
const setupExtensionApiWatcher = name => {
  let spawnProcess;
  const folderName = path.resolve(name);

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

const setupBuiltinExtensionApiWatcher = name => {
  setupExtensionApiWatcher(path.resolve(__dirname, '../extensions/' + name));
}

(async () => {
  try {
    const extensions = []
    for(let index=0; index < process.argv.length;index++) {
      if (process.argv[index] === EXTENSION_OPTION && index < process.argv.length - 1) {
        extensions.push(path.resolve(process.argv[++index]));
      }
    }
    const viteDevServer = await createServer({
      ...sharedConfig,
      configFile: 'packages/renderer/vite.config.js',
      extensions: extensions
    });

    await viteDevServer.listen();
    await setupBuiltinExtensionApiWatcher('compose');
    await setupBuiltinExtensionApiWatcher('docker');
    await setupBuiltinExtensionApiWatcher('kube-context');
    await setupBuiltinExtensionApiWatcher('lima');
    await setupBuiltinExtensionApiWatcher('podman');
    await setupBuiltinExtensionApiWatcher('kind');
    await setupBuiltinExtensionApiWatcher('registries');
    for (const extension of extensions) {
      await setupExtensionApiWatcher(extension);
    }
    await setupPreloadPackageWatcher(viteDevServer);
    await setupPreloadDockerExtensionPackageWatcher(viteDevServer);
    await setupMainPackageWatcher(viteDevServer);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
