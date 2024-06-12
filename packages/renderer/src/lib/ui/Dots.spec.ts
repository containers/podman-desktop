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

import '@testing-library/jest-dom/vitest';

import { expect, test } from 'vitest';

import type { PodInfoContainerUI } from '../pod/PodInfoUI';
import { getStatusColor, organizeContainers } from './Dots';

// Mock a PodInfoContainerUI object that contains containers of all the different statuses
// running, terminated, waiting, stopped, paused, exited, dead, created, degraded
const mockContainers: PodInfoContainerUI[] = [
  {
    Id: '1',
    Names: 'container1',
    Status: 'running',
  },
  {
    Id: '2',
    Names: 'container2',
    Status: 'terminated',
  },
  {
    Id: '3',
    Names: 'container3',
    Status: 'waiting',
  },
  {
    Id: '4',
    Names: 'container4',
    Status: 'stopped',
  },
  {
    Id: '5',
    Names: 'container5',
    Status: 'paused',
  },
  {
    Id: '6',
    Names: 'container6',
    Status: 'exited',
  },
  {
    Id: '7',
    Names: 'container7',
    Status: 'dead',
  },
  {
    Id: '8',
    Names: 'container8',
    Status: 'created',
  },
  {
    Id: '9',
    Names: 'container9',
    Status: 'degraded',
  },
];

test('test getStatusColor returns the correct colors', () => {
  expect(getStatusColor('running')).toBe('bg-[var(--pd-status-running)]');
  expect(getStatusColor('terminated')).toBe('bg-[var(--pd-status-terminated)]');
  expect(getStatusColor('waiting')).toBe('bg-[var(--pd-status-waiting)]');
  expect(getStatusColor('stopped')).toBe('outline-[var(--pd-status-stopped)]');
  expect(getStatusColor('paused')).toBe('bg-[var(--pd-status-paused)]');
  expect(getStatusColor('exited')).toBe('outline-[var(--pd-status-exited)]');
  expect(getStatusColor('dead')).toBe('bg-[var(--pd-status-dead)]');
  expect(getStatusColor('created')).toBe('outline-[var(--pd-status-created)]');
  expect(getStatusColor('degraded')).toBe('bg-[var(--pd-status-degraded)]');
  expect(getStatusColor('unknown')).toBe('bg-[var(--pd-status-unknown)]');
});

test('test organizeContainers returns a record of containers organized by status', () => {
  const organizedContainers = organizeContainers(mockContainers);
  expect(organizedContainers.running.length).toBe(1);
  expect(organizedContainers.terminated.length).toBe(1);
  expect(organizedContainers.waiting.length).toBe(1);
  expect(organizedContainers.stopped.length).toBe(1);
  expect(organizedContainers.paused.length).toBe(1);
  expect(organizedContainers.exited.length).toBe(1);
  expect(organizedContainers.dead.length).toBe(1);
  expect(organizedContainers.created.length).toBe(1);
  expect(organizedContainers.degraded.length).toBe(1);
});

test('randomly re-order the containers and ensure they are still organized correctly after in the correct order', () => {
  // Copy mockContainers array and shuffle it
  const shuffledContainers = [...mockContainers].sort(() => Math.random() - 0.5);

  // Organize the shuffled containers
  const organizedContainers = organizeContainers(shuffledContainers);

  // Make sure it's corrected ordered by:
  // running, created, paused, waiting, degraded, exited, stopped, terminated, dead
  expect(organizedContainers.running[0].Id).toBe('1');
  expect(organizedContainers.created[0].Id).toBe('8');
  expect(organizedContainers.paused[0].Id).toBe('5');
  expect(organizedContainers.waiting[0].Id).toBe('3');
  expect(organizedContainers.degraded[0].Id).toBe('9');
  expect(organizedContainers.exited[0].Id).toBe('6');
  expect(organizedContainers.stopped[0].Id).toBe('4');
  expect(organizedContainers.terminated[0].Id).toBe('2');
  expect(organizedContainers.dead[0].Id).toBe('7');
});
