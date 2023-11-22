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

import moment from 'moment';
import humanizeDuration from 'humanize-duration';
import type { DeploymentUI } from './DeploymentUI';
import type { V1Deployment } from '@kubernetes/client-node';

export class DeploymentUtils {
  humanizeAge(started: string): string {
    // get start time in ms
    const uptimeInMs = moment().diff(started);
    // make it human friendly
    return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
  }

  getDeploymentUI(deployment: V1Deployment): DeploymentUI {
    return {
      name: deployment.metadata?.name || '',
      namespace: deployment.metadata?.namespace || '',
      age: this.humanizeAge((deployment.metadata?.creationTimestamp || '').toString()),
      // number of replicas
      replicas: deployment.status?.replicas || 0,
      // ready pods
      ready: deployment.status?.readyReplicas || 0,
      selected: false,
    };
  }
}
