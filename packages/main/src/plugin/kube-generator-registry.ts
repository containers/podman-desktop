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

export type KubernetesGeneratorSelector = KubernetesGeneratorType | ReadonlyArray<KubernetesGeneratorType>;

export interface GenerateKubeResult {
  yaml: string;
}

export interface KubernetesGeneratorProvider {
  id: string;
  name: string;
  generate(engineId: string, ids: string[]): GenerateKubeResult;
  types: KubernetesGeneratorSelector;
}

export type KubeGeneratorsInfo = Omit<KubernetesGeneratorProvider, 'generate'>;

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

  registerKubeGenerator(kubeGenerator: KubernetesGeneratorProvider): Disposable {
    this.kubeGenerators.set(kubeGenerator.id, kubeGenerator);

    const selectors = Array.isArray(kubeGenerator.types) ? kubeGenerator.types : [kubeGenerator.types];

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

  getKubeGeneratorsInfos(selector: KubernetesGeneratorSelector | undefined): KubeGeneratorsInfo[] {
    return Array.from(this.kubeGenerators.values()).reduce((filteredGenerators, generator) => {
      const isMatchingGenerator =
        selector === undefined ||
        (Array.isArray(selector) ? selector : [selector]).every(type => generator.types.includes(type));

      if (isMatchingGenerator) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { generate: _, ...serializable } = generator;
        filteredGenerators.push(serializable);
      }

      return filteredGenerators;
    }, [] as KubeGeneratorsInfo[]);
  }
}
