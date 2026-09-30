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

import type { ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import type { PlayKubeInfo } from '@desktop-framework/api/libpod';
import type { ProviderStatus } from '@desktop-framework/extension-api';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import { providerInfos } from '/@/stores/providers';

import KubePlayYAML from './KubePlayYAML.svelte';

const mockedErroredPlayKubeInfo: PlayKubeInfo = {
  Pods: [
    {
      ContainerErrors: ['error 1', 'error 2'],
      Containers: ['container 1', 'container 2'],
      Id: 'pod-id',
      InitContainers: ['init-container 1', 'init-container 2'],
      Logs: ['log 1', 'log 2'],
    },
  ],
  RmReport: [
    {
      Err: 'rm error',
      Id: 'rm-id',
    },
  ],
  Secrets: [
    {
      CreateReport: {
        ID: 'secret-id',
      },
    },
  ],
  StopReport: [
    {
      Err: 'stop error',
      Id: 'stop-id',
    },
  ],
  Volumes: [
    {
      Name: 'volume 1',
    },
    {
      Name: 'volume 2',
    },
  ],
};

// mock the router
vi.mock(import('tinro'));

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });

  vi.mocked(window.openDialog).mockResolvedValue(['Containerfile']);
  vi.mocked(window.telemetryPage).mockResolvedValue(undefined);
  vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);
});

function setup(): void {
  const pStatus: ProviderStatus = 'started';
  const pInfo: ProviderContainerConnectionInfo = {
    connectionType: 'container',
    name: 'test',
    displayName: 'test',
    status: 'started',
    endpoint: {
      socketPath: '',
    },
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    type: 'podman',
  };
  const providerInfo = {
    id: 'test',
    internalId: 'id',
    name: '',
    containerConnections: [pInfo],
    kubernetesConnections: undefined,
    status: pStatus,
    containerProviderConnectionCreation: false,
    containerProviderConnectionInitialization: false,
    kubernetesProviderConnectionCreation: false,
    kubernetesProviderConnectionInitialization: false,
    links: undefined,
    detectionChecks: undefined,
    warnings: undefined,
    images: undefined,
    installationSupport: undefined,
  } as unknown as ProviderInfo;
  providerInfos.set([providerInfo]);
}

test('error: When pressing the Play button, expect us to show the errors to the user', async () => {
  vi.mocked(window.playKube).mockResolvedValue(mockedErroredPlayKubeInfo);

  // Render the component
  setup();
  render(KubePlayYAML, {});

  // Simulate selecting a file
  const fileInput = screen.getByRole('textbox', { name: 'Kubernetes YAML file' });
  expect(fileInput).toBeInTheDocument();

  const browseButton = screen.getByLabelText('browse');
  expect(browseButton).toBeInTheDocument();
  await userEvent.click(browseButton);

  // Simulate clicking the "Play" button
  const playButton = screen.getByRole('button', { name: 'Play' });
  expect(playButton).toBeInTheDocument();
  await userEvent.click(playButton);

  // Since we error out with the mocked kubePlay function (see very top of tests)
  // Expect the following error to be in the document.
  const error = screen.getByText('The following pods were created but failed to start: error 1, error 2');
  expect(error).toBeInTheDocument();
});

test('allows typing and pasting a YAML path and plays the entered path', async () => {
  vi.mocked(window.playKube).mockResolvedValue({
    Pods: [],
    RmReport: [],
    Secrets: [],
    StopReport: [],
    Volumes: [],
  });

  setup();
  render(KubePlayYAML, {});

  const fileInput = screen.getByRole('textbox', { name: 'Kubernetes YAML file' });
  const playButton = screen.getByRole('button', { name: 'Play' });
  const yamlPath = '/tmp/podman-kube-play.yaml';

  expect(fileInput).not.toHaveAttribute('readonly');
  expect(playButton).toBeDisabled();

  await userEvent.type(fileInput, '/tmp/typed-path.yaml');
  expect(fileInput).toHaveValue('/tmp/typed-path.yaml');
  expect(playButton).toBeEnabled();

  await userEvent.clear(fileInput);
  expect(playButton).toBeDisabled();

  await userEvent.type(fileInput, '   ');
  expect(playButton).toBeEnabled();
  await userEvent.clear(fileInput);

  await userEvent.click(fileInput);
  await userEvent.paste(yamlPath);
  expect(fileInput).toHaveValue(yamlPath);
  expect(playButton).toBeEnabled();

  await userEvent.click(playButton);

  expect(window.openDialog).not.toHaveBeenCalled();
  expect(window.playKube).toHaveBeenCalledWith({ type: 'path', value: yamlPath }, expect.anything(), expect.anything());
});

describe('cancel', () => {
  test('expect cancel button not to be visible by default', async () => {
    // Render the component
    setup();
    const { queryByRole } = render(KubePlayYAML, {});

    const cancelBtn = queryByRole('button', { name: 'Cancel' });
    expect(cancelBtn).toBeNull();
  });

  test('expect cancel button to be visible while playKube is running', async () => {
    const { promise, resolve } = Promise.withResolvers<PlayKubeInfo>();
    vi.mocked(window.playKube).mockReturnValue(promise);

    // Render the component
    setup();
    const { getByRole, getByLabelText, queryByRole } = render(KubePlayYAML, {});

    // Simulate selecting a file
    const fileInput = getByRole('textbox', { name: 'Kubernetes YAML file' });
    expect(fileInput).toBeInTheDocument();

    const browseButton = getByLabelText('browse');
    expect(browseButton).toBeInTheDocument();
    await userEvent.click(browseButton);

    // Simulate clicking the "Play" button
    const playButton = getByRole('button', { name: 'Play' });
    expect(playButton).toBeInTheDocument();
    await userEvent.click(playButton);

    const cancelBtn = await vi.waitFor(() => {
      return getByRole('button', { name: 'Cancel' });
    });
    expect(cancelBtn).toBeInTheDocument();

    // resolve window.playKube
    resolve(mockedErroredPlayKubeInfo);

    await vi.waitFor(() => {
      const cancelBtn = queryByRole('button', { name: 'Cancel' });
      expect(cancelBtn).toBeNull();
    });
  });

  test('cancel action should call window#cancelToken', async () => {
    const CANCELLABLE_TOKEN_ID: number = 55;
    vi.mocked(window.getCancellableTokenSource).mockResolvedValue(CANCELLABLE_TOKEN_ID);

    const { promise } = Promise.withResolvers<PlayKubeInfo>();
    vi.mocked(window.playKube).mockReturnValue(promise);

    // Render the component
    setup();
    const { getByRole, getByLabelText } = render(KubePlayYAML, {});

    // Simulate selecting a file
    const fileInput = getByRole('textbox', { name: 'Kubernetes YAML file' });
    expect(fileInput).toBeInTheDocument();

    const browseButton = getByLabelText('browse');
    expect(browseButton).toBeInTheDocument();
    await userEvent.click(browseButton);

    // Simulate clicking the "Play" button
    const playButton = getByRole('button', { name: 'Play' });
    expect(playButton).toBeInTheDocument();
    await userEvent.click(playButton);

    const cancelBtn = await vi.waitFor(() => {
      return getByRole('button', { name: 'Cancel' });
    });
    await userEvent.click(cancelBtn);

    await vi.waitFor(() => {
      expect(window.cancelToken).toHaveBeenCalledExactlyOnceWith(CANCELLABLE_TOKEN_ID);
    });
  });
});

test('expect done button is there at the end and redirects to pods', async () => {
  vi.mocked(window.playKube).mockResolvedValue({
    Pods: [],
    RmReport: [],
    Secrets: [],
    StopReport: [],
    Volumes: [],
  });

  // Render the component
  setup();
  render(KubePlayYAML, {});

  // Simulate selecting a file
  const fileInput = screen.getByRole('textbox', { name: 'Kubernetes YAML file' });
  expect(fileInput).toBeInTheDocument();

  const browseButton = screen.getByLabelText('browse');
  expect(browseButton).toBeInTheDocument();
  await userEvent.click(browseButton);

  // Simulate clicking the "Play" button
  const playButton = screen.getByRole('button', { name: 'Play' });
  expect(playButton).toBeInTheDocument();
  await userEvent.click(playButton);

  // search the done button
  const doneButton = screen.getByRole('button', { name: 'Done' });
  expect(doneButton).toBeInTheDocument();
  // check that text value is also 'Done'
  expect(doneButton).toHaveTextContent('Done');

  // check that clicking redirects to the pods page
  expect(router.goto).not.toHaveBeenCalled();
  await userEvent.click(doneButton);

  expect(router.goto).toHaveBeenCalledWith(`/pods`);
});

test('expect workflow selection boxes have the correct selection borders', async () => {
  vi.mocked(window.playKube).mockResolvedValue({
    Pods: [],
    RmReport: [],
    Secrets: [],
    StopReport: [],
    Volumes: [],
  });

  setup();
  render(KubePlayYAML, {});

  const customOption = screen.getByText('Create a file from scratch');
  expect(customOption).toBeInTheDocument();
  expect(customOption.parentElement?.parentElement).not.toHaveClass('border-[var(--pd-content-card-border-selected)]');
  expect(customOption.parentElement?.parentElement).toHaveClass('border-[var(--pd-content-card-border)]');

  // now switch selection to Create a file from scratch
  await userEvent.click(customOption);

  expect(customOption.parentElement?.parentElement).toHaveClass('border-[var(--pd-content-card-border-selected)]');
  expect(customOption.parentElement?.parentElement).not.toHaveClass('border-[var(--pd-content-card-border)]');
});

test('selecting custom YAML disables the file input until Podman mode is selected again', async () => {
  setup();
  render(KubePlayYAML, {});

  const podmanOption = screen.getByRole('button', { name: 'Podman Container Engine Runtime' });
  const customOption = screen.getByRole('button', { name: 'Create a file from scratch' });
  const fileInput = screen.getByRole('textbox', { name: 'Kubernetes YAML file' });
  const browseButton = screen.getByRole('button', { name: 'browse' });

  expect(podmanOption).toHaveAttribute('aria-pressed', 'true');
  expect(fileInput).toBeEnabled();
  expect(browseButton).toBeEnabled();

  await userEvent.click(customOption);
  expect(podmanOption).toHaveAttribute('aria-pressed', 'false');
  expect(fileInput).toBeDisabled();
  expect(browseButton).toBeDisabled();

  await userEvent.click(podmanOption);
  expect(podmanOption).toHaveAttribute('aria-pressed', 'true');
  expect(fileInput).toBeEnabled();
  expect(browseButton).toBeEnabled();

  await userEvent.click(browseButton);
  expect(window.openDialog).toHaveBeenCalledOnce();
});

describe('Options', () => {
  test('build checkbox should be disabled by default', async () => {
    setup();
    const { getByRole } = render(KubePlayYAML, {});

    const checkbox = await vi.waitFor(() => {
      const element = getByRole('checkbox', { name: 'Enable build' });
      expect(element).toBeInstanceOf(HTMLInputElement);
      return element;
    });

    expect(checkbox).not.toBeChecked();
  });

  test('replace checkbox should be disabled by default', async () => {
    setup();
    const { getByRole } = render(KubePlayYAML, {});

    const checkbox = await vi.waitFor(() => {
      const element = getByRole('checkbox', { name: 'Replace' });
      expect(element).toBeInstanceOf(HTMLInputElement);
      return element;
    });

    expect(checkbox).not.toBeChecked();
  });

  test('enabled build option propagates to playKube call', async () => {
    setup();
    const { getByRole, getByLabelText } = render(KubePlayYAML, {});

    // Enable build
    const checkbox = getByRole('checkbox', { name: 'Enable build' });
    await userEvent.click(checkbox);

    // Select file and play
    const browseButton = getByLabelText('browse');
    await userEvent.click(browseButton);

    const playButton = screen.getByRole('button', { name: 'Play' });
    await userEvent.click(playButton);

    expect(window.playKube).toHaveBeenCalledWith(
      { type: 'path', value: 'Containerfile' },
      expect.anything(),
      expect.objectContaining({ build: true }),
    );
  });

  test('enabled replace option propagates to playKube call', async () => {
    setup();
    const { getByRole, getByLabelText } = render(KubePlayYAML, {});

    // Enable replace
    const checkbox = getByRole('checkbox', { name: 'Replace' });
    await userEvent.click(checkbox);

    // Select file and play
    const browseButton = getByLabelText('browse');
    await userEvent.click(browseButton);

    const playButton = screen.getByRole('button', { name: 'Play' });
    await userEvent.click(playButton);

    expect(window.playKube).toHaveBeenCalledWith(
      { type: 'path', value: 'Containerfile' },
      expect.anything(),
      expect.objectContaining({ replace: true }),
    );
  });
});

describe('Custom YAML mode', () => {
  test('shows Monaco editor when selected', async () => {
    setup();
    render(KubePlayYAML, {});

    // Initially, Monaco editor should not be visible
    expect(screen.queryByLabelText('Custom Kubernetes YAML content')).not.toBeInTheDocument();

    // Click on "Create a file from scratch" option
    const customOption = screen.getByText('Create a file from scratch');
    await userEvent.click(customOption);

    // Now Monaco editor should be visible
    expect(screen.getByText('Custom Kubernetes YAML content')).toBeInTheDocument();
  });

  test('play button is disabled when no content provided', async () => {
    setup();
    render(KubePlayYAML, {});

    const customOption = screen.getByText('Create a file from scratch');
    await userEvent.click(customOption);

    const playButton = screen.getByRole('button', { name: 'Play custom YAML' });
    expect(playButton).toBeDisabled();
  });

  test('button text changes to "Play custom YAML"', async () => {
    setup();
    render(KubePlayYAML, {});

    // Initially should show "Play"
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();

    // Switch to custom mode
    const customOption = screen.getByText('Create a file from scratch');
    await userEvent.click(customOption);

    // Button text should change
    expect(screen.getByRole('button', { name: 'Play custom YAML' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument();
  });

  test('editor content clears when switching back to file mode', async () => {
    setup();
    render(KubePlayYAML, {});

    // Switch to custom mode
    const customOption = screen.getByText('Create a file from scratch');
    await userEvent.click(customOption);

    // Monaco editor should be visible
    expect(screen.getByText('Custom Kubernetes YAML content')).toBeInTheDocument();

    // Monaco editor should be hidden again
    expect(screen.queryByLabelText('Custom Kubernetes YAML content')).not.toBeInTheDocument();
  });
});

test('file mode: playKube is called with a path input', async () => {
  vi.mocked(window.playKube).mockResolvedValue({
    Pods: [],
    RmReport: [],
    Secrets: [],
    StopReport: [],
    Volumes: [],
  });

  setup();
  render(KubePlayYAML, {});

  // Stay in file mode and select a file
  const browseButton = screen.getByLabelText('browse');
  await userEvent.click(browseButton);

  // Click play button
  const playButton = screen.getByRole('button', { name: 'Play' });
  await userEvent.click(playButton);

  // Verify playKube was called with a path input for the selected file, not raw content
  expect(window.playKube).toHaveBeenCalledWith(
    { type: 'path', value: 'Containerfile' },
    expect.anything(),
    expect.anything(),
  );
});

test('custom YAML mode: button text changes to "Play custom YAML"', async () => {
  setup();
  render(KubePlayYAML, {});

  // Initially should show "Play"
  expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();

  // Switch to custom mode
  const customOption = screen.getByText('Create a file from scratch');
  await userEvent.click(customOption);

  // Button text should change
  expect(screen.getByRole('button', { name: 'Play custom YAML' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Play' })).not.toBeInTheDocument();
});

test('switching between modes clears custom content', async () => {
  setup();
  render(KubePlayYAML, {});

  // Switch to custom mode
  const customOption = screen.getByText('Create a file from scratch');
  await userEvent.click(customOption);

  // Monaco editor should be visible
  expect(screen.getByText('Custom Kubernetes YAML content')).toBeInTheDocument();

  // Monaco editor should be hidden again
  expect(screen.queryByLabelText('Custom Kubernetes YAML content')).not.toBeInTheDocument();
});

test('validation: play button disabled when no file selected in file mode', async () => {
  setup();
  render(KubePlayYAML, {});

  // In file mode with no file selected, button should be disabled
  const playButton = screen.getByRole('button', { name: 'Play' });
  expect(playButton).toBeDisabled();
});

test('validation: play button enabled when file is selected in file mode', async () => {
  setup();
  render(KubePlayYAML, {});

  // Simulate selecting a file
  const browseButton = screen.getByLabelText('browse');
  await userEvent.click(browseButton);

  // Play button should now be enabled
  const playButton = screen.getByRole('button', { name: 'Play' });
  expect(playButton).not.toBeDisabled();
});

test('Expect Close button to navigate to last page when clicked', async () => {
  setup();
  lastPage.set({ name: 'Pods', path: '/pods' });
  const goToMock = vi.spyOn(router, 'goto');
  render(KubePlayYAML, {});

  const closeButton = screen.getByRole('button', { name: 'Close' });
  expect(closeButton).toBeInTheDocument();
  await userEvent.click(closeButton);

  expect(goToMock).toHaveBeenCalledWith('/pods');
});
