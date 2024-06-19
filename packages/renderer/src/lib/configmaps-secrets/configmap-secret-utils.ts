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

import type { V1ConfigMap, V1Secret } from '@kubernetes/client-node';

import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

export class ConfigMapSecretUtils {
  // If it is a secret, then it will have a type property, as well as NO binaryData property
  isSecret(storage: V1ConfigMap | V1Secret): storage is V1Secret {
    return 'type' in storage && storage.type !== 'ConfigMap' && !('binaryData' in storage);
  }

  // If it is a configMap, then the type property will either be undefined, or it will be 'ConfigMap'
  isConfigMap(storage: V1ConfigMap | V1Secret): storage is V1ConfigMap {
    return ('type' in storage && storage.type === 'ConfigMap') || 'type' in storage === undefined;
  }

  getConfigMapSecretUI(storage: V1ConfigMap | V1Secret): ConfigMapSecretUI {
    const created = storage.metadata?.creationTimestamp;
    const keys = Object.keys(storage.data ?? {});

    // If storage.type does not exist, it's V1ConfigMap and just set the type as 'ConfigMap'
    let type = 'ConfigMap';
    // If storage.type exists, it's V1Secret and set the type as storage.type
    if ('type' in storage && storage.type) {
      type = storage.type;
    }

    return {
      name: storage.metadata?.name ?? '',
      namespace: storage.metadata?.namespace ?? '',
      status: 'RUNNING',
      keys,
      selected: false,
      type,
      created,
    };
  }
}
