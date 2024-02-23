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

import { derived, type Readable, readable } from 'svelte/store';
import type { ContextState } from '../../../main/src/plugin/kubernetes-context-state';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';

export const kubernetesContextsState = readable(new Map<string, ContextState>(), set => {
  window.kubernetesGetContextsState().then(value => set(value));
  window.events?.receive('kubernetes-contexts-state-update', (value: unknown) => {
    set(value as Map<string, ContextState>);
  });
});

export const kubernetesCurrentContextState: Readable<ContextState | undefined> = derived(
  [kubernetesContextsState, kubernetesContexts],
  ([$kubernetesContextsState, $kubernetesContexts]) => {
    const currentContextName = $kubernetesContexts.find(c => c.currentContext)?.name;
    if (currentContextName === undefined) return undefined;
    return $kubernetesContextsState.get(currentContextName);
  },
);
