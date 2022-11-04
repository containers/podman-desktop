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
import type { ConfigurationRegistry } from '../configuration-registry';

import { Telemetry } from './telemetry';

class TelemetryTest extends Telemetry {
  constructor() {
    super({} as ConfigurationRegistry);
  }
  public getLastTimeEvents(): Map<string, number> {
    return this.lastTimeEvents;
  }

  public shouldDropEvent(eventName: string): boolean {
    return super.shouldDropEvent(eventName);
  }
}

let telemetry;

beforeEach(() => {
  telemetry = new TelemetryTest();
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should not filter out basic event', async () => {
  expect(telemetry.shouldDropEvent('basic')).toBeFalsy();
});

test('Should not filter out a list event if it is first time', async () => {
  expect(telemetry.shouldDropEvent('listFirstTime')).toBeFalsy();
});

test('Should filter out a list event if last event was < 24h', async () => {
  // last call was 23h ago
  telemetry.getLastTimeEvents().set('listSecondTime', Date.now() - 1000 * 60 * 60 * 23);
  expect(telemetry.shouldDropEvent('listSecondTime')).toBeTruthy();
});

test('Should not filter out a list event if last event was > 24h', async () => {
  // last call was 25h ago, so it should not be filtered out
  telemetry.getLastTimeEvents().set('listVeryVeryOldime', Date.now() - 1000 * 60 * 60 * 25);
  expect(telemetry.shouldDropEvent('listVeryVeryOldime')).toBeFalsy();
});
