/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { PodContainerInfo, PodInfo } from '@podman-desktop/api';

import KubernetesTerminal from '/@/lib/pod/KubernetesTerminal.svelte';
import { terminalStates } from '/@/stores/kubernetes-terminal-state-store';
import { podsInfos } from '/@/stores/pods';

export class TerminalService {
  protected terminalCache = new Map();

  constructor() {
    podsInfos.subscribe($podsInfos => {
      this.invalidateCacheRecordOnStatusUpdate($podsInfos);
      this.invalidateCacheRecordOnPodRemove($podsInfos);
    });
  }

  protected invalidateCacheRecordOnStatusUpdate(podsInfos: PodInfo[]) {
    podsInfos.forEach((pod: PodInfo) => {
      pod.Containers.forEach((container: PodContainerInfo) => {
        if (container.Status !== 'running') {
          this.terminalCache.delete(this.toKey(pod.Name, container.Names));
        }
      });
    });
  }

  protected invalidateCacheRecordOnPodRemove(podsInfos: PodInfo[]) {
    const activePods = new Set(
      podsInfos.flatMap((pod: PodInfo) =>
        pod.Containers.map((container: PodContainerInfo) => this.toKey(pod.Name, container.Names)),
      ),
    );
    for (const [key] of this.terminalCache) {
      if (!activePods.has(key)) {
        this.invalidateTerminalComponentState(key);
        this.terminalCache.delete(key);
      }
    }
  }

  ensureTerminalExists(podName: string, containerName: string) {
    if (!this.terminalCache.has(this.toKey(podName, containerName))) {
      this.terminalCache.set(this.toKey(podName, containerName), {
        component: KubernetesTerminal,
        props: { podName: podName, containerName },
      });
    }
  }

  getTerminal(podName: string, containerName: string) {
    return this.terminalCache.get(this.toKey(podName, containerName));
  }

  hasTerminal(podName: string, containerName: string) {
    return this.terminalCache.has(this.toKey(podName, containerName));
  }

  protected invalidateTerminalComponentState(podAndContainerName: string) {
    terminalStates.update(states => {
      states.delete(podAndContainerName);
      return states;
    });
  }

  protected toKey(podName: string, containerName: string) {
    return `${podName}-${containerName}`;
  }
}

export const terminalService = new TerminalService();
