/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { IDisposable } from '@desktop-framework/api';
import type { KubernetesObject, V1Job } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import * as resourcesListen from '/@/lib/kube/resources-listen';
import * as states from '/@/stores/kubernetes-contexts-state';

import JobList from './JobList.svelte';

vi.mock(import('/@/stores/kubernetes-contexts-state'));
vi.mock(import('/@/lib/kube/resources-listen'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(states).jobSearchPattern = writable<string>('');
  vi.mocked(states).kubernetesContextsCheckingStateDelayed = writable();
  vi.mocked(states).kubernetesCurrentContextState = writable();
});

describe.each<{
  experimental: boolean;
  initMocks: () => void;
  initObjectsList: (objects: KubernetesObject[]) => { update: (objects: KubernetesObject[]) => void };
}>([
  {
    experimental: true,
    initMocks: (): void => {
      vi.mocked(states).kubernetesCurrentContextJobsFiltered = writable();
    },
    initObjectsList: (objects: KubernetesObject[]): { update: (objects: KubernetesObject[]) => void } => {
      let callback: (resoures: KubernetesObject[]) => void;
      vi.mocked(resourcesListen.listenResources).mockImplementation(
        async (_resources, _options, cb): Promise<IDisposable> => {
          callback = cb;
          setTimeout(() => callback(objects));
          return {
            dispose: (): void => {},
          };
        },
      );
      return {
        update: (updatedObjects: KubernetesObject[]): void => {
          callback(updatedObjects);
        },
      };
    },
  },
  {
    experimental: false,
    initMocks: (): void => {
      vi.mocked(resourcesListen.listenResources).mockResolvedValue(undefined);
    },
    initObjectsList: (objects: KubernetesObject[]): { update: (objects: KubernetesObject[]) => void } => {
      const store = writable<KubernetesObject[]>(objects);
      vi.mocked(states).kubernetesCurrentContextJobsFiltered = store;
      return {
        update: (objects: KubernetesObject[]): void => {
          store.set(objects);
        },
      };
    },
  },
])('kubernetes experimental is %s', ({ experimental: _experimental, initObjectsList, initMocks }) => {
  beforeEach(() => {
    initMocks();
  });

  test('Expect job empty screen', async () => {
    initObjectsList([]);
    render(JobList);
    await vi.waitFor(() => {
      const noJobs = screen.getByRole('heading', { name: 'No jobs' });
      expect(noJobs).toBeInTheDocument();
    });
  });

  test('Expect jobs list', async () => {
    const job: V1Job = {
      apiVersion: 'v1',
      kind: 'Job',
      metadata: {
        name: 'my-job',
        namespace: 'test-namespace',
      },
      spec: {
        template: {
          spec: {
            containers: [],
          },
        },
      },
      status: {
        conditions: [],
        active: 1,
      },
    };

    initObjectsList([job]);

    render(JobList);
    await vi.waitFor(() => {
      const jobName = screen.getByRole('cell', { name: 'my-job test-namespace' });
      expect(jobName).toBeInTheDocument();
    });
  });

  test('Expect filter empty screen', async () => {
    initObjectsList([]);

    render(JobList, { searchTerm: 'No match' });

    await vi.waitFor(() => {
      const filterButton = screen.getByRole('button', { name: 'Clear filter' });
      expect(filterButton).toBeInTheDocument();
    });
  });

  test('Expect job list is updated when kubernetesCurrentContextJobsFiltered changes', async () => {
    const job1: V1Job = {
      apiVersion: 'v1',
      kind: 'Job',
      metadata: {
        name: 'my-job-1',
        namespace: 'test-namespace',
      },
      spec: {
        template: {
          spec: {
            containers: [],
          },
        },
      },
      status: {
        conditions: [],
        active: 1,
      },
    };
    const job2: V1Job = {
      apiVersion: 'v1',
      kind: 'Job',
      metadata: {
        name: 'my-job-2',
        namespace: 'test-namespace',
      },
      spec: {
        template: {
          spec: {
            containers: [],
          },
        },
      },
      status: {
        conditions: [],
        active: 1,
      },
    };

    const list = initObjectsList([job1, job2]);

    const component = render(JobList);
    await vi.waitFor(() => {
      const jobName1 = screen.getByRole('cell', { name: 'my-job-1 test-namespace' });
      expect(jobName1).toBeInTheDocument();
      const jobName2 = screen.getByRole('cell', { name: 'my-job-2 test-namespace' });
      expect(jobName2).toBeInTheDocument();
    });

    list.update([job2]);
    await component.rerender({});

    await vi.waitFor(() => {
      const jobName1after = screen.queryByRole('cell', { name: 'my-job-1 test-namespace' });
      expect(jobName1after).not.toBeInTheDocument();
      const jobName2after = screen.getByRole('cell', { name: 'my-job-2 test-namespace' });
      expect(jobName2after).toBeInTheDocument();
    });
  });
});
