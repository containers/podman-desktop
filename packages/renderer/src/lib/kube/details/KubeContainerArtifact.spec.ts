/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import type { V1Container } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import KubeContainerArtifact from './KubeContainerArtifact.svelte'; // Adjust the import path as necessary

const fakeContainer: V1Container = {
  name: 'fakeContainerName',
  image: 'fakeImageName',
  imagePullPolicy: 'IfNotPresent',
  ports: [
    { containerPort: 8080, protocol: 'TCP' },
    { containerPort: 8443, protocol: 'TCP' },
  ],
  env: [
    { name: 'ENV_VAR_1', value: 'value1' },
    { name: 'ENV_VAR_2', value: 'value2' },
  ],
  volumeMounts: [
    { name: 'volumeMount1', mountPath: '/path/to/mount1' },
    { name: 'volumeMount2', mountPath: '/path/to/mount2' },
  ],
};

test('Container artifact renders with correct values', async () => {
  render(KubeContainerArtifact, { artifact: fakeContainer });

  // Check if basic container info is displayed
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('fakeContainerName')).toBeInTheDocument();

  expect(screen.getByText('Image')).toBeInTheDocument();
  expect(screen.getByText('fakeImageName')).toBeInTheDocument();

  expect(screen.getByText('Image Pull Policy')).toBeInTheDocument();
  expect(screen.getByText('IfNotPresent')).toBeInTheDocument();

  // Check if ports are displayed correctly
  if (fakeContainer.ports && fakeContainer.ports.length > 0) {
    const portsText = fakeContainer.ports.map(port => `${port.containerPort}/${port.protocol}`).join(', ');
    expect(screen.getByText('Ports')).toBeInTheDocument();
    expect(screen.getByText(portsText)).toBeInTheDocument();
  }

  // Check if environment variables are displayed correctly
  if (fakeContainer.env && fakeContainer.env.length > 0) {
    expect(screen.getByText('Environment Variables')).toBeInTheDocument();
    fakeContainer.env.forEach(envVar => {
      expect(screen.getByText(`${envVar.name}: ${envVar.value}`)).toBeInTheDocument();
    });
  }

  // Check if volume mounts are displayed correctly
  if (fakeContainer.volumeMounts && fakeContainer.volumeMounts.length > 0) {
    const mountsText = fakeContainer.volumeMounts.map(vm => vm.name).join(', ');
    expect(screen.getByText('Volume Mounts')).toBeInTheDocument();
    expect(screen.getByText(mountsText)).toBeInTheDocument();
  }
});
