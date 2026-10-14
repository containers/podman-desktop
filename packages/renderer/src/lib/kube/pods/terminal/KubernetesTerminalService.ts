/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import type { PodContainerInfo } from '@desktop-framework/extension-api';

import KubernetesTerminal from '/@/lib/kube/pods/terminal/KubernetesTerminal.svelte';
import type { PodInfoUI } from '/@/lib/pod/PodInfoUI';
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

  protected invalidateCacheRecordOnStatusUpdate(podsInfos: PodInfoUI[]): void {
    podsInfos.forEach((pod: PodInfoUI) => {
      pod.containers.forEach((container: PodContainerInfo) => {
        if (container.Status !== 'running') {
          this.terminalCache.delete(this.toKey(pod.name, container.Names));
        }
      });
    });
  }

  protected invalidateCacheRecordOnPodRemove(podsInfos: PodInfoUI[]): void {
    const activePods = new Set(
      podsInfos.flatMap((pod: PodInfoUI) =>
        pod.containers.map((container: PodContainerInfo) => this.toKey(pod.name, container.Names)),
      ),
    );
    for (const [key] of this.terminalCache) {
      if (!activePods.has(key)) {
        this.invalidateTerminalComponentState(key);
        this.terminalCache.delete(key);
      }
    }
  }

  ensureTerminalExists(podName: string, containerName: string): void {
    if (!this.terminalCache.has(this.toKey(podName, containerName))) {
      this.terminalCache.set(this.toKey(podName, containerName), {
        component: KubernetesTerminal,
        props: { podName: podName, containerName },
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTerminal(podName: string, containerName: string): any {
    return this.terminalCache.get(this.toKey(podName, containerName));
  }

  hasTerminal(podName: string, containerName: string): boolean {
    return this.terminalCache.has(this.toKey(podName, containerName));
  }

  protected invalidateTerminalComponentState(podAndContainerName: string): void {
    terminalStates.update(states => {
      states.delete(podAndContainerName);
      return states;
    });
  }

  protected toKey(podName: string, containerName: string): string {
    return `${podName}-${containerName}`;
  }
}

export const terminalService = new TerminalService();
