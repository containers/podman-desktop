/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import type { Context } from '@kubernetes/client-node';

import type { KubeContext } from '/@api/kubernetes-context';

import { kubernetesIconBase64 } from './KubeIcon';

// Function that goes through KubeContext and adds kubernetesIconBase64 icon to each context
// TODO: In the future we will analyze which icon to use based on the cluster name and cluster information
// We have this in here rather than /plugin because this is UI related.
export function addIconToContexts(contexts: KubeContext[]): KubeContext[] {
  return contexts.map(ctx => {
    return { ...ctx, icon: kubernetesIconBase64 };
  });
}

export function setKubeUIContextError(contexts: Context[], contextName: string, error: Error): Context[] {
  return contexts.map(ctx => {
    if (ctx.name === contextName) {
      return { ...ctx, error: String(error) };
    } else {
      return { ...ctx };
    }
  });
}

export function clearKubeUIContextErrors(contexts: Context[], contextName?: string): Context[] {
  return contexts.map(ctx => {
    if (!contextName || ctx.name === contextName) {
      return { ...ctx, error: undefined };
    } else {
      return { ...ctx };
    }
  });
}
