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

import ConfigMapSecretIcon from '/@/lib/images/ConfigMapSecretIcon.svelte';

import { kubernetesCurrentContextConfigMaps, kubernetesCurrentContextSecrets } from '../../kubernetes-contexts-state';
import type { NavigationRegistryEntry } from '../navigation-registry';

let configmapsCount = 0;
let secretsCount = 0;
let count = $state(0);

export function createNavigationKubernetesConfigMapSecretsEntry(): NavigationRegistryEntry {
  kubernetesCurrentContextConfigMaps.subscribe(value => {
    configmapsCount = value.length;
    count = configmapsCount + secretsCount;
  });
  kubernetesCurrentContextSecrets.subscribe(value => {
    secretsCount = value.length;
    count = configmapsCount + secretsCount;
  });

  const registry: NavigationRegistryEntry = {
    name: 'ConfigMaps & Secrets',
    icon: { iconComponent: ConfigMapSecretIcon },
    link: '/kubernetes/configmapsSecrets',
    tooltip: 'ConfigMaps & Secrets',
    type: 'entry',
    get counter() {
      return count;
    },
  };
  return registry;
}
