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

import { expect, test, vi } from 'vitest';

import type { KubernetesGeneratorSelector } from '/@/plugin/kube-generator-registry.js';
import { KubeGeneratorRegistry } from '/@/plugin/kube-generator-registry.js';

test('Creating KubeGeneratorRegistry and getting KubeGeneratorsInfos', async () => {
  const result = new KubeGeneratorRegistry().getKubeGeneratorsInfos();
  expect(result).lengthOf(0);
});

test('Registering a provider', async () => {
  const kubeGeneratorRegistry = new KubeGeneratorRegistry();
  kubeGeneratorRegistry.registerKubeGenerator({
    name: 'Dummy',
    types: [],
    generate: vi.fn(),
  });

  const kubeGeneratorsInfos = kubeGeneratorRegistry.getKubeGeneratorsInfos();
  expect(kubeGeneratorsInfos).lengthOf(1);
  expect(kubeGeneratorsInfos[0]).toMatchObject({
    id: expect.any(String),
    name: 'Dummy',
    types: [],
  });
});

test('Registering multiple providers', async () => {
  const kubeGeneratorRegistry = new KubeGeneratorRegistry();

  Array.from({ length: 5 }, (_, index) => ({
    id: `${index}`,
    name: 'dummy',
    types: [],
    generate: vi.fn(),
  })).forEach(provider => {
    kubeGeneratorRegistry.registerKubeGenerator(provider);
  });

  const kubeGeneratorsInfos = kubeGeneratorRegistry.getKubeGeneratorsInfos();
  expect(kubeGeneratorsInfos).lengthOf(5);

  // Ensuring only unique ids are provided.
  const ids = kubeGeneratorsInfos.map(k => k.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('Dispose multiple providers', async () => {
  const kubeGeneratorRegistry = new KubeGeneratorRegistry();

  const disposables = Array.from({ length: 5 }, (_, index) => ({
    id: `${index}`,
    name: 'dummy',
    types: [],
    generate: vi.fn(),
  })).map(provider => kubeGeneratorRegistry.registerKubeGenerator(provider));

  expect(kubeGeneratorRegistry.getKubeGeneratorsInfos()).lengthOf(5);

  disposables.forEach(disposable => disposable.dispose());

  expect(kubeGeneratorRegistry.getKubeGeneratorsInfos()).lengthOf(0);
});

test('getKubeGeneratorsInfos by types', async () => {
  const kubeGeneratorRegistry = new KubeGeneratorRegistry();

  const typesTests: KubernetesGeneratorSelector[] = [['Compose'], ['Compose', 'Pod'], ['Pod', 'Container']];

  typesTests.forEach(typesTest => {
    kubeGeneratorRegistry.registerKubeGenerator({
      name: 'Dummy',
      types: typesTest,
      generate: vi.fn(),
    });
  });

  expect(kubeGeneratorRegistry.getKubeGeneratorsInfos('Compose')).lengthOf(2);
  expect(kubeGeneratorRegistry.getKubeGeneratorsInfos('Pod')).lengthOf(2);
  expect(kubeGeneratorRegistry.getKubeGeneratorsInfos('Container')).lengthOf(1);
  expect(kubeGeneratorRegistry.getKubeGeneratorsInfos(['Compose', 'Pod'])).lengthOf(1);
});
