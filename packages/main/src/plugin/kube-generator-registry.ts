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

export interface GenerateKubeResult {
  yaml: string;
}
export interface Provider {
  id: string;
  generate(engineId: string, ids: string[]): GenerateKubeResult;
}

export class KubeGeneratorRegistry {
  private kubeGenerators = new Map<string, Provider>();

  unregisterKubeGenerator(kubeGenerator: Provider): void {
    this.kubeGenerators.delete(kubeGenerator.id);
  }

  registerKubeGenerator(kubeGenerator: Provider): Disposable {
    console.log('registerKubeGenerator');
    this.kubeGenerators.set(kubeGenerator.id, kubeGenerator);

    return Disposable.create(() => {
      this.unregisterKubeGenerator(kubeGenerator);
    });
  }

  getKubeGenerator(kubeGeneratorId: string): Provider | undefined {
    console.log('getKubeGenerator');
    return this.kubeGenerators.get(kubeGeneratorId);
  }
}
