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

import { beforeEach, expect, test, vi } from 'vitest';
import { ContainerUtils } from './container-utils';
import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';

let containerUtils: ContainerUtils;

beforeEach(() => {
  vi.clearAllMocks();
  containerUtils = new ContainerUtils();
});

test('should expect valid memory usage', async () => {
  const size = containerUtils.getMemoryPercentageUsageTitle(4, 1000000);
  expect(size).toBe('4.00% (1 MB)');
});

test('should expect short image for sha256', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node@sha256:61b92f38dff6ccc29969e7aa154d34e38b89443af1a2c14e6cfbd2df6419c66f',
  } as unknown as ContainerInfo;
  const image = containerUtils.getShortImage(containerInfo);
  expect(image).toBe('docker.io/kindest/node@sha256:61b92f3');
});

test('should expect full name for images', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
  } as unknown as ContainerInfo;
  const image = containerUtils.getShortImage(containerInfo);
  expect(image).toBe('docker.io/kindest/node:foobar');
});

test('should expect empty string when there are no public ports', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
  } as unknown as ContainerInfo;
  const ports = containerUtils.getPortsAsString(containerInfo);
  expect(ports).toBe('');
});

test('should expect port as string when there is one public ports', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
    Ports: [
      {
        PublicPort: 80,
      },
    ],
  } as unknown as ContainerInfo;
  const ports = containerUtils.getPortsAsString(containerInfo);
  expect(ports).toBe('80');
});

test('should expect ports as string when there are multiple public ports', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
    Ports: [
      {
        PublicPort: 80,
      },
      {
        PublicPort: 8022,
      },
    ],
  } as unknown as ContainerInfo;
  const ports = containerUtils.getPortsAsString(containerInfo);
  expect(ports).toBe('80, 8022');
});
