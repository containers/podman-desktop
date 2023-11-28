/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type * as extensionApi from '@podman-desktop/api';
import { cli, process as podmanProcess } from '@podman-desktop/api';

let kubectlCliTool: extensionApi.CliTool | undefined;
interface KubectlVersionOutput {
  clientVersion: {
    major: string;
    minor: string;
    gitVersion: string;
    gitCommit: string;
    gitTreeState: string;
    buildDate: string;
    goVersion: string;
    compiler: string;
    platform: string;
  };
  kustomizeVersion: string;
}

export async function activate(): Promise<void> {
  // We put the cli activation in postActivate so that the extension is activated
  // immediately, and the cli is activated asynchronously.
  setTimeout(() => {
    postActivate().catch((error: unknown) => {
      console.error('Error activating extension', error);
    });
  }, 0);
}
async function postActivate(): Promise<void> {
  const binaryPath = await detectPath('kubectl');
  kubectlCliTool = cli.createCliTool({
    markdownDescription,
    name: 'kubectl',
    displayName: 'kubectl',
    images: {
      icon: 'icon.png',
    },
    path: binaryPath,
    getLocalVersion: async () => {
      return detectVersion('kubectl', ['version', '--client=true', '-o=json']);
    },
  });
}

export async function deactivate(): Promise<void> {
  // Dispose the CLI tool
  if (kubectlCliTool) {
    kubectlCliTool.dispose();
  }
}

async function detectVersion(toolName: string, versionOptions: string[]): Promise<string> {
  const result = await podmanProcess.exec(toolName, versionOptions);
  const versionOutput = JSON.parse(result.stdout) as KubectlVersionOutput;
  const version: string = versionOutput?.clientVersion?.gitVersion?.replace('v', '');
  if (version) {
    return version;
  }
  throw new Error('Cannot extract version from stdout');
}

const markdownDescription = `A command line tool for communicating with a Kubernetes cluster's control plane, using the Kubernetes API.\n\nMore information: [kubernetes.io](https://kubernetes.io/docs/reference/kubectl/)`;

async function detectPath(toolName: string): Promise<string> {
  const result = await podmanProcess.exec(process.platform === 'win32' ? 'where' : 'which', [toolName]);
  const location = result.stdout.split('\n')[0];
  if (location) {
    return location;
  }
  throw new Error(`Cannot extract path from ${toolName}`);
}
