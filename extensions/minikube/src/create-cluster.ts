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
import { getMinikubePath, runCliCommand } from './util';

import type { Logger, TelemetryLogger, CancellationToken } from '@podman-desktop/api';

export async function createCluster(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any },
  logger: Logger,
  minikubeCli: string,
  telemetryLogger: TelemetryLogger,
  token?: CancellationToken,
): Promise<void> {
  let clusterName = 'minikube';
  if (params['minikube.cluster.creation.name']) {
    clusterName = params['minikube.cluster.creation.name'];
  }

  let driver = 'docker';
  if (params['minikube.cluster.creation.driver']) {
    driver = params['minikube.cluster.creation.driver'];
  }

  let runtime = 'docker';
  if (params['minikube.cluster.creation.runtime']) {
    runtime = params['minikube.cluster.creation.runtime'];
  }

  const env = Object.assign({}, process.env);

  // update PATH to include minikube
  env.PATH = getMinikubePath();

  // now execute the command to create the cluster
  try {
    await runCliCommand(
      minikubeCli,
      ['start', '--profile', clusterName, '--driver', driver, '--container-runtime', runtime],
      { env, logger },
      token,
    );
    telemetryLogger.logUsage('createCluster', { driver, runtime });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    telemetryLogger.logError('createCluster', {
      driver,
      runtime,
      error: errorMessage,
      stdErr: errorMessage,
    });
    throw new Error(`Failed to create minikube cluster. ${errorMessage}`);
  }
}
