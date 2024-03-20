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

import '@testing-library/jest-dom/vitest';

import type { PodContainerInfo, PodInfo } from '@podman-desktop/api';
import { beforeEach, expect, test } from 'vitest';

import { TerminalService } from '/@/lib/pod/KubernetesTerminalService';

let terminalService: TestableKubernetesTerminalService;

class TestableKubernetesTerminalService extends TerminalService {
  public testInvalidateCacheRecordOnStatusUpdate(podsInfos: PodInfo[]) {
    return this.invalidateCacheRecordOnStatusUpdate(podsInfos);
  }

  public testToKey(podName: string, containerName: string): string {
    return super.toKey(podName, containerName);
  }

  public testInvalidateCacheRecordOnPodRemove(podsInfos: PodInfo[]) {
    return this.invalidateCacheRecordOnPodRemove(podsInfos);
  }

  public testTerminalCache() {
    return this.terminalCache;
  }
}

beforeEach(() => {
  terminalService = new TestableKubernetesTerminalService();
});

test('should create and cache a terminal if it does not exist', () => {
  const podName = 'pod1';
  const containerName = 'container1';

  terminalService.ensureTerminalExists(podName, containerName);
  const terminal = terminalService.getTerminal(podName, containerName);

  expect(terminal).toBeDefined();
  expect(terminal.props.podName).toBe(podName);
  expect(terminal.props.containerName).toBe(containerName);
});

test('should check if the terminal exists in the cache', () => {
  const podName = 'pod1';
  const containerName = 'container1';

  terminalService.ensureTerminalExists(podName, containerName);
  expect(terminalService.hasTerminal(podName, containerName)).toBeTruthy();
});

test('should invalidate cache for non-running containers', () => {
  terminalService.testTerminalCache().set('pod1-container1', {});
  const podsInfosMock: PodInfo[] = [
    {
      Name: 'pod1',
      Containers: [{ Names: 'container1', Status: 'exited' } as PodContainerInfo],
    } as PodInfo,
  ];

  terminalService.testInvalidateCacheRecordOnStatusUpdate(podsInfosMock);
  expect(terminalService.hasTerminal('pod1', 'container1')).toBe(false);
});

test('should invalidate cache when pod is removed', () => {
  terminalService.testTerminalCache().set('pod1-container1', {});
  terminalService.testInvalidateCacheRecordOnPodRemove([]);
  expect(terminalService.hasTerminal('pod1', 'container1')).toBe(false);
});

test('should return correct key identifier', () => {
  const key = terminalService.testToKey('pod1', 'container1');
  expect(key).toBe('pod1-container1');
});
