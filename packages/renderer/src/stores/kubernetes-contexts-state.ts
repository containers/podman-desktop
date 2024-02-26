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

import { readable } from 'svelte/store';
import type { ContextGeneralState } from '../../../main/src/plugin/kubernetes-context-state';

export const kubernetesContextsState = readable(new Map<string, ContextGeneralState>(), set => {
  window.kubernetesGetContextsGeneralState().then(value => set(value));
  window.events?.receive('kubernetes-contexts-general-state-update', (value: unknown) => {
    set(value as Map<string, ContextGeneralState>);
  });
});

export const kubernetesCurrentContextState = readable(
  {
    reachable: false,
    error: 'initializing',
    resources: { pods: 0, deployments: 0 },
  } as ContextGeneralState,
  set => {
    window.kubernetesGetCurrentContextGeneralState().then(value => set(value));
    window.events?.receive('kubernetes-current-context-general-state-update', (value: unknown) => {
      set(value as ContextGeneralState);
    });
  },
);
