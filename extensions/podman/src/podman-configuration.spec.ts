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

import * as fs from 'node:fs';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

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
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
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

test('when enable rosetta is set to true and there is already a file with rosetta = false, remove it.', async () => {
  vi.mock('node:fs');
  const configFileContent = `
[machine]
memory = 4096
rosetta = false
    `;
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue(configFileContent);
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

  await podmanConfiguration.updateRosettaSetting(true);

  expect(fs.promises.writeFile).toHaveBeenCalledWith(
    podmanConfiguration.getContainersFileLocation(),
    // Expect that the write file did not contain any rosetta references
    expect.not.stringContaining('rosetta'),
  );
});

test('should disable Rosetta when useRosetta is false', async () => {
  vi.mock('node:fs');
  const configFileContent = `
[machine]
memory = 4096
rosetta = true
    `;
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue(configFileContent);
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

  await podmanConfiguration.updateRosettaSetting(false);

  expect(fs.promises.writeFile).toHaveBeenCalledWith(
    podmanConfiguration.getContainersFileLocation(),
    expect.stringContaining('rosetta = false'),
  );
});

test('if rosetta is set to true and the file does NOT exist, do not try and create the file.', async () => {
  vi.mock('node:fs');
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('');
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return false;
  });

  await podmanConfiguration.updateRosettaSetting(true);

  expect(fs.promises.writeFile).not.toHaveBeenCalled();
});

describe('isRosettaEnabled', () => {
  test('check rosetta is enabled', async () => {
    vi.mock('node:fs');
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue('');
    vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('[machine]\nrosetta=true');
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    const isEnabled = await podmanConfiguration.isRosettaEnabled();

    expect(isEnabled).toBeTruthy();
  });

  test('check rosetta is enabled if file is not containing rosetta setting (default value is true)', async () => {
    vi.mock('node:fs');
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue('');
    vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('');
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    const isEnabled = await podmanConfiguration.isRosettaEnabled();

    expect(isEnabled).toBeTruthy();
  });

  test('check rosetta is disabled', async () => {
    vi.mock('node:fs');
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue('');
    vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('[machine]\nrosetta=false');

    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    const isEnabled = await podmanConfiguration.isRosettaEnabled();

    expect(isEnabled).toBeFalsy();
  });
});
