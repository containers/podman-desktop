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

import type { CliToolOptions, RunResult } from '@podman-desktop/api';
import { cli, process as podmanProcess } from '@podman-desktop/api';

export function activate() {
  setTimeout(() => {
    detectTool('kubectl', ['version', '--client=true', '-o=json'])
      .then(result => registerTool(result))
      .catch(console.log);
  });
}

async function detectTool(
  toolName: string,
  versionOptions: string[],
): Promise<Pick<CliToolOptions, 'version' | 'path'>> {
  return Promise.all([
    podmanProcess.exec(toolName, versionOptions),
    podmanProcess.exec(process.platform === 'win32' ? 'where' : 'which', [toolName]),
  ]).then((result: RunResult[]) => {
    const version = JSON.parse(result[0]?.stdout).clientVersion?.gitVersion.replace('v', '');
    const path = result[1]?.stdout?.split('\n')[0];
    if (version && path) {
      return { version, path };
    }
    throw new Error(`Cannot detect '${toolName}' CLI tool.`);
  });
}

async function registerTool(cliInfo: Pick<CliToolOptions, 'version' | 'path'>) {
  cli.createCliTool({
    markdownDescription:
      'A command line tool used to run commands against Kubernetes clusters. It does this by authenticating with the Control Plane Node of your cluster and making API calls to do a variety of management actions. If you are just getting started with Kubernetes, prepare to be spending a lot of time with kubectl.\n\nMore information: [kubernetes.io](https://kubernetes.io/docs/reference/kubectl/)',
    name: 'kubectl',
    displayName: 'kubectl',
    images: {
      icon: 'icon.png',
    },
    version: cliInfo.version,
    path: cliInfo.path,
  });
}
