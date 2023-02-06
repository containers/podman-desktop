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

import moment from 'moment';
import humanizeDuration from 'humanize-duration';
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

  refreshAge(podInfoUI: PodInfoUI): string {
    if (podInfoUI.status !== 'RUNNING' || !podInfoUI.created) {
      return '';
    }
    // make it human friendly
    return this.humanizeAge(podInfoUI.created);
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
    };
  }
}
