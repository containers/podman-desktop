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

if (process.env.VITE_APP_VERSION === undefined) {
  const now = new Date();
  process.env.VITE_APP_VERSION = `${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}-${
    now.getUTCHours() * 60 + now.getUTCMinutes()
  }`;
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
  files: ['packages/**/dist/**', 'extensions/**/builtin/*.cdix/**'],
  extraResources: ['packages/main/src/assets/**', 'extensions/podman/builtin/podman.cdix/assets/**'],
  portable: {
    artifactName: 'podman-desktop-${version}.${ext}',
  },
  nsis: {
    artifactName: 'podman-desktop-${version}-setup.${ext}',
  },
  win: {
    target: ['portable', 'nsis'],
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
      '--filesystem=xdg-run/podman',
      // Allow communication with network
      '--share=network',
      // System notifications with libnotify
      '--talk-name=org.freedesktop.Notifications',
    ],
    useWaylandFlags: 'true',
    artifactName: 'podman-desktop-${version}.${ext}',
    runtimeVersion: '21.08',
    branch: 'main',
    files: [
      ['.flatpak-appdata.xml', '/share/metainfo/io.podman_desktop.PodmanDesktop.metainfo.xml'],
    ],
  },
  linux: {
    icon: './buildResources/icon-512x512.png',
    target: ['flatpak', 'tar.gz'],
  },
  afterSign: 'electron-builder-notarize',
  mac: {
    artifactName: 'podman-desktop-${version}-${arch}.${ext}',
    hardenedRuntime: true,
    entitlements: './node_modules/electron-builder-notarize/entitlements.mac.inherit.plist',
    target: {
      target: 'default',
      arch: ['x64', 'arm64', 'universal'],
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
  /*extraMetadata: {
    version: process.env.VITE_APP_VERSION,
  },*/
};

module.exports = config;
