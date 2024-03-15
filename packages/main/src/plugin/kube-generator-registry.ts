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
import type { KubernetesGeneratorInfo } from './api/KubernetesGeneratorInfo.js';
import { Disposable } from './types/disposable.js';

export type KubernetesGeneratorType = 'Compose' | 'Pod' | 'Container';

export type KubernetesGeneratorSelector = KubernetesGeneratorType | ReadonlyArray<KubernetesGeneratorType>;

export interface GenerateKubeResult {
  yaml: string;
}

export type KubernetesGeneratorArgument = {
  engineId: string;
  containers?: string[];
  pods?: string[];
  compose?: string[];
};

export interface KubernetesGeneratorProvider {
  readonly name: string;
  readonly types: KubernetesGeneratorSelector;
  generate(kubernetesGeneratorArguments: KubernetesGeneratorArgument[]): Promise<GenerateKubeResult>;
}

export class KubeGeneratorRegistry {
  private defaultProvider?: string;
  private kubeGenerators = new Map<string, KubernetesGeneratorProvider>();
  private count = 0;

  unregisterKubeGenerator(providerId: string): void {
    this.kubeGenerators.delete(providerId);
  }

  private generateProviderId(): string {
    const providerId = `${this.count}`;
    this.count += 1;
    return providerId;
  }

  registerDefaultKubeGenerator(kubeGenerator: KubernetesGeneratorProvider): Disposable {
    const providerId = this.generateProviderId();
    this.defaultProvider = providerId;
    this.kubeGenerators.set(providerId, kubeGenerator);
    return Disposable.create(() => {
      this.unregisterKubeGenerator(providerId);
    });
  }

  registerKubeGenerator(kubeGenerator: KubernetesGeneratorProvider): Disposable {
    const providerId = this.generateProviderId();
    this.kubeGenerators.set(providerId, kubeGenerator);
    return Disposable.create(() => {
      this.unregisterKubeGenerator(providerId);
    });
  }

  getKubeGenerator(kubeGeneratorId?: string): KubernetesGeneratorProvider | undefined {
    if (kubeGeneratorId) return this.kubeGenerators.get(kubeGeneratorId);
    else if (this.defaultProvider) return this.kubeGenerators.get(this.defaultProvider);
    return undefined;
  }

  getKubeGeneratorsInfos(selector?: KubernetesGeneratorSelector): KubernetesGeneratorInfo[] {
    return Array.from(this.kubeGenerators.entries()).reduce((previousValue, currentValue) => {
      const provider = currentValue[1];
      const isMatchingGenerator =
        selector === undefined ||
        (Array.isArray(selector) ? selector : [selector]).every(type => provider.types.includes(type));

      if (isMatchingGenerator) {
        previousValue.push({
          id: currentValue[0],
          name: provider.name,
          types: provider.types,
          default: this.defaultProvider === currentValue[0],
        });
      }

      return previousValue;
    }, [] as KubernetesGeneratorInfo[]);
  }
}
