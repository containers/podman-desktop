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

import { ContextsStates, isSecondaryResourceName } from './contexts-states.js';
import { FakeInformer } from './kubernetes-context-state.spec.js';

describe('ContextsStates tests', () => {
  test('hasInformer should check if informer exists for context', () => {
    const client = new ContextsStates();
    client.setInformers(
      'context1',
      new Map([['pods', new FakeInformer('context1', '/path/to/resource', 0, undefined, [], [])]]),
    );
    expect(client.hasInformer('context1', 'pods')).toBeTruthy();
    expect(client.hasInformer('context1', 'deployments')).toBeFalsy();
    expect(client.hasInformer('context2', 'pods')).toBeFalsy();
    expect(client.hasInformer('context2', 'deployments')).toBeFalsy();
  });

  test('getContextsNames should return the names of contexts as array', () => {
    const client = new ContextsStates();
    client.setInformers(
      'context1',
      new Map([['pods', new FakeInformer('context1', '/path/to/resource', 0, undefined, [], [])]]),
    );
    client.setInformers(
      'context2',
      new Map([['pods', new FakeInformer('context2', '/path/to/resource', 0, undefined, [], [])]]),
    );
    expect(Array.from(client.getContextsNames())).toEqual(['context1', 'context2']);
  });

  test('isReachable', () => {
    const client = new ContextsStates();
    client.setInformers(
      'context1',
      new Map([['pods', new FakeInformer('context1', '/path/to/resource', 0, undefined, [], [])]]),
    );
    client.setInformers(
      'context2',
      new Map([['pods', new FakeInformer('context2', '/path/to/resource', 0, undefined, [], [])]]),
    );
    client.safeSetState('context1', state => (state.reachable = true));

    expect(client.isReachable('context1')).toBeTruthy();
    expect(client.isReachable('context2')).toBeFalsy();
    expect(client.isReachable('context3')).toBeFalsy();
  });

  test('isSecondaryResourceName', () => {
    expect(isSecondaryResourceName('pods')).toBeFalsy();
    expect(isSecondaryResourceName('services')).toBeTruthy();
  });

  test('informers registry', () => {
    const states = new ContextsStates();
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

  test('state', () => {
    const states = new ContextsStates();
    expect(states.getContextsGeneralState()).toStrictEqual(new Map());
    expect(states.getContextsCheckingState()).toStrictEqual(new Map());
    expect(states.getCurrentContextGeneralState('ctx1')).toStrictEqual({
      error: 'no current context',
      reachable: false,
      resources: {
        deployments: 0,
        pods: 0,
      },
    });

    states.safeSetState('ctx1', previous => {
      previous.reachable = true;
      previous.checking = { state: 'waiting' };
      previous.resources.pods.push({ metadata: { name: 'pod1' } });
    });
    states.safeSetState('ctx1', previous => {
      previous.resources.pods.push({ metadata: { name: 'pod2' } });
    });
    states.safeSetState('ctx1', previous => {
      previous.resources.deployments.push({ metadata: { name: 'deploy1' } });
    });
    expect(states.getContextsGeneralState()).toStrictEqual(
      new Map(
        Object.entries({
          ctx1: {
            checking: { state: 'waiting' },
            reachable: true,
            resources: { pods: 2, deployments: 1 },
          },
        }),
      ),
    );

    expect(states.getContextsCheckingState()).toStrictEqual(
      new Map(
        Object.entries({
          ctx1: { state: 'waiting' },
        }),
      ),
    );

    states.safeSetState('ctx2', previous => {
      previous.checking = { state: 'checking' };
    });
    expect(states.getContextsCheckingState()).toStrictEqual(
      new Map(
        Object.entries({
          ctx1: { state: 'waiting' },
          ctx2: { state: 'checking' },
        }),
      ),
    );

    expect(states.getCurrentContextGeneralState('ctx1')).toStrictEqual({
      checking: { state: 'waiting' },
      reachable: true,
      resources: {
        deployments: 1,
        pods: 2,
      },
      error: undefined,
    });
    expect(states.getCurrentContextGeneralState('ctx2')).toStrictEqual({
      checking: { state: 'checking' },
      reachable: false,
      resources: {
        deployments: 0,
        pods: 0,
      },
      error: undefined,
    });

    expect(states.getContextResources('ctx1', 'pods')).toStrictEqual([
      { metadata: { name: 'pod1' } },
      { metadata: { name: 'pod2' } },
    ]);
    expect(states.getContextResources('ctx1', 'deployments')).toStrictEqual([{ metadata: { name: 'deploy1' } }]);
    expect(states.getContextResources('ctx2', 'pods')).toStrictEqual([]);
    expect(states.getContextResources('ctx2', 'deployments')).toStrictEqual([]);
  });
});
