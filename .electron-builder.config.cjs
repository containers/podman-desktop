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

const { exec, execFile } = require('child_process');
const Arch = require('builder-util').Arch;
const path = require('path');
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
const product = require('./product.json');
const fs = require('node:fs');

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
 * This function will start the script that will bundle the extensions#remote from the `product.json`
 * to the extensions-extra folder
 *
 * @remarks it should be called in the beforePack to populate the folder extensions-extra before electron builder pack them
 */
async function packageRemoteExtensions(context) {
  const downloadScript = path.join('packages', 'main', 'dist', 'download-remote-extensions.cjs');
  if (!fs.existsSync(downloadScript)) {
    console.warn(`${downloadScript} not found, skipping remote extension download`);
    return;
  }

  const destination = path.resolve('./extensions-extra');

  await new Promise((resolve, reject) => {
    execFile(
      'node',
      [downloadScript, `--output=${destination}`],
      { maxBuffer: 10 * 1024 * 1024 }, // use 10MB else default size is too small and we get stdout maxBuffer length exceeded
      (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      },
    );
  });
  context.packager.config.extraResources.push('./extensions-extra/**');
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  productName: product.name,
  appId: product.appId,
  directories: {
    output: 'dist',
    buildResources: 'buildResources',
  },
  buildDependenciesFromSource: false,
  npmRebuild: false,
  beforePack: async context => {
    const DEFAULT_ASSETS = [];
    const PODMAN_EXTENSION_ASSETS = 'extensions/podman/packages/extension/assets';
    context.packager.config.extraResources = DEFAULT_ASSETS;

    // download & package remote extensions
    await packageRemoteExtensions(context);

    // include product.json
    context.packager.config.extraResources.push({
      from: 'product.json',
      to: 'product.json',
    });

    // universal build: include both arch-specific pkg files
    if (
      context.appOutDir.endsWith('mac-universal-x64-temp') ||
      context.appOutDir.endsWith('mac-universal-arm64-temp')
    ) {
      context.packager.config.extraResources = DEFAULT_ASSETS;
      context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-installer-macos-aarch64-*.pkg`);
      context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-installer-macos-amd64-*.pkg`);
      return;
    }

    if (context.arch === Arch.arm64 && context.electronPlatformName === 'darwin') {
      context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-installer-macos-aarch64-*.pkg`);
      context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-image-arm64.zst`);
    }

    if (context.arch === Arch.x64 && context.electronPlatformName === 'darwin') {
      context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-installer-macos-amd64-*.pkg`);
      context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-image-x64.zst`);
    }

    if (context.electronPlatformName === 'win32') {
      // add podman installer
      if (context.arch === Arch.x64) {
        context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-installer-windows-amd64.msi`);
        context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-image-x64.zst`);
      }
      if (context.arch === Arch.arm64) {
        context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-installer-windows-arm64.msi`);
        context.packager.config.extraResources.push(`${PODMAN_EXTENSION_ASSETS}/podman-image-arm64.zst`);
      }
    }
  },
  afterPack: async context => {
    await addElectronFuses(context);
  },
  files: ['packages/**/dist/**', 'extensions/**/builtin/*.cdix/**', 'packages/main/src/assets/**'],
  portable: {
    artifactName: `${product.artifactName}${artifactNameSuffix}-\${version}-\${arch}.\${ext}`,
  },
  nsis: {
    artifactName: `${product.artifactName}${artifactNameSuffix}-\${version}-setup-\${arch}.\${ext}`,
    oneClick: false,
    include: 'buildResources/installer.nsh',
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
    /**
     * Use Azure Keyvault to sign the Windows binaries (using Digicert timestamp server and not Azure Trusted Signing).
     */
    signtoolOptions: {
      sign: configuration => azureKeyvaultSign(configuration.path),
    },
  },
  flatpak: {
    license: 'LICENSE',
    finishArgs: [
      '--socket=wayland',
      '--socket=x11',
      '--share=ipc',
      // Open GL
      '--device=dri',
      // Read/write home directory access
      '--filesystem=home',
      // Read-only access to /usr and /etc for managed-configuration support.
      // Flatpak sandboxes these directories, so we can't use --filesystem=/usr/share/podman-desktop:ro directly.
      // host-os:ro only exposes /usr and parts of /etc (not the full filesystem).
      // See: https://github.com/flatpak/flatpak/issues/5575
      // See: https://man7.org/linux/man-pages/man5/flatpak-metadata.5.html (host-os section)
      '--filesystem=host-os:ro',
      // Read podman socket
      '--filesystem=xdg-run/podman:create',
      // Read/write containers directory access (ability to save the application preferences)
      '--filesystem=xdg-run/containers:create',
      // Read docker socket
      '--filesystem=/run/docker.sock',
      // Allow communication with network
      '--share=network',
      // System notifications with libnotify
      '--talk-name=org.freedesktop.Notifications',
      // Allow safeStorage access to keyring to encrypt/decrypt file used to store sensitive information
      // In Gnome Desktop Environment
      '--talk-name=org.freedesktop.secrets',
      // In KDE Desktop Environment
      '--talk-name=org.kde.kwalletd6',
      // Allow registration and management of system tray icons and their associated
      // notifications in KDE Desktop Environment
      '--talk-name=org.kde.StatusNotifierWatcher',
      // Allow to interact with Flatpak system to execute commands outside the application's sandbox
      '--talk-name=org.freedesktop.Flatpak',
      // required to fix cursor scaling on wayland https://github.com/electron/electron/issues/19810 when the user uses --socket=wayland in their flatpak run
      '--env=XCURSOR_PATH=/run/host/user-share/icons:/run/host/share/icons',
    ],
    useWaylandFlags: 'false',
    artifactName: `${product.artifactName}-\${version}.\${ext}`,
    runtimeVersion: '26.08',
    branch: 'main',
    files: [
      ['.flatpak-appdata.xml', '/share/metainfo/io.podman_desktop.PodmanDesktop.metainfo.xml'],
      ['buildResources/icon-512x512.png', '/share/icons/hicolor/512x512/apps/io.podman_desktop.PodmanDesktop.png'],
    ],
  },
  linux: {
    category: 'Development',
    icon: './buildResources/icon-512x512.png',
    executableName: product.artifactName,
    artifactName: `${product.artifactName}${artifactNameSuffix}-\${version}-\${arch}.\${ext}`,
    target: ['flatpak', { target: 'tar.gz', arch: ['x64', 'arm64'] }],
  },
  mac: {
    artifactName: `${product.artifactName}${artifactNameSuffix}-\${version}-\${arch}.\${ext}`,
    hardenedRuntime: true,
    notarize: true,
    entitlements: './buildResources/entitlements.mac.plist',
    entitlementsInherit: './buildResources/entitlements.mac.plist',
    x64ArchFiles: 'Contents/Resources/app.asar.unpacked/**/*.node',
    target: {
      target: 'default',
      arch: macosArches,
    },
  },
  dmg: {
    background: 'buildResources/dmg-background.png',
    window: {
      width: 540,
      height: 380,
    },
    contents: [
      {
        x: 410,
        y: 166,
        type: 'link',
        path: '/Applications',
      },
      {
        x: 130,
        y: 166,
        type: 'file',
      },
    ],
  },
  protocols: {
    name: product.name,
    schemes: [product.urlProtocol],
    role: 'Editor',
  },
  publish: product.update?.url
    ? {
        provider: 'generic',
        url: product.update.url,
        timeout: 10000,
        ...(product.update?.updateChannel ? { channel: product.update.updateChannel } : {}),
      }
    : {
        provider: 'github',
        timeout: 10000,
        ...(product.update?.updateChannel ? { channel: product.update.updateChannel } : {}),
      },
  /*extraMetadata: {
    version: process.env.VITE_APP_VERSION,
  },*/
};

// do not publish auto-update files for airgap mode
if (process.env.AIRGAP_DOWNLOAD) {
  config.publish = {
    publishAutoUpdate: false,
    provider: product.update?.url ? 'generic' : 'github',
    ...(product.update?.url ? { url: product.update.url } : {}),
    ...(product.update?.updateChannel ? { channel: product.update.updateChannel } : {}),
  };
}

/**
 * Use a keyvault instance that has a certificate to sign the Windows binaries.
 * @param filePath
 * @return {Promise<void>}
 */
const azureKeyvaultSign = filePath => {
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
