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
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import type { AuditRecord, AuditRequestItems, AuditResult, CancellationToken } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
// @ts-expect-error ignore type error https://github.com/janl/mustache.js/issues/797
import mustache from 'mustache';
import { parseAllDocuments } from 'yaml';

import ingressManifests from '/@/resources/contour.yaml?raw';

import createClusterConfTemplate from './templates/create-cluster-conf.mustache?raw';
import { getKindPath, getMemTotalInfo } from './util';

export function getKindClusterConfig(
  clusterName: string,
  httpHostPort: number,
  httpsHostPort: number,
  controlPlaneImage?: string,
): string {
  return mustache.render(createClusterConfTemplate, {
    clusterName: clusterName,
    httpHostPort: httpHostPort,
    httpsHostPort: httpsHostPort,
    controlPlaneImage: controlPlaneImage,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTags(tags: any[]): any[] {
  for (const tag of tags) {
    if (tag.tag === 'tag:yaml.org,2002:int') {
      const newTag = { ...tag };
      newTag.test = /^(0[0-7][0-7][0-7])$/;
      newTag.resolve = (str: string): number => parseInt(str, 8);
      tags.unshift(newTag);
      break;
    }
  }
  return tags;
}

export async function setupIngressController(clusterName: string): Promise<void> {
  const manifests = parseAllDocuments(ingressManifests, { customTags: getTags });
  await extensionApi.kubernetes.createResources(
    'kind-' + clusterName,
    manifests.map(manifest => manifest.toJSON()),
  );
}

export async function connectionAuditor(provider: string, items: AuditRequestItems): Promise<AuditResult> {
  const records: AuditRecord[] = [];
  const auditResult = {
    records: records,
  };

  const image = items['kind.cluster.creation.controlPlaneImage'];
  if (image && !image.includes('@sha256:')) {
    records.push({
      type: 'warning',
      record: 'It is recommend to include the @sha256:{image digest} for the image used.',
    });
  }

  const providerSocket = extensionApi.provider
    .getContainerConnections()
    .find(connection => connection.connection.type === provider);

  if (!providerSocket) return auditResult;

  const memTotal = await getMemTotalInfo(providerSocket.connection.endpoint.socketPath);

  // check if configured memory is less than 6GB
  if (memTotal < 6000000000) {
    records.push({
      type: 'info',
      record: 'It is recommend to install Kind on a virtual machine with at least 6GB of memory.',
    });
  }

  return auditResult;
}

export async function createCluster(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any },
  kindCli: string,
  telemetryLogger: extensionApi.TelemetryLogger,
  logger?: extensionApi.Logger,
  token?: CancellationToken,
): Promise<void> {
  let clusterName = 'kind';
  if (params['kind.cluster.creation.name']) {
    clusterName = params['kind.cluster.creation.name'];
  }

  // grab provider
  let provider = 'docker';
  if (params['kind.cluster.creation.provider']) {
    provider = params['kind.cluster.creation.provider'];
  }

  const env = Object.assign({}, process.env) as { [key: string]: string };
  // add KIND_EXPERIMENTAL_PROVIDER env variable if needed
  if (provider === 'podman') {
    env['KIND_EXPERIMENTAL_PROVIDER'] = 'podman';
  }

  // grab http host port
  let httpHostPort = 9090;
  if (params['kind.cluster.creation.http.port']) {
    httpHostPort = params['kind.cluster.creation.http.port'];
  }

  // grab https host port
  let httpsHostPort = 9443;
  if (params['kind.cluster.creation.https.port']) {
    httpsHostPort = params['kind.cluster.creation.https.port'];
  }

  let ingressController = false;

  if (params['kind.cluster.creation.ingress']) {
    ingressController = params['kind.cluster.creation.ingress'];
  }

  // grab custom kind node image if defined
  const controlPlaneImage = params['kind.cluster.creation.controlPlaneImage'];

  // create the config file
  const kindClusterConfig = getKindClusterConfig(clusterName, httpHostPort, httpsHostPort, controlPlaneImage);

  // create a temporary file
  const tmpDirectory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'kind-cluster-config-'));

  // path to the file inside this directory
  const tmpFilePath = path.join(tmpDirectory, 'kind-cluster-config.yaml');

  // ok we need to write the file
  await fs.promises.writeFile(tmpFilePath, kindClusterConfig, 'utf8');

  // update PATH to include kind
  env.PATH = getKindPath() ?? '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const telemetryOptions: Record<string, any> = {
    provider,
    httpHostPort,
    httpsHostPort,
    ingressController,
  };

  // now execute the command to create the cluster
  const startTime = performance.now();
  try {
    await extensionApi.process.exec(kindCli, ['create', 'cluster', '--config', tmpFilePath], { env, logger, token });
    if (ingressController) {
      logger?.log('Creating ingress controller resources');
      await setupIngressController(clusterName);
    }
  } catch (error) {
    telemetryOptions.error = error;
    let errorMessage: string = '';

    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    throw new Error(`Failed to create kind cluster. ${errorMessage}`);
  } finally {
    const endTime = performance.now();
    telemetryOptions.duration = endTime - startTime;
    telemetryLogger.logUsage('createCluster', telemetryOptions);

    // delete temporary directory/file
    await fs.promises.rm(tmpDirectory, { recursive: true });
  }
}
