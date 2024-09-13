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

import type * as extensionApi from '@podman-desktop/api';
import { describe, expect, test } from 'vitest';

import { BaseCheck, OrCheck, SequenceCheck } from './base-check';

class NegativeCheck extends BaseCheck {
  title = 'failed check';

  async execute(): Promise<extensionApi.CheckResult> {
    return this.createFailureResult({
      description: 'check has failed',
    });
  }
}

class PositiveCheck extends BaseCheck {
  title = 'successful check';

  async execute(): Promise<extensionApi.CheckResult> {
    return this.createSuccessfulResult();
  }
}

describe('OrCheck', () => {
  test('check OrCheck succeed if first check fails', async () => {
    const orCheck = new OrCheck('orcheck', new NegativeCheck(), new PositiveCheck());
    expect(orCheck.title).toBe('orcheck');
    const result = await orCheck.execute();
    expect(result.successful).toBeTruthy();
  });

  test('check OrCheck succeed if second check fails', async () => {
    const orCheck = new OrCheck('orcheck', new PositiveCheck(), new NegativeCheck());
    expect(orCheck.title).toBe('orcheck');
    const result = await orCheck.execute();
    expect(result.successful).toBeTruthy();
  });

  test('check OrCheck fails if both check failed', async () => {
    const orCheck = new OrCheck('orcheck', new NegativeCheck(), new NegativeCheck());
    expect(orCheck.title).toBe('orcheck');
    const result = await orCheck.execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).toBe('check has failed');
  });
});

describe('SequenceCheck', () => {
  test('check SequenceCheck fails if first check fails', async () => {
    const sequenceCheck = new SequenceCheck('sequence check', [new NegativeCheck(), new PositiveCheck()]);
    expect(sequenceCheck.title).toBe('sequence check');
    const result = await sequenceCheck.execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).toBe('check has failed');
  });

  test('check SequenceCheck fails if second check fails', async () => {
    const sequenceCheck = new SequenceCheck('sequence check', [new PositiveCheck(), new NegativeCheck()]);
    expect(sequenceCheck.title).toBe('sequence check');
    const result = await sequenceCheck.execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).toBe('check has failed');
  });

  test('check SequenceCheck fails if both check failed', async () => {
    const sequenceCheck = new SequenceCheck('sequence check', [new NegativeCheck(), new NegativeCheck()]);
    expect(sequenceCheck.title).toBe('sequence check');
    const result = await sequenceCheck.execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).toBe('check has failed');
  });

  test('check SequenceCheck succeed if both check succeed', async () => {
    const sequenceCheck = new SequenceCheck('sequence check', [new PositiveCheck(), new PositiveCheck()]);
    expect(sequenceCheck.title).toBe('sequence check');
    const result = await sequenceCheck.execute();
    expect(result.successful).toBeTruthy();
  });
});
