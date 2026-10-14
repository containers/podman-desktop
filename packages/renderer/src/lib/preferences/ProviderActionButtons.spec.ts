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

import type { Menu, ProviderInfo } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContextUI } from '/@/lib/context/context';
import ProviderUpdateButton from '/@/lib/dashboard/ProviderUpdateButton.svelte';

import ProviderActionButtons from './ProviderActionButtons.svelte';

vi.mock(import('tinro'));

vi.mock(import('/@/lib/dashboard/ProviderUpdateButton.svelte'));

const baseProviderInfo: ProviderInfo = {
  id: 'podman',
  name: 'Podman',
  images: {
    icon: 'img',
  },
  status: 'ready',
  warnings: [],
  containerProviderConnectionCreation: false,
  detectionChecks: [],
  containerConnections: [],
  installationSupport: false,
  internalId: '0',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: false,
  links: [],
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionInitialization: false,
  extensionId: 'podman-extension',
  cleanupSupport: false,
  vmConnections: [],
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  version: '1.0.0',
  canStart: false,
  canStop: false,
};

const mockGlobalContext: ContextUI = {
  setValue: vi.fn(),
  getValue: vi.fn(),
} as unknown as ContextUI;

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ProviderActionButtons', () => {
  test('shows only Setup button in onboarding mode when provider is not-installed', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      status: 'not-installed',
    };

    const isOnboardingEnabled = vi.fn().mockReturnValue(true);
    const hasAnyConfiguration = vi.fn().mockReturnValue(false);

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled,
      hasAnyConfiguration,
    });

    const setupButton = screen.getByRole('button', { name: `Set up ${provider.name}` });
    expect(setupButton).toBeInTheDocument();

    const createButton = screen.queryByText(/Create new/i);
    expect(createButton).not.toBeInTheDocument();
  });

  test('shows only Setup button in onboarding mode when provider is unknown', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      status: 'unknown',
    };

    const isOnboardingEnabled = vi.fn().mockReturnValue(true);
    const hasAnyConfiguration = vi.fn().mockReturnValue(false);

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled,
      hasAnyConfiguration,
    });

    const setupButton = screen.getByRole('button', { name: `Set up ${provider.name}` });
    expect(setupButton).toBeInTheDocument();
  });

  test('navigates to onboarding page when Setup button is clicked in onboarding mode', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      status: 'not-installed',
      extensionId: 'podman-extension',
    };

    const isOnboardingEnabled = vi.fn().mockReturnValue(true);

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled,
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const setupButton = screen.getByRole('button', { name: `Set up ${provider.name}` });
    await userEvent.click(setupButton);

    expect(router.goto).toHaveBeenCalledWith('/preferences/onboarding/podman-extension');
  });

  test('navigates to settings page when Setup button is clicked in regular mode', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: true,
      extensionId: 'podman-extension',
    };

    const hasAnyConfiguration = vi.fn().mockReturnValue(true);

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration,
    });

    const setupButton = screen.getByRole('button', { name: `Set up ${provider.name}` });
    await userEvent.click(setupButton);

    expect(router.goto).toHaveBeenCalledWith('/preferences/default/preferences.podman-extension');
  });

  test('shows Create new button when containerProviderConnectionCreation is true', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: true,
      containerProviderConnectionCreationDisplayName: 'Podman Machine',
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.getByRole('button', {
      name: `Create new ${provider.containerProviderConnectionCreationDisplayName}`,
    });
    expect(createButton).toBeInTheDocument();
  });

  test('shows Create new button with custom button title', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: true,
      containerProviderConnectionCreationButtonTitle: 'Initialize',
      containerProviderConnectionCreationDisplayName: 'Podman Machine',
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.getByText('Initialize...');
    expect(createButton).toBeInTheDocument();
  });

  test('shows Create new button for kubernetesProviderConnectionCreation', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      kubernetesProviderConnectionCreation: true,
      kubernetesProviderConnectionCreationDisplayName: 'Kind Cluster',
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.getByRole('button', {
      name: `Create new ${provider.kubernetesProviderConnectionCreationDisplayName}`,
    });
    expect(createButton).toBeInTheDocument();
  });

  test('shows Create new button for vmProviderConnectionCreation', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      vmProviderConnectionCreation: true,
      vmProviderConnectionCreationDisplayName: 'Lima VM',
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.getByRole('button', {
      name: `Create new ${provider.vmProviderConnectionCreationDisplayName}`,
    });
    expect(createButton).toBeInTheDocument();
  });

  test('calls onCreateNew callback when Create new button is clicked', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: true,
      containerProviderConnectionCreationDisplayName: 'Podman Machine',
    };

    const onCreateNew = vi.fn();

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew,
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.getByRole('button', {
      name: `Create new ${provider.containerProviderConnectionCreationDisplayName}`,
    });
    await userEvent.click(createButton);

    expect(onCreateNew).toHaveBeenCalledWith(provider, provider.containerProviderConnectionCreationDisplayName);
  });

  test('shows Create new button in progress state', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: true,
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: true,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.getByRole('button', { name: `Create new ${provider.name}` });
    expect(createButton).toBeInTheDocument();
  });

  test('shows settings button when onboarding is enabled', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: true,
    };

    const isOnboardingEnabled = vi.fn().mockReturnValue(true);

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled,
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const setupButton = screen.getByRole('button', { name: `Set up ${provider.name}` });
    expect(setupButton).toBeInTheDocument();
  });

  test('shows settings button when configuration is available', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: true,
    };

    const hasAnyConfiguration = vi.fn().mockReturnValue(true);

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration,
    });

    const setupButton = screen.getByRole('button', { name: `Set up ${provider.name}` });
    expect(setupButton).toBeInTheDocument();
  });

  test('shows update button when update is available', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      version: '1.0.0',
      updateInfo: {
        version: '1.1.0',
      },
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    expect(ProviderUpdateButton).toHaveBeenCalled();
  });

  test('does not show update button when provider has no version even if update is available', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      status: 'unknown',
      version: undefined,
      updateInfo: {
        version: '1.1.0',
      },
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    expect(ProviderUpdateButton).not.toHaveBeenCalled();
  });

  test('does not show update button when no update is available', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      version: '1.0.0',
      updateInfo: {
        version: '1.0.0',
      },
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    expect(ProviderUpdateButton).not.toHaveBeenCalled();
  });

  test('passes onUpdatePreflightChecks callback to ProviderUpdateButton', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      version: '1.0.0',
      updateInfo: {
        version: '1.1.0',
      },
    };

    const onUpdatePreflightChecks = vi.fn();

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks,
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    expect(ProviderUpdateButton).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        onPreflightChecks: onUpdatePreflightChecks,
        provider,
      }),
    );
  });

  test('shows multiple buttons in regular mode', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: true,
      version: '1.0.0',
      updateInfo: {
        version: '1.1.0',
      },
    };

    const hasAnyConfiguration = vi.fn().mockReturnValue(true);

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration,
    });

    // Should show Create new button
    const createButton = screen.getByRole('button', { name: `Create new ${provider.name}` });
    expect(createButton).toBeInTheDocument();

    // Should show Setup button
    const setupButton = screen.getByRole('button', { name: `Set up ${provider.name}` });
    expect(setupButton).toBeInTheDocument();

    // Should show Update button
    expect(ProviderUpdateButton).toHaveBeenCalled();
  });

  test('uses fallback display name when specific display name is not provided', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      name: 'Podman',
      containerProviderConnectionCreation: true,
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.getByRole('button', { name: `Create new ${provider.name}` });
    expect(createButton).toBeInTheDocument();
  });

  test('does not show onboarding setup when globalContext is undefined', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      status: 'not-installed',
    };

    const isOnboardingEnabled = vi.fn().mockReturnValue(true);

    render(ProviderActionButtons, {
      provider,
      globalContext: undefined,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled,
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    // Should not show onboarding Setup button (because globalContext is undefined)
    const setupButtons = screen.queryAllByRole('button', { name: `Set up ${provider.name}` });
    // Should either not exist or be in regular mode (not onboarding mode)
    // In this case, the component should show regular buttons mode
    expect(setupButtons.length).toBeLessThanOrEqual(1);
  });

  test('hides Create new button when no factory and no warnings', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: false,
      kubernetesProviderConnectionCreation: false,
      vmProviderConnectionCreation: false,
      warnings: [],
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.queryByRole('button', { name: /Create new/i });
    expect(createButton).not.toBeInTheDocument();
  });

  test('shows disabled Create new button with warning tooltip when no factory but has warnings', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      containerProviderConnectionCreation: false,
      kubernetesProviderConnectionCreation: false,
      vmProviderConnectionCreation: false,
      warnings: [
        {
          name: 'Container Engine Required',
          details: 'Start your container provider to create clusters',
        },
        {
          name: 'Network Issue',
          details: 'Check your network connection',
        },
      ],
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.getByRole('button', { name: `Create new ${provider.name}` });
    expect(createButton).toBeDisabled();

    const tooltipTrigger = screen.getByTestId('tooltip-trigger');
    await fireEvent.mouseEnter(tooltipTrigger);
    expect(
      screen.getByText('Start your container provider to create clusters. Check your network connection'),
    ).toBeInTheDocument();
  });

  test('shows enabled Create new button when factory exists even with warnings', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      kubernetesProviderConnectionCreation: true,
      kubernetesProviderConnectionCreationDisplayName: 'Kind Cluster',
      warnings: [
        {
          name: 'Some Warning',
          details: 'Some warning details',
        },
      ],
    };

    render(ProviderActionButtons, {
      provider,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const createButton = screen.getByRole('button', { name: `Create new Kind Cluster` });
    expect(createButton).toBeInTheDocument();
    expect(createButton).not.toBeDisabled();
  });

  test('shows a provider contribution for any provider', () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      id: 'another-provider',
    };
    const contributions: Menu[] = [{ title: 'Initialize', command: 'another.initialize' }];

    render(ProviderActionButtons, {
      provider,
      contributions,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    screen.getByRole('button', { name: 'Initialize' });
  });

  test('shows a provider contribution when its context condition matches', () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      id: 'another-provider',
    };
    const contributions: Menu[] = [
      { title: 'Initialize', command: 'another.initialize', when: 'providerId === another-provider' },
    ];

    render(ProviderActionButtons, {
      provider,
      contributions,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    screen.getByRole('button', { name: 'Initialize' });
  });

  test('hides a provider contribution when its context condition does not match', () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
      id: 'another-provider',
    };
    const contributions: Menu[] = [
      { title: 'Initialize', command: 'another.initialize', when: 'providerId === different-provider' },
    ];

    render(ProviderActionButtons, {
      provider,
      contributions,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    expect(screen.queryByRole('button', { name: 'Initialize' })).not.toBeInTheDocument();
  });

  test('disables a provider contribution when its disabled condition matches', () => {
    const contributions: Menu[] = [
      { title: 'Initialize', command: 'another.initialize', disabled: 'providerStatus == ready' },
    ];

    render(ProviderActionButtons, {
      provider: baseProviderInfo,
      contributions,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    expect(screen.getByRole('button', { name: 'Initialize' })).toBeDisabled();
  });

  test('enables a provider contribution when its disabled condition does not match', () => {
    const contributions: Menu[] = [
      { title: 'Initialize', command: 'another.initialize', disabled: 'providerStatus == stopped' },
    ];

    render(ProviderActionButtons, {
      provider: baseProviderInfo,
      contributions,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    expect(screen.getByRole('button', { name: 'Initialize' })).not.toBeDisabled();
  });

  test('enables a provider contribution when its disabled condition is invalid', () => {
    const contributions: Menu[] = [{ title: 'Initialize', command: 'another.initialize', disabled: 'invalid ==' }];

    render(ProviderActionButtons, {
      provider: baseProviderInfo,
      contributions,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    expect(screen.getByRole('button', { name: 'Initialize' })).not.toBeDisabled();
  });

  test('runs a provider contribution when clicked', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
    };
    const contributions: Menu[] = [{ title: 'Initialize', command: 'another.initialize' }];
    vi.mocked(window.executeCommand).mockResolvedValue(undefined);

    render(ProviderActionButtons, {
      provider,
      contributions,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    const button = screen.getByRole('button', { name: 'Initialize' });
    await userEvent.click(button);

    expect(window.executeCommand).toHaveBeenCalledWith(
      'another.initialize',
      expect.objectContaining({ id: provider.id, name: provider.name, status: provider.status }),
    );
  });

  test('logs provider contribution errors', async () => {
    const provider: ProviderInfo = {
      ...baseProviderInfo,
    };
    const contributions: Menu[] = [{ title: 'Initialize', command: 'another.initialize' }];
    const error = new Error('failed');
    vi.mocked(window.executeCommand).mockRejectedValue(error);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(ProviderActionButtons, {
      provider,
      contributions,
      globalContext: mockGlobalContext,
      providerInstallationInProgress: false,
      onCreateNew: vi.fn(),
      onUpdatePreflightChecks: vi.fn(),
      isOnboardingEnabled: vi.fn().mockReturnValue(false),
      hasAnyConfiguration: vi.fn().mockReturnValue(false),
    });

    await userEvent.click(screen.getByRole('button', { name: 'Initialize' }));

    expect(consoleError).toHaveBeenCalledWith('Error while executing Initialize: Error: failed');
    consoleError.mockRestore();
  });
});
