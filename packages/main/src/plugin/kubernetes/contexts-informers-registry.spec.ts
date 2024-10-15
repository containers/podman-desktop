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

import type { Informer, KubernetesObject } from '@kubernetes/client-node';
import { describe, expect, test } from 'vitest';

import { ContextsInformersRegistry } from './contexts-informers-registry.js';
import { TestInformer } from './test-informer.js';

describe('ContextsInformers tests', () => {
  test('hasInformer should check if informer exists for context', () => {
    const client = new ContextsInformersRegistry();
    client.setInformers(
      'context1',
      new Map([['pods', new TestInformer('context1', '/path/to/resource', 0, undefined, [], [])]]),
    );
    expect(client.hasInformer('context1', 'pods')).toBeTruthy();
    expect(client.hasInformer('context1', 'deployments')).toBeFalsy();
    expect(client.hasInformer('context2', 'pods')).toBeFalsy();
    expect(client.hasInformer('context2', 'deployments')).toBeFalsy();
  });

  test('getContextsNames should return the names of contexts as array', () => {
    const client = new ContextsInformersRegistry();
    client.setInformers(
      'context1',
      new Map([['pods', new TestInformer('context1', '/path/to/resource', 0, undefined, [], [])]]),
    );
    client.setInformers(
      'context2',
      new Map([['pods', new TestInformer('context2', '/path/to/resource', 0, undefined, [], [])]]),
    );
    expect(Array.from(client.getContextsNames())).toEqual(['context1', 'context2']);
  });

  test('informers registry', () => {
    const states = new ContextsInformersRegistry();
    expect(states.hasContext('ctx1')).toBeFalsy();
    expect(states.hasInformer('ctx1', 'services')).toBeFalsy();
    expect(states.getContextsNames()).toMatchObject({});

    states.setInformers('ctx1', new Map());
    expect(states.hasContext('ctx1')).toBeTruthy();
    expect(states.hasInformer('ctx1', 'services')).toBeFalsy();
    expect(states.hasInformer('ctx1', 'pods')).toBeFalsy();

    const informersWithService = new Map();
    informersWithService.set('services', {} as Informer<KubernetesObject>);
    states.setInformers('ctx1', informersWithService);
    expect(states.hasContext('ctx1')).toBeTruthy();
    expect(states.hasInformer('ctx1', 'services')).toBeTruthy();
    expect(states.hasInformer('ctx1', 'pods')).toBeFalsy();

    states.setResourceInformer('ctx1', 'pods', {} as Informer<KubernetesObject>);
    expect(states.hasContext('ctx1')).toBeTruthy();
    expect(states.hasInformer('ctx1', 'services')).toBeTruthy();
    expect(states.hasInformer('ctx1', 'pods')).toBeTruthy();

    expect(() => states.setResourceInformer('ctx2', 'pods', {} as Informer<KubernetesObject>)).toThrow(
      'watchers for context ctx2 not found',
    );
  });
});
