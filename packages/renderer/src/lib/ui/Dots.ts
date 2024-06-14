/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { PodInfoContainerUI } from '../pod/PodInfoUI';

const allStatuses = ['running', 'created', 'paused', 'waiting', 'degraded', 'exited', 'stopped', 'terminated', 'dead'];

// All the possible statuses that will appear for both Pods and Kubernetes
// NOTE: See: https://tailwindcss.com/docs/content-configuration#dynamic-class-names
// we cannot do "partial" names like referencing 'bg-'+status because it will
// not be shown due to how svelte handles dynamic class names
export function getStatusColor(status: string): string {
  // Define the mapping directly with Record
  // must be either "bg-" or "outline-" for either solid / outline colors
  const colors: Record<string, string> = {
    // Podman & Kubernetes
    running: 'bg-[var(--pd-status-running)]',

    // Kubernetes-only
    terminated: 'bg-[var(--pd-status-terminated)]',
    waiting: 'bg-[var(--pd-status-waiting)]',

    // Podman-only
    stopped: 'outline-[var(--pd-status-stopped)]',
    paused: 'bg-[var(--pd-status-paused)]',
    exited: 'outline-[var(--pd-status-exited)]',
    dead: 'bg-[var(--pd-status-dead)]',
    created: 'outline-[var(--pd-status-created)]',
    degraded: 'bg-[var(--pd-status-degraded)]',
  };

  // Return the corresponding color class or a default if not found
  return colors[status] || 'bg-[var(--pd-status-unknown)]';
}

// Organize the containers by returning their status as the key + an array of containers by order of
// highest importance (running) to lowest (dead)
export function organizeContainers(containers: PodInfoContainerUI[]): Record<string, PodInfoContainerUI[]> {
  const organizedContainers: Record<string, PodInfoContainerUI[]> = {
    running: [],
    created: [],
    paused: [],
    waiting: [],
    degraded: [],
    exited: [],
    stopped: [],
    terminated: [],
    dead: [],
  };

  containers.forEach(container => {
    const statusKey = container.Status.toLowerCase();
    if (!organizedContainers[statusKey]) {
      organizedContainers[statusKey] = [container];
    } else {
      organizedContainers[statusKey].push(container);
    }
  });

  allStatuses.forEach(status => {
    organizedContainers[status] = organizedContainers[status] || [];
  });

  return organizedContainers;
}
