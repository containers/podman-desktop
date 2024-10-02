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
import { describe, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '../api.js';
import { ContextsStatesRegistry, isSecondaryResourceName } from './contexts-states-registry.js';

const apiSenderSendMock = vi.fn();
const apiSender: ApiSenderType = {
  send: apiSenderSendMock,
  receive: vi.fn(),
};

describe('ContextsStates tests', () => {
  test('isSecondaryResourceName', () => {
    expect(isSecondaryResourceName('pods')).toBeFalsy();
    expect(isSecondaryResourceName('services')).toBeTruthy();
  });

  test('isReachable', () => {
    const client = new ContextsStatesRegistry(apiSender);
    client.safeSetState('context1', state => (state.reachable = true));

    expect(client.isReachable('context1')).toBeTruthy();
    expect(client.isReachable('context2')).toBeFalsy();
    expect(client.isReachable('context3')).toBeFalsy();
  });

  test('state', () => {
    const states = new ContextsStatesRegistry(apiSender);
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
