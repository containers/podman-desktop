/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { FeatureRegistry } from '/@/plugin/feature-registry.js';

class TestFeatureRegistry extends FeatureRegistry {
  public override listFeatures(): string[] {
    return super.listFeatures();
  }
}
const apiSenderMock: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

const ipcHandleMock = vi.fn();

describe('FeatureRegistry', () => {
  let featureRegistry: TestFeatureRegistry;

  beforeEach(() => {
    featureRegistry = new TestFeatureRegistry(ipcHandleMock, apiSenderMock);
  });

  test('should list registered features', () => {
    expect(featureRegistry.listFeatures()).toEqual([]);
    const dispose1 = featureRegistry.registerFeatures('extensionId1', ['feature1', 'feature2']);
    const dispose2 = featureRegistry.registerFeatures('extensionId2', ['feature3', 'feature4']);
    expect(featureRegistry.listFeatures()).toEqual(['feature1', 'feature2', 'feature3', 'feature4']);
    dispose1.dispose();
    expect(featureRegistry.listFeatures()).toEqual(['feature3', 'feature4']);
    dispose2.dispose();
    expect(featureRegistry.listFeatures()).toEqual([]);
  });

  test('init registers ipc handler and sends apiSender events on feature changes', () => {
    featureRegistry.init();

    expect(ipcHandleMock).toHaveBeenCalledWith('feature-registry:getRegisteredFeatures', expect.any(Function));

    featureRegistry.registerFeatures('ext1', ['feat1']);
    expect(apiSenderMock.send).toHaveBeenCalledWith('feature-registry:features-updated', ['feat1']);
  });

  test('handler passed to onFeaturesUpdated is called when features are registered and unregistered', () => {
    const listener: (features: string[]) => void = vi.fn();
    featureRegistry.onFeaturesUpdated(listener);
    expect(listener).not.toHaveBeenCalled();

    const dispose1 = featureRegistry.registerFeatures('extensionId1', ['feature1', 'feature2']);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(['feature1', 'feature2']);

    vi.mocked(listener).mockClear();
    const dispose2 = featureRegistry.registerFeatures('extensionId2', ['feature3', 'feature4']);
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(['feature1', 'feature2', 'feature3', 'feature4']);

    vi.mocked(listener).mockClear();
    dispose1.dispose();
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(['feature3', 'feature4']);

    vi.mocked(listener).mockClear();
    dispose2.dispose();
    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith([]);
  });
});
