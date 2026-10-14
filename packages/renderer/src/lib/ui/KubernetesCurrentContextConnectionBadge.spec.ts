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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import type { ContextGeneralState, ContextHealth, KubeContext } from '@desktop-framework/api';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { readable, type Writable, writable } from 'svelte/store';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { isKubernetesExperimentalMode } from '/@/lib/kube/resources-listen';
import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import * as health from '/@/stores/kubernetes-context-health';
import * as kubeContextStore from '/@/stores/kubernetes-contexts';
import * as states from '/@/stores/kubernetes-contexts-state';

vi.mock(import('/@/stores/kubernetes-contexts-state'));
vi.mock(import('/@/stores/kubernetes-contexts'));
vi.mock(import('/@/lib/kube/resources-listen'));
vi.mock(import('/@/stores/kubernetes-context-health'));

let delayed: Writable<Map<string, boolean>>;
let contexts: Writable<KubeContext[]>;

beforeEach(() => {
  vi.resetAllMocks();
  delayed = writable<Map<string, boolean>>();
  vi.mocked(states).kubernetesContextsCheckingStateDelayed = delayed;
  contexts = writable<KubeContext[]>([
    {
      name: 'context1',
      currentContext: true,
    } as KubeContext,
  ]);
  vi.mocked(kubeContextStore).kubernetesContexts = contexts;
});

describe.each<{
  experimental: boolean;
  setState: (options: { reachable: boolean; offline?: boolean; error?: string }) => void;
}>([
  {
    experimental: false,
    setState: (options: { reachable: boolean; _offline?: boolean; error?: string }): void => {
      vi.mocked(states).kubernetesCurrentContextState = readable({
        error: options.error,
        reachable: options.reachable,
        resources: {
          pods: 0,
          deployments: 0,
        },
      } as ContextGeneralState); // no current ContextState
    },
  },
  {
    experimental: true,
    setState: (options: { reachable: boolean; offline?: boolean; _error?: string }): void => {
      vi.mocked(health).kubernetesContextsHealths = writable([
        {
          contextName: 'context1',
          reachable: options.reachable,
          offline: options.offline,
        } as unknown as ContextHealth,
      ]);
    },
  },
])('is experimental: $experimental', ({ experimental, setState }) => {
  beforeEach(() => {
    vi.mocked(isKubernetesExperimentalMode).mockResolvedValue(experimental);
  });

  test('expect no badges shown as no context has been provided.', async () => {
    contexts.set([
      {
        name: 'non-current',
      } as KubeContext,
    ]);
    render(KubernetesCurrentContextConnectionBadge);

    await tick();

    const status = screen.queryByRole('status');
    expect(status).toBeNull();
  });

  test('expect badges to show as there is a reachable context', async () => {
    setState({ reachable: true });
    render(KubernetesCurrentContextConnectionBadge);

    await vi.waitFor(() => {
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('Connected');
    });
  });

  test('expect badges to show as there is a non reachable context', async () => {
    setState({ reachable: false });
    render(KubernetesCurrentContextConnectionBadge);

    await vi.waitFor(() => {
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('Cluster not reachable');
    });
  });

  test('expect badges to show as there is an offline context', {
    skip: !experimental,
  }, async () => {
    setState({ reachable: true, offline: true });
    render(KubernetesCurrentContextConnectionBadge);

    await vi.waitFor(() => {
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('Connection lost');
    });
  });

  test('expect badges to be green when reachable', async () => {
    setState({ reachable: true });
    render(KubernetesCurrentContextConnectionBadge);

    await vi.waitFor(() => {
      const status = screen.getByRole('status');
      expect(status.firstChild).toHaveClass('bg-[var(--pd-status-connected)]');
    });
  });

  test('expect badges to be gray when not reachable', async () => {
    setState({ reachable: false });
    render(KubernetesCurrentContextConnectionBadge);

    await vi.waitFor(() => {
      const status = screen.getByRole('status');
      expect(status.firstChild).toHaveClass('bg-[var(--pd-status-disconnected)]');
    });
  });

  test('expect badges to be orange when offline', {
    skip: !experimental,
  }, async () => {
    setState({ reachable: true, offline: true });
    render(KubernetesCurrentContextConnectionBadge);

    await vi.waitFor(() => {
      const status = screen.getByRole('status');
      expect(status.firstChild).toHaveClass('bg-[var(--pd-status-paused)]');
    });
  });

  test('expect no tooltip when no error', async () => {
    setState({ reachable: true });
    render(KubernetesCurrentContextConnectionBadge);

    await tick();

    const tooltipTrigger = screen.queryByTestId('tooltip-trigger');
    if (tooltipTrigger) {
      await fireEvent.mouseEnter(tooltipTrigger);
    }

    await vi.waitFor(() => {
      const tooltip = screen.queryByRole('tooltip');
      expect(tooltip).toBeNull();
    });
  });

  test('expect tooltip when error', async () => {
    setState({ reachable: false, error: 'error message' });
    render(KubernetesCurrentContextConnectionBadge);

    await vi.waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    await fireEvent.mouseEnter(tooltipTrigger);

    await vi.waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });
  });

  test('expect tooltip when offline', {
    skip: !experimental,
  }, async () => {
    setState({ reachable: true, offline: true });
    render(KubernetesCurrentContextConnectionBadge);

    await vi.waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    await fireEvent.mouseEnter(tooltipTrigger);

    await vi.waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('connection lost, resources may be out of sync');
    });
  });

  test('spinner should be displayed when and only when the context connectivity is being checked', async () => {
    contexts.set([
      {
        name: 'context1',
        cluster: 'cluster1',
        user: 'user1',
        currentContext: true,
      },
    ]);
    setState({ reachable: false, error: 'error message' });
    render(KubernetesCurrentContextConnectionBadge);

    let checking = screen.queryByLabelText('Loading');
    expect(checking).toBeNull();

    // context is being checked
    delayed.set(new Map<string, boolean>([['context1', true]]));

    // spinner should appear
    await waitFor(() => {
      checking = screen.queryByLabelText('Loading');
      expect(checking).not.toBeNull();
    });

    // context is not being checked anymore
    delayed.set(new Map<string, boolean>([['context1', false]]));

    // spinner should disappear
    await waitFor(() => {
      checking = screen.queryByLabelText('Loading');
      expect(checking).toBeNull();
    });
  });
});
