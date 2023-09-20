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
import { Disposable } from './types/disposable.js';

export type KubernetesGeneratorType = 'Compose' | 'Pod' | 'Container';

export type KubernetesGeneratorSelector = KubernetesGeneratorType | ReadonlyArray<KubernetesGeneratorType[]>;

export interface GenerateKubeResult {
  yaml: string;
}

export interface KubernetesGeneratorProvider {
  id: string;
  generate(engineId: string, ids: string[]): GenerateKubeResult;
}

export class KubeGeneratorRegistry {
  private kubeGenerators = new Map<string, KubernetesGeneratorProvider>();
  private kubeGeneratorsSelectors = new Map<KubernetesGeneratorType, string[]>();

  unregisterKubeGenerator(kubeGenerator: KubernetesGeneratorProvider): void {
    this.kubeGenerators.delete(kubeGenerator.id);

    for (const [key, value] of this.kubeGeneratorsSelectors) {
      const updatedIds = value.filter(existingId => existingId !== kubeGenerator.id);
      this.kubeGeneratorsSelectors.set(key, updatedIds);
    }
  }

  registerKubeGenerator(selector: KubernetesGeneratorSelector, kubeGenerator: KubernetesGeneratorProvider): Disposable {
    this.kubeGenerators.set(kubeGenerator.id, kubeGenerator);

    const selectors = Array.isArray(selector) ? selector : [selector];

    for (const s of selectors) {
      this.kubeGeneratorsSelectors.set(s, [...(this.kubeGeneratorsSelectors.get(s) ?? []), kubeGenerator.id]);
    }

    return Disposable.create(() => {
      this.unregisterKubeGenerator(kubeGenerator);
    });
  }

  getKubeGenerator(kubeGeneratorId: string): KubernetesGeneratorProvider | undefined {
    return this.kubeGenerators.get(kubeGeneratorId);
  }

  getKubeGeneratorsIdsByType(type: KubernetesGeneratorType): string[] {
    return this.kubeGeneratorsSelectors.get(type) ?? [];
  }
}
