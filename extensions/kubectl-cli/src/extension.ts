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

import type { CliToolOptions } from '@podman-desktop/api';
import { cli, process as podmanProcess } from '@podman-desktop/api';

type KubectlInfo = Pick<CliToolOptions, 'version' | 'path'>;

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

export function activate() {
  setTimeout(() => {
    detectTool('kubectl', ['version', '--client=true', '-o=json'])
      .then(result => registerTool(result))
      .catch((error: unknown) => console.log(`Cannot detect kubectl CLI tool: ${String(error)}`));
  });
}

function extractVersion(stdout: string): string {
  const versionOutput = JSON.parse(stdout) as KubectlVersionOutput;
  const version: string = versionOutput?.clientVersion?.gitVersion?.replace('v', '');
  if (version) {
    return version;
  }
  throw new Error('Cannot extract version from stdout');
}

function extractPath(stdout: string): string {
  const location = stdout.split('\n')[0];
  if (location) {
    return location;
  }
  throw new Error('Cannot extract path form stdout');
}

async function detectTool(toolName: string, versionOptions: string[]): Promise<KubectlInfo> {
  const version = await podmanProcess.exec(toolName, versionOptions).then(result => extractVersion(result.stdout));
  const path = await podmanProcess
    .exec(process.platform === 'win32' ? 'where' : 'which', [toolName])
    .then(result => extractPath(result.stdout));
  return { version, path };
}

const markdownDescription = `A command line tool for communicating with a Kubernetes cluster's control plane, using the Kubernetes API.\n\nMore information: [kubernetes.io](https://kubernetes.io/docs/reference/kubectl/)`;

async function registerTool(cliInfo: KubectlInfo) {
  cli.createCliTool({
    markdownDescription,
    name: 'kubectl',
    displayName: 'kubectl',
    images: {
      icon: 'icon.png',
    },
    version: cliInfo.version,
    path: cliInfo.path,
  });
}
