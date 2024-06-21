/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import humanizeDuration from 'humanize-duration';
import moment from 'moment';

import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import type { PodInfoUI } from './PodInfoUI';

export class PodUtils {
  getStatus(podinfo: PodInfo): string {
    return (podinfo.Status || '').toUpperCase();
  }

  humanizeAge(started: string): string {
    // get start time in ms
    const uptimeInMs = moment().diff(started);
    // make it human friendly
    return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
  }

  getUpDate(podInfoUI: PodInfoUI): Date | undefined {
    if (!podInfoUI.created) {
      return undefined;
    }

    // make it human friendly
    return moment(podInfoUI.created).toDate();
  }

  getEngineId(podinfo: PodInfo): string {
    return podinfo.engineId;
  }

  getEngineName(podinfo: PodInfo): string {
    return podinfo.engineName;
  }

  getPodInfoUI(podinfo: PodInfo): PodInfoUI {
    return {
      id: podinfo.Id,
      shortId: podinfo.Id.substring(0, 8),
      name: podinfo.Name,
      status: this.getStatus(podinfo),
      created: podinfo.Created,
      age: this.humanizeAge(podinfo.Created),
      engineId: this.getEngineId(podinfo),
      engineName: this.getEngineName(podinfo),
      containers: podinfo.Containers,
      selected: false,
      kind: podinfo.kind,
      node: podinfo.node,
      namespace: podinfo.Namespace,
    };
  }

  isKubernetesPod(pod: PodInfoUI): boolean {
    return pod.kind === 'kubernetes';
  }

  calculateNewPodName(existedPods?: PodInfo[]) {
    const proposedPodName = 'my-pod';

    if (!existedPods) {
      return proposedPodName;
    }

    const existedNames = existedPods.map(pod => pod.Name);

    if (!existedNames.includes(proposedPodName)) {
      return proposedPodName;
    } else {
      let count = 1;
      let uniqueName = `${proposedPodName}-${count}`;
      while (existedNames.includes(uniqueName)) {
        count++;
        uniqueName = `${proposedPodName}-${count}`;
      }
      return uniqueName;
    }
  }

  filterResetSearchTerm(f: string): string {
    return f
      .split(' ')
      .filter(part => part.startsWith('is:'))
      .join(' ');
  }
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function ensureRestrictedSecurityContext(body: any) {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  body.spec?.containers?.forEach((container: any) => {
    if (!container.securityContext) {
      container.securityContext = {};
    }
    container.securityContext.allowPrivilegeEscalation = false;
    if (!container.securityContext.runAsNonRoot) {
      container.securityContext.runAsNonRoot = true;
    }
    if (!container.securityContext.seccompProfile) {
      container.securityContext.seccompProfile = {};
    }
    if (
      !container.securityContext.seccompProfile.type ||
      (container.securityContext.seccompProfile.type !== 'RuntimeDefault' &&
        container.securityContext.seccompProfile.type !== 'Localhost')
    ) {
      container.securityContext.seccompProfile.type = 'RuntimeDefault';
    }
    if (!container.securityContext.capabilities) {
      container.securityContext.capabilities = {};
    }
    if (!container.securityContext.capabilities.drop) {
      container.securityContext.capabilities.drop = [];
    }
    if (container.securityContext.capabilities.drop.indexOf('ALL') === -1) {
      container.securityContext.capabilities.drop.push('ALL');
    }
  });
}
