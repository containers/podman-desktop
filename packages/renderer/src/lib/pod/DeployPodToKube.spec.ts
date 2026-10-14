/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { SimpleContainerInfo, V1Route } from '@desktop-framework/api';
import type { V1Pod } from '@kubernetes/client-node';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import * as jsYaml from 'js-yaml';
import { tick } from 'svelte';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import { registeredFeatures } from '/@/stores/registered-features';

import DeployPodToKube from './DeployPodToKube.svelte';

vi.mock(import('/@/lib/editor/MonacoEditor.svelte'));

// mock the router
vi.mock(import('tinro'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  registeredFeatures.set([]);

  // podYaml with volumes
  const podYaml = {
    metadata: {
      labels: {
        app: 'hello',
      },
      name: 'hello',
    },
    spec: {
      containers: [
        {
          name: 'hello',
          image: 'hello-world',
          volumeMounts: [
            // Test that this will be removed by PD
            {
              name: 'hello',
              mountPath: '/hello',
            },
          ],
          ports: [
            {
              hostPort: 8080,
              protocol: 'TCP',
              containerPort: 8080,
            },
          ],
        },
      ],
      volumes: [
        // Test that this will be removed by PD
        {
          name: 'hello',
          emptyDir: {},
        },
      ],
    },
  };

  vi.mocked(window.generatePodmanKube).mockResolvedValue(jsYaml.dump(podYaml));

  // Mock listSimpleContainersByLabel with a SimpleContainerInfo[] array of 1 container
  const simpleContainerInfo = {
    id: '1234',
    name: 'hello',
    image: 'hello-world',
    status: 'running',
    labels: {
      'com.docker.compose.project': 'hello',
    },
  } as unknown as SimpleContainerInfo;
  vi.mocked(window.listSimpleContainersByLabel).mockResolvedValue([simpleContainerInfo]);
});

async function waitRender(customProperties: Partial<DeployPodToKube>): Promise<void> {
  render(DeployPodToKube, { resourceId: 'foo', engineId: 'bar', type: 'unknown', ...customProperties });
  await tick();
}

test('Expect to create routes with OpenShift and open Link', async () => {
  vi.mocked(window.kubernetesReadNamespacedConfigMap).mockResolvedValue({
    data: {
      consoleURL: 'https://console-openshift-console.apps.cluster-1.example.com',
    },
  });
  vi.mocked(window.kubernetesGetCurrentContextName).mockResolvedValue('default');
  vi.mocked(window.kubernetesCreatePod).mockResolvedValue({
    metadata: { name: 'hello', namespace: 'default' },
  });

  vi.mocked(window.kubernetesReadNamespacedPod).mockResolvedValue({
    metadata: { name: 'hello' },
    status: {
      phase: 'Running',
    },
  });

  // say the pod has been created
  vi.mocked(window.kubernetesReadNamespacedPod).mockResolvedValue({
    metadata: { name: 'hello' },
    status: {
      phase: 'Running',
    },
  });

  vi.mocked(window.openshiftCreateRoute).mockResolvedValue({
    metadata: {
      name: 'hello-8080',
    },
    spec: {
      host: 'my-spec-host',
      port: {
        targetPort: '8080',
      },
    },
  } as unknown as V1Route);

  vi.mocked(window.kubernetesIsAPIGroupSupported).mockResolvedValue(true);
  await waitRender({});

  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();
  await fireEvent.click(createButton);

  // wait that openshiftCreateRouteMock is called
  await vi.waitFor(() => expect(vi.mocked(window.openshiftCreateRoute).mock.calls).not.toHaveLength(0));

  await vi.waitFor(() =>
    expect(window.telemetryTrack).toBeCalledWith('deployToKube', {
      useRoutes: true,
      useServices: true,
      isOpenshift: true,
      createIngress: false,
    }),
  );

  // check tls option is used
  expect(window.openshiftCreateRoute).toBeCalledWith('default', {
    apiVersion: 'route.openshift.io/v1',
    kind: 'Route',
    metadata: {
      name: 'hello-8080',
      namespace: 'default',
    },
    spec: {
      port: {
        targetPort: 8080,
      },
      tls: {
        termination: 'edge',
      },
      to: {
        kind: 'Service',
        name: 'hello-8080',
      },
    },
  });

  await tick();

  // now, grab the link 'openRoute' with name 'hello-8080'
  const openRouteButton = screen.getByRole('link', { name: 'hello-8080' });

  // click the button
  await fireEvent.click(openRouteButton);

  // expect the router to be called with the correct url
  expect(window.openExternal).toBeCalledWith('https://my-spec-host');
});

test('Expect to send telemetry event', async () => {
  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  await fireEvent.click(createButton);
  await waitFor(() =>
    expect(window.telemetryTrack).toBeCalledWith('deployToKube', {
      useRoutes: true,
      useServices: true,
      createIngress: false,
    }),
  );
});

test('Expect to send telemetry event with OpenShift', async () => {
  vi.mocked(window.kubernetesReadNamespacedConfigMap).mockResolvedValue({
    data: {
      consoleURL: 'https://console-openshift-console.apps.cluster-1.example.com',
    },
  });
  vi.mocked(window.kubernetesIsAPIGroupSupported).mockResolvedValue(true);
  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  await fireEvent.click(createButton);
  await waitFor(() =>
    expect(window.telemetryTrack).toBeCalledWith('deployToKube', {
      useRoutes: true,
      useServices: true,
      isOpenshift: true,
      createIngress: false,
    }),
  );
});

test('Expect to send telemetry error event', async () => {
  // creation throws an error
  vi.mocked(window.kubernetesCreatePod).mockRejectedValue(new Error('Custom Error'));

  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // expect it throws a telemetry event reporting an error
  await fireEvent.click(createButton);
  await waitFor(() =>
    expect(window.telemetryTrack).toHaveBeenCalledWith('deployToKube', {
      errorMessage: 'Custom Error',
      useRoutes: true,
      useServices: true,
      createIngress: false,
    }),
  );
});

test('When deploying a pod, volumes should not be added (they are deleted by podman desktop)', async () => {
  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // Press the deploy button
  await fireEvent.click(createButton);

  // Expect kubernetesCreatePod to be called with default namespace and a modified bodyPod with volumes removed
  await waitFor(() =>
    expect(window.kubernetesCreatePod).toBeCalledWith('default', {
      metadata: {
        labels: {
          app: 'hello',
        },
        name: 'hello',
      },
      spec: {
        containers: [
          {
            name: 'hello',
            image: 'hello-world',
            imagePullPolicy: 'IfNotPresent',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
          },
        ],
      },
    }),
  );
});

// Test deploying a compose group of containers
test('Test deploying a group of compose containers with type compose still functions the same as normal deploy', async () => {
  await waitRender({ type: 'compose' } as Partial<DeployPodToKube>);
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // Press the deploy button
  await fireEvent.click(createButton);

  // Expect to return the correct create pod yaml
  await waitFor(() =>
    expect(window.kubernetesCreatePod).toBeCalledWith('default', {
      metadata: {
        labels: {
          app: 'hello',
        },
        name: 'hello',
      },
      spec: {
        containers: [
          {
            name: 'hello',
            image: 'hello-world',
            imagePullPolicy: 'IfNotPresent',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
          },
        ],
      },
    }),
  );
});

// After modifying the pod name, metadata.apps.label should also have been changed
test('When modifying the pod name, metadata.apps.label should also have been changed', async () => {
  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  const podNameInput = screen.getByLabelText('Pod Name');
  await userEvent.click(podNameInput);
  await userEvent.clear(podNameInput);
  await userEvent.keyboard('newName');

  // Press the deploy button
  await fireEvent.click(createButton);

  // Expect kubernetesCreatePod to be called with default namespace and a modified bodyPod with volumes removed
  await waitFor(() =>
    expect(window.kubernetesCreatePod).toBeCalledWith('default', {
      metadata: {
        labels: {
          app: 'newName',
        },
        name: 'newName',
      },
      spec: {
        containers: [
          {
            name: 'hello',
            image: 'hello-world',
            imagePullPolicy: 'IfNotPresent',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],
          },
        ],
      },
    }),
  );
});

test('When deploying a pod, restricted security context is added', async () => {
  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // Click restricted
  const useRestricted = screen.getByRole('checkbox', { name: 'Use Restricted Security Context' });
  await fireEvent.click(useRestricted);

  // Press the deploy button
  await fireEvent.click(createButton);

  // Expect kubernetesCreatePod to be called with default namespace and a modified bodyPod with volumes removed
  await waitFor(() =>
    expect(window.kubernetesCreatePod).toBeCalledWith('default', {
      metadata: {
        labels: {
          app: 'hello',
        },
        name: 'hello',
      },
      spec: {
        containers: [
          {
            name: 'hello',
            image: 'hello-world',
            imagePullPolicy: 'IfNotPresent',
            ports: [
              {
                containerPort: 8080,
                protocol: 'TCP',
              },
            ],

            securityContext: {
              allowPrivilegeEscalation: false,
              capabilities: {
                drop: ['ALL'],
              },
              runAsNonRoot: true,
              seccompProfile: {
                type: 'RuntimeDefault',
              },
            },
          },
        ],
      },
    }),
  );
});

test('Succeed to deploy ingress if service is selected', async () => {
  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // Checkmark the ingress
  const checkbox = screen.getByRole('checkbox', { name: 'Create Ingress' });
  await fireEvent.click(checkbox);
  expect(checkbox).toHaveProperty('checked', true);

  // Press the deploy button
  await fireEvent.click(createButton);

  // Expect kubernetesCreateIngress to not be called since we error out as service wasn't selected
  expect(window.kubernetesCreateIngress).toHaveBeenCalled();
});

test('fail to deploy ingress if service is unselected', async () => {
  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // Press the deploy button
  await fireEvent.click(createButton);

  // Expect kubernetesCreateIngress to not be called since we error out as service wasn't selected
  expect(window.kubernetesCreateIngress).not.toHaveBeenCalled();
});

test('Should display Open pod button after successful deployment', async () => {
  vi.mocked(window.kubernetesGetCurrentContextName).mockResolvedValue('default');

  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  vi.mocked(window.kubernetesCreatePod).mockResolvedValue({
    metadata: { name: 'my-pod', namespace: 'default' },
  });
  vi.mocked(window.kubernetesReadNamespacedPod).mockResolvedValue({
    metadata: { name: 'my-pod', namespace: 'default' },
    status: {
      phase: 'Running',
    },
  });

  vi.useFakeTimers({ shouldAdvanceTime: true });
  await fireEvent.click(createButton);
  await vi.runAllTimersAsync();

  const doneButton = screen.getByRole('button', { name: 'Done' });
  expect(doneButton).toBeInTheDocument();
  expect(doneButton).toBeEnabled();

  const openPodButton = screen.getByRole('button', { name: 'Open Pod' });
  expect(openPodButton).toBeInTheDocument();
  expect(openPodButton).toBeEnabled();

  await fireEvent.click(openPodButton);
  expect(window.navigateToRoute).toBeCalledWith('kubernetes', {
    kind: 'Pod',
    name: 'my-pod',
    namespace: 'default',
  });
});

test('Done button should go back to previous page', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });

  vi.mocked(window.kubernetesGetCurrentContextName).mockResolvedValue('default');

  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  vi.mocked(window.kubernetesCreatePod).mockResolvedValue({
    metadata: { name: 'foobar/api-fake-cluster.com:6443', namespace: 'default' },
  });
  vi.mocked(window.kubernetesReadNamespacedPod).mockResolvedValue({
    metadata: { name: 'foobar/api-fake-cluster.com:6443' },
    status: {
      phase: 'Running',
    },
  });

  await fireEvent.click(createButton);

  const doneButton = await vi.waitFor(async () => {
    await vi.advanceTimersByTimeAsync(2000);
    return screen.getByRole('button', { name: 'Done' });
  });
  expect(doneButton).toBeInTheDocument();
  expect(doneButton).toBeEnabled();

  lastPage.set({ name: 'perious page', path: '/last' });
  await fireEvent.click(doneButton);
  expect(router.goto).toHaveBeenCalledWith(`/last`);
});

test('Should hide Open Pod button when kubernetes-dashboard feature is active', async () => {
  registeredFeatures.set(['kubernetes-dashboard']);
  vi.mocked(window.kubernetesGetCurrentContextName).mockResolvedValue('default');

  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });

  vi.mocked(window.kubernetesCreatePod).mockResolvedValue({
    metadata: { name: 'my-pod', namespace: 'default' },
  });
  vi.mocked(window.kubernetesReadNamespacedPod).mockResolvedValue({
    metadata: { name: 'my-pod', namespace: 'default' },
    status: { phase: 'Running' },
  });

  vi.useFakeTimers({ shouldAdvanceTime: true });
  await fireEvent.click(createButton);
  await vi.runAllTimersAsync();

  expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Open Pod' })).toBeNull();
});

test('Should show Open Pod button when kubernetes-dashboard feature becomes inactive', async () => {
  registeredFeatures.set(['kubernetes-dashboard']);
  vi.mocked(window.kubernetesGetCurrentContextName).mockResolvedValue('default');

  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });

  vi.mocked(window.kubernetesCreatePod).mockResolvedValue({
    metadata: { name: 'my-pod', namespace: 'default' },
  });
  vi.mocked(window.kubernetesReadNamespacedPod).mockResolvedValue({
    metadata: { name: 'my-pod', namespace: 'default' },
    status: { phase: 'Running' },
  });

  vi.useFakeTimers({ shouldAdvanceTime: true });
  await fireEvent.click(createButton);
  await vi.runAllTimersAsync();

  expect(screen.queryByRole('button', { name: 'Open Pod' })).toBeNull();

  registeredFeatures.set([]);
  await vi.waitFor(() => {
    expect(screen.getByRole('button', { name: 'Open Pod' })).toBeInTheDocument();
  });
});

test('ImagePullBackOff error should be reported', async () => {
  await waitRender({});
  const createButton = screen.getByRole('button', { name: 'Deploy' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  vi.mocked(window.kubernetesCreatePod).mockResolvedValue({
    metadata: { name: 'my-pod', namespace: 'default' },
  });
  vi.mocked(window.kubernetesReadNamespacedPod).mockResolvedValue({
    metadata: { name: 'my-pod', namespace: 'default' },
    status: {
      containerStatuses: [
        {
          state: {
            waiting: {
              reason: 'ImagePullBackOff',
            },
          },
        },
      ],
    },
  } as unknown as V1Pod);

  vi.useFakeTimers({ shouldAdvanceTime: true });
  await fireEvent.click(createButton);
  await vi.runAllTimersAsync();

  await waitFor(() => {
    // The error is reported to the telemetry and to the user
    expect(window.telemetryTrack).toBeCalledWith('deployToKube', {
      errorMessage: 'ImagePullBackOff',
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'ImagePullBackOff error, please check that the image is accessible from the Kubernetes cluster',
    );
  });
  await vi.waitFor(() => {
    // The deploy button is displayed again, meaning that the deploy process has been aborted
    const deployButton = screen.getByRole('button', { name: 'Deploy' });
    expect(deployButton).toBeVisible();
    expect(deployButton).toBeEnabled();
  });
});
