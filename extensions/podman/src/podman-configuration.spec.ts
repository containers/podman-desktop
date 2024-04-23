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

import { beforeEach, expect, test, vi } from 'vitest';

import { PodmanConfiguration } from './podman-configuration';

// allows to call protected methods
class TestPodmanConfiguration extends PodmanConfiguration {
  readContainersConfigFile(): Promise<string> {
    return super.readContainersConfigFile();
  }
}

let podmanConfiguration: TestPodmanConfiguration;

beforeEach(() => {
  podmanConfiguration = new TestPodmanConfiguration();
  vi.resetAllMocks();
});

test('should return true if regex is satisfied', async () => {
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue(`
[machine]
provider = "hyperv"
memory = 4096
    `);
  const found = await podmanConfiguration.matchRegexpInContainersConfig(/provider\s*=\s*"hyperv"/);
  expect(found).toBeTruthy();
});

test('should return false if regex is not satisfied', async () => {
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue(`
[machine]
provider = "wsl"
memory = 4096
    `);
  const found = await podmanConfiguration.matchRegexpInContainersConfig(/provider\s*=\s*"hyperv"/);
  expect(found).toBeFalsy();
});
