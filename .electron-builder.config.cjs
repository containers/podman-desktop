/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

const exec = require('child_process').exec;
const Arch = require('builder-util').Arch;
const path = require('path');
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');

if (process.env.VITE_APP_VERSION === undefined) {
  const now = new Date();
  process.env.VITE_APP_VERSION = `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}-${
    now.getUTCHours() * 60 + now.getUTCMinutes()
  }`;
}

let macosArches = ['x64', 'arm64', 'universal'];
let artifactNameSuffix = '';
if (process.env.AIRGAP_DOWNLOAD) {
  artifactNameSuffix = '-airgap';
  // Create dedicated but not universal builds for airgap as it's > 2GB for macOS
  macosArches = ['x64', 'arm64'];
}

async function addElectronFuses(context) {
  const { electronPlatformName, arch } = context;

  const ext = {
    darwin: '.app',
    win32: '.exe',
    linux: [''],
  }[electronPlatformName];

  const IS_LINUX = context.electronPlatformName === 'linux';
  const executableName = IS_LINUX
    ? context.packager.appInfo.productFilename.toLowerCase().replace('-dev', '').replace(' ', '-')
    : context.packager.appInfo.productFilename; // .toLowerCase() to accomodate Linux file named `name` but productFileName is `Name` -- Replaces '-dev' because on Linux the executable name is `name` even for the DEV builds

  const electronBinaryPath = path.join(context.appOutDir, `${executableName}${ext}`);

  let electronEnableInspect = false;
  if (process.env.ELECTRON_ENABLE_INSPECT === 'true') {
    electronEnableInspect = true;
  }

  await flipFuses(electronBinaryPath, {
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: electronEnableInspect,
  });
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  productName: 'Podman Desktop',
  appId: 'io.podman_desktop.PodmanDesktop',
  directories: {
    output: 'dist',
    buildResources: 'buildResources',
  },
  buildDependenciesFromSource: false,
  npmRebuild: false,
  beforePack: async context => {
    const DEFAULT_ASSETS = [];
    context.packager.config.extraResources = DEFAULT_ASSETS;

    // universal build, add both pkg files
    // this is hack to avoid issue https://github.com/electron/universal/issues/36
    if (
      context.appOutDir.endsWith('mac-universal-x64-temp') ||
      context.appOutDir.endsWith('mac-universal-arm64-temp')
    ) {
      context.packager.config.extraResources = DEFAULT_ASSETS;
      context.packager.config.extraResources.push(
        'extensions/podman/packages/extension/assets/podman-installer-macos-universal*.pkg',
      );
      return;
    }

    if (context.arch === Arch.arm64 && context.electronPlatformName === 'darwin') {
      context.packager.config.extraResources.push(
        'extensions/podman/packages/extension/assets/podman-installer-macos-aarch64-*.pkg',
      );
      context.packager.config.extraResources.push('extensions/podman/packages/extension/assets/podman-image-arm64.zst');
    }

    if (context.arch === Arch.x64 && context.electronPlatformName === 'darwin') {
      context.packager.config.extraResources.push(
        'extensions/podman/packages/extension/assets/podman-installer-macos-amd64-*.pkg',
      );
      context.packager.config.extraResources.push('extensions/podman/packages/extension/assets/podman-image-x64.zst');
    }

    if (context.electronPlatformName === 'win32') {
      // add the win-ca package
      context.packager.config.extraResources.push({
        from: 'node_modules/win-ca/lib/roots.exe',
        to: 'win-ca/roots.exe',
      });
      // add podman installer
      context.packager.config.extraResources.push('extensions/podman/packages/extension/assets/podman-*.exe');
    }
    if (context.arch === Arch.x64 && context.electronPlatformName === 'win32') {
      context.packager.config.extraResources.push('extensions/podman/packages/extension/assets/podman-image-x64.zst');
    }
    if (context.arch === Arch.arm64 && context.electronPlatformName === 'win32') {
      context.packager.config.extraResources.push('extensions/podman/packages/extension/assets/podman-image-arm64.zst');
    }
  },
  afterPack: async context => {
    await addElectronFuses(context);
  },
  files: ['packages/**/dist/**', 'extensions/**/builtin/*.cdix/**', 'packages/main/src/assets/**'],
  portable: {
    artifactName: `podman-desktop${artifactNameSuffix}-\${version}-\${arch}.\${ext}`,
  },
  nsis: {
    artifactName: `podman-desktop${artifactNameSuffix}-\${version}-setup-\${arch}.\${ext}`,
  },
  win: {
    target: [
      {
        target: 'portable',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'nsis',
        arch: ['x64', 'arm64'],
      },
    ],
    sign: configuration => azureCodeSign(configuration.path),
  },
  flatpak: {
    license: 'LICENSE',
    finishArgs: [
      // allow to execute commands remotely
      '--socket=session-bus',
      '--socket=wayland',
      '--socket=x11',
      '--share=ipc',
      // Open GL
      '--device=dri',
      // Read/write home directory access
      '--filesystem=home',
      // Read podman socket
      '--filesystem=xdg-run/podman:create',
      // Read docker socket
      '--filesystem=/run/docker.sock',
      // Allow communication with network
      '--share=network',
      // System notifications with libnotify
      '--talk-name=org.freedesktop.Notifications',
    ],
    useWaylandFlags: 'false',
    artifactName: 'podman-desktop-${version}.${ext}',
    runtimeVersion: '23.08',
    branch: 'main',
    files: [
      ['.flatpak-appdata.xml', '/share/metainfo/io.podman_desktop.PodmanDesktop.metainfo.xml'],
      ['buildResources/icon-512x512.png', '/share/icons/hicolor/512x512/apps/io.podman_desktop.PodmanDesktop.png'],
    ],
  },
  linux: {
    category: 'Development',
    icon: './buildResources/icon-512x512.png',
    target: ['flatpak', 'tar.gz'],
  },
  mac: {
    artifactName: `podman-desktop${artifactNameSuffix}-\${version}-\${arch}.\${ext}`,
    hardenedRuntime: true,
    entitlements: './node_modules/electron-builder-notarize/entitlements.mac.inherit.plist',
    target: {
      target: 'default',
      arch: macosArches,
    },
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications',
      },
      {
        x: 130,
        y: 150,
        type: 'file',
      },
    ],
  },
  protocols: {
    name: 'Podman Desktop',
    schemes: ['podman-desktop'],
    role: 'Editor',
  },
  publish: {
    provider: 'github',
    timeout: 10000,
  },
  /*extraMetadata: {
    version: process.env.VITE_APP_VERSION,
  },*/
};

// do not publish auto-update files for airgap mode
if (process.env.AIRGAP_DOWNLOAD) {
  config.publish = {
    publishAutoUpdate: false,
    provider: 'github',
  };
}

if (process.env.APPLE_TEAM_ID) {
  config.mac.notarize = {
    teamId: process.env.APPLE_TEAM_ID,
  };
}

const azureCodeSign = filePath => {
  if (!process.env.AZURE_KEY_VAULT_URL) {
    console.log('Skipping code signing, no environment variables set for that.');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const {
      AZURE_KEY_VAULT_TENANT_ID,
      AZURE_KEY_VAULT_CLIENT_ID,
      AZURE_KEY_VAULT_SECRET,
      AZURE_KEY_VAULT_URL,
      AZURE_KEY_VAULT_CERTIFICATE,
    } = process.env;

    // eslint-disable-next-line no-console
    console.log('Signing file', filePath);
    const command = `AzureSignTool sign -kvu ${AZURE_KEY_VAULT_URL} -kvi ${AZURE_KEY_VAULT_CLIENT_ID} -kvt ${AZURE_KEY_VAULT_TENANT_ID} -kvs ${AZURE_KEY_VAULT_SECRET} -kvc ${AZURE_KEY_VAULT_CERTIFICATE} -tr http://timestamp.digicert.com -v '${filePath}'`;
    exec(command, { shell: 'powershell.exe' }, (e, stdout, stderr) => {
      if (e instanceof Error) {
        console.log(e);
        reject(e);
        return;
      }

      if (stderr) {
        reject(new Error(stderr));
        return;
      }

      if (stdout.indexOf('Signing completed successfully') > -1) {
        // eslint-disable-next-line no-console
        console.log(stdout);
        resolve();
      } else {
        reject(new Error(stdout));
      }
    });
  });
};

module.exports = config;
