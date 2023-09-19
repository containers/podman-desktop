/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { Disposable } from '/@/plugin/types/disposable.js';

export interface KubeGenerator {
  command: string;
  id: string;
}

export class KubeGeneratorRegistry {
  private kubeGenerators = new Map<string, KubeGenerator>();

  registerKubeGenerators(kubeGenerators: KubeGenerator[]): Disposable {
    for (const kubeGenerator of kubeGenerators) {
      this.registerKubeGenerator(kubeGenerator);
    }

    return Disposable.create(() => {
      this.unregisterKubeGenerators(kubeGenerators);
    });
  }

  unregisterKubeGenerators(kubeGenerators: KubeGenerator[]): void {
    for (const kubeGenerator of kubeGenerators) {
      this.unregisterKubeGenerator(kubeGenerator);
    }
  }

  unregisterKubeGenerator(kubeGenerator: KubeGenerator): void {
    this.kubeGenerators.delete(kubeGenerator.id);
  }

  registerKubeGenerator(kubeGenerator: KubeGenerator): void {
    this.kubeGenerators.set(kubeGenerator.id, kubeGenerator);
  }

  getKubeGenerator(kubeGeneratorId: string): KubeGenerator | undefined {
    return this.kubeGenerators.get(kubeGeneratorId);
  }
}
