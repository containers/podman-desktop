/**********************************************************************
 * Copyright (C) 2022-2025 Red Hat, Inc.
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

import type { PodInfo } from '@desktop-framework/api';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

import type { PodInfoUI } from './PodInfoUI';

export class PodUtils {
  getStatus(podinfo: PodInfo): string {
    return (podinfo.Status || '').toUpperCase();
  }

  humanizeAge(started: string): string {
    // Return nothing if 'started' is not provided
    if (!started) {
      return '';
    }

    const startedDate = toISOStringSafe(started);
    const uptimeInMs = moment().diff(startedDate);

    // Make it human-friendly
    return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
  }

  getUpDate(podInfoUI: PodInfoUI): Date | undefined {
    if (!podInfoUI.created) {
      return undefined;
    }

    const createdDate = toISOStringSafe(podInfoUI.created);
    return moment(createdDate).toDate();
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
      node: podinfo.node,
      namespace: podinfo.Namespace,
    };
  }

  calculateNewPodName(existedPods?: PodInfoUI[]): string {
    const proposedPodName = 'my-pod';

    if (!existedPods) {
      return proposedPodName;
    }

    const existedNames = existedPods.map(pod => pod.name);

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
export function ensureRestrictedSecurityContext(body: any): void {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  body.spec?.containers?.forEach((container: any) => {
    container.securityContext ??= {};
    container.securityContext.allowPrivilegeEscalation = false;
    container.securityContext.runAsNonRoot ??= true;
    container.securityContext.seccompProfile ??= {};
    if (
      !container.securityContext.seccompProfile.type ||
      (container.securityContext.seccompProfile.type !== 'RuntimeDefault' &&
        container.securityContext.seccompProfile.type !== 'Localhost')
    ) {
      container.securityContext.seccompProfile.type = 'RuntimeDefault';
    }
    container.securityContext.capabilities ??= {};
    container.securityContext.capabilities.drop ??= [];
    if (container.securityContext.capabilities.drop.indexOf('ALL') === -1) {
      container.securityContext.capabilities.drop.push('ALL');
    }
  });
}

// Utility function to safely convert a date string to ISO format
// To avoid https://momentjs.com/guides/#/warnings/js-date/ warning
// and provide better compatibility with the library, we will convert to ISO format before
// passing to moment
function toISOStringSafe(date: string): string {
  return new Date(date).toISOString();
}
