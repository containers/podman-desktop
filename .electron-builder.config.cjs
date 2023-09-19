/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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
  // Create only one universal build for airgap mode
  macosArches = ['universal'];
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
  beforePack: async (context) => {
    context.packager.config.extraResources = ['packages/main/src/assets/**'];

    // universal build, add both pkg files
    // this is hack to avoid issue https://github.com/electron/universal/issues/36
    if(context.appOutDir.endsWith('mac-universal--x64') || context.appOutDir.endsWith('mac-universal--arm64')){
      context.packager.config.extraResources.push('extensions/podman/assets/**');
      return;
    }

    if(context.arch === Arch.arm64 && context.electronPlatformName === 'darwin'){
      context.packager.config.extraResources.push('extensions/podman/assets/podman-installer-macos-aarch64-*.pkg');
    }

    if(context.arch === Arch.x64 && context.electronPlatformName === 'darwin'){
      context.packager.config.extraResources.push('extensions/podman/assets/podman-installer-macos-amd64-*.pkg');
    }

    if (context.electronPlatformName === 'win32') {
      // add the win-ca package
      context.packager.config.extraResources.push({
        from: 'node_modules/win-ca/lib/roots.exe',
        to: 'win-ca/roots.exe',
      });
      // add podman installer
      context.packager.config.extraResources.push('extensions/podman/assets/podman-*.exe');
    }
    if (context.arch === Arch.x64 && context.electronPlatformName === 'win32') {
      context.packager.config.extraResources.push('extensions/podman/assets/podman-image-x64.tar.xz');
    }
    if (context.arch === Arch.arm64 && context.electronPlatformName === 'win32') {
      context.packager.config.extraResources.push('extensions/podman/assets/podman-image-arm64.tar.xz');
    }
  },
  files: ['packages/**/dist/**', 'extensions/**/builtin/*.cdix/**'],
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
    runtimeVersion: '22.08',
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
  afterSign: 'electron-builder-notarize',
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
    role: "Editor"
  },
  publish: {
    provider: 'github',
    timeout: 10000,
  }
  /*extraMetadata: {
    version: process.env.VITE_APP_VERSION,
  },*/
};

// do not publish auto-update files for airgap mode
if (process.env.AIRGAP_DOWNLOAD) {
  config.publish = {
    publishAutoUpdate: false,
    provider: 'github'
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
