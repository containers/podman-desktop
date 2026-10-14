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

import type { ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import type { ProviderStatus } from '@desktop-framework/extension-api';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import CreateNetwork from '/@/lib/network/CreateNetwork.svelte';
import type { NetworkInfoUI } from '/@/lib/network/NetworkInfoUI';
import { mockBreadcrumb } from '/@/stores/breadcrumb.spec';
import { networksListInfo } from '/@/stores/networks';
import { providerInfos } from '/@/stores/providers';

beforeEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();

  // Reset stores
  networksListInfo.set([]);

  // Mock breadcrumb for Route components
  mockBreadcrumb();

  vi.mocked(window.getNetworkDrivers).mockResolvedValue(['bridge', 'ipvlan', 'macvlan']);

  // Navigate to basic tab
  router.goto('/basic');
});

// Helper to create a provider connection
function createProviderConnection(
  overrides?: Partial<ProviderContainerConnectionInfo>,
): ProviderContainerConnectionInfo {
  return {
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
    ...overrides,
  };
}

// Helper to render the CreateNetwork component with optional provider setup
function renderCreate(connections?: ProviderContainerConnectionInfo[]): ReturnType<typeof render> {
  const defaultConnection = createProviderConnection();
  const pStatus: ProviderStatus = 'started';
  const providerInfo = {
    id: 'test',
    internalId: 'id',
    name: '',
    containerConnections: connections ?? [defaultConnection],
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
  return render(CreateNetwork, {});
}

test('Expect Create button is disabled when name is empty', async () => {
  renderCreate();

  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeDisabled();
});

test('Expect Basic and Advanced tabs to be present', async () => {
  renderCreate();

  expect(screen.getByRole('button', { name: 'Basic' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Advanced' })).toBeInTheDocument();
});

test('Expect all basic form fields to be present', async () => {
  renderCreate();

  expect(screen.getByRole('textbox', { name: 'Name *' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
});

test('Expect createNetwork to be called with correct parameters', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'my-test-network');

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'my-test-network',
      Driver: 'bridge',
      EnableIPv6: false,
      Internal: false,
    }),
  );
});

test('Expect error message to be displayed when network creation fails', async () => {
  const errorMessage = 'Failed to create network: network already exists';
  vi.mocked(window.createNetwork).mockRejectedValue(new Error(errorMessage));
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'existing-network');

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  const error = await screen.findByRole('alert');
  expect(error).toHaveTextContent(errorMessage);
});

test('Expect container engine dropdown to appear when multiple providers', async () => {
  const podman = createProviderConnection({
    name: 'podman',
    displayName: 'Podman',
    endpoint: { socketPath: '/run/podman/podman.sock' },
    type: 'podman',
  });
  const docker = createProviderConnection({
    name: 'docker',
    displayName: 'Docker',
    endpoint: { socketPath: '/var/run/docker.sock' },
    type: 'docker',
  });

  renderCreate([podman, docker]);

  const engineDropdown = screen.getByLabelText(/Container engine/);
  expect(engineDropdown).toBeInTheDocument();
});

test('Expect driver to reset to bridge when switching providers', async () => {
  // Docker has more drivers including 'host' which Podman doesn't support
  vi.mocked(window.getNetworkDrivers).mockResolvedValue(['bridge', 'host', 'ipvlan', 'macvlan']);

  const podman = createProviderConnection({
    name: 'podman',
    displayName: 'Podman',
    endpoint: { socketPath: '/run/podman/podman.sock' },
    type: 'podman',
  });
  const docker = createProviderConnection({
    name: 'docker',
    displayName: 'Docker',
    endpoint: { socketPath: '/var/run/docker.sock' },
    type: 'docker',
  });

  renderCreate([docker, podman]);

  // Switch to Advanced tab to access driver dropdown
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Select 'host' driver (only available on Docker)
  const driverDropdown = screen.getByRole('button', { name: 'bridge' });
  await fireEvent.click(driverDropdown);
  const hostOption = screen.getByRole('button', { name: 'host' });
  await fireEvent.click(hostOption);

  // Verify host is selected
  expect(screen.getByRole('button', { name: 'host' })).toBeInTheDocument();

  // Go back to Basic tab to switch provider
  const basicTab = screen.getByRole('button', { name: 'Basic' });
  await fireEvent.click(basicTab);

  // Switch to Podman provider
  const engineDropdown = screen.getByLabelText(/Container engine/);
  await fireEvent.click(engineDropdown);
  const podmanOption = screen.getByRole('button', { name: 'podman' });
  await fireEvent.click(podmanOption);

  // Go back to Advanced tab and verify driver was reset to bridge
  await fireEvent.click(advancedTab);
  expect(screen.getByRole('button', { name: 'bridge' })).toBeInTheDocument();
});

test('Expect empty screen when no providers available', async () => {
  providerInfos.set([]);

  render(CreateNetwork, {});

  const networkName = screen.queryByRole('textbox', { name: 'Name *' });
  expect(networkName).not.toBeInTheDocument();
});

test('Expect createNetwork to be called with subnet when provided', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'my-test-network');

  // Switch to Advanced tab to access subnet field
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  const subnet = screen.getByRole('textbox', { name: 'Subnet' });
  await userEvent.type(subnet, '10.89.0.0/24');

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'my-test-network',
      IPAM: expect.objectContaining({
        Driver: 'default',
        Config: expect.arrayContaining([
          expect.objectContaining({
            Subnet: '10.89.0.0/24',
          }),
        ]),
      }),
    }),
  );
});

test('Expect cancel button to navigate to networks page', async () => {
  const gotoSpy = vi.spyOn(router, 'goto');
  renderCreate();

  const cancelButton = screen.getByRole('button', { name: 'Cancel' });
  await userEvent.click(cancelButton);

  expect(gotoSpy).toHaveBeenCalledWith('/networks');
});

test('Expect automatic routing to network details after successful network creation', async () => {
  const gotoSpy = vi.spyOn(router, 'goto');
  const networkId = 'network123';
  const engineId = 'engine1';
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: networkId, engineId });

  renderCreate();

  const networkNameInput = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkNameInput, 'my-test-network');

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  // Simulate network appearing in store after creation with both matching ID and Name
  setTimeout(() => {
    const network: NetworkInfoUI = {
      id: networkId,
      shortId: networkId.slice(0, 12),
      name: 'my-test-network',
      driver: 'bridge',
      created: '',
      engineId,
      engineName: 'Podman',
      engineType: 'podman',
      selected: false,
      status: 'UNUSED',
      containers: [],
      ipv6_enabled: false,
      labels: {},
      options: {},
      subnets: [],
    };
    networksListInfo.set([network]);
  }, 100);

  await waitFor(
    () => {
      // Should route to the network details page
      expect(gotoSpy).toHaveBeenCalledWith(`/networks/my-test-network/${engineId}/summary`);
    },
    { timeout: 3000 },
  );
});

test('Expect to switch to Advanced tab and see advanced options', async () => {
  renderCreate();

  // Click the Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Expect advanced options to be visible
  expect(screen.getByText('Network Driver')).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Subnet' })).toBeInTheDocument();
  expect(screen.getByText('IPv6 (Dual Stack)')).toBeInTheDocument();
  expect(screen.getByText('Internal Network')).toBeInTheDocument();
  expect(screen.getByText('IP Range')).toBeInTheDocument();
  expect(screen.getByText('Gateway')).toBeInTheDocument();
  expect(screen.getByText('DNS Servers')).toBeInTheDocument();
});

test('Expect DNS section to be hidden for Docker provider', async () => {
  const docker = createProviderConnection({
    name: 'docker',
    displayName: 'Docker',
    endpoint: { socketPath: '/var/run/docker.sock' },
    type: 'docker',
  });

  renderCreate([docker]);

  // Click the Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // DNS section should not be visible for Docker
  expect(screen.queryByText('DNS Servers')).not.toBeInTheDocument();
});

test('Expect Advanced tab to show network driver dropdown with ipvlan/macvlan options', async () => {
  renderCreate();

  // Switch to Advanced tab to access driver dropdown
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Driver dropdown should be visible on Advanced tab
  expect(screen.getByText('Network Driver')).toBeInTheDocument();

  // Check that IPvlan and Macvlan options exist in the dropdown
  const ipvlanOption = document.querySelector('option[value="ipvlan"]');
  expect(ipvlanOption).toBeTruthy();

  const macvlanOption = document.querySelector('option[value="macvlan"]');
  expect(macvlanOption).toBeTruthy();
});

test('Expect createNetwork to be called with IPv6 enabled', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'ipv6-network');

  // Switch to Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Enable IPv6
  const ipv6Checkbox = screen.getByTitle('Enable IPv6');
  await userEvent.click(ipv6Checkbox);

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'ipv6-network',
      EnableIPv6: true,
    }),
  );
});

test('Expect createNetwork to be called with Internal network enabled', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'internal-network');

  // Switch to Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Enable Internal network
  const internalCheckbox = screen.getByTitle('Internal network');
  await userEvent.click(internalCheckbox);

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'internal-network',
      Internal: true,
    }),
  );
});

test('Expect createNetwork to be called with gateway when provided', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'gateway-network');

  // Switch to Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Enter subnet and gateway
  const subnet = screen.getByRole('textbox', { name: 'Subnet' });
  await userEvent.type(subnet, '10.89.0.0/24');

  const gateway = screen.getByRole('textbox', { name: 'Gateway' });
  await userEvent.type(gateway, '10.89.0.1');

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'gateway-network',
      IPAM: expect.objectContaining({
        Driver: 'default',
        Config: expect.arrayContaining([
          expect.objectContaining({
            Subnet: '10.89.0.0/24',
            Gateway: '10.89.0.1',
          }),
        ]),
      }),
    }),
  );
});

test('Expect createNetwork to be called with IP range when provided', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'iprange-network');

  // Switch to Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Enter subnet and IP range
  const subnet = screen.getByRole('textbox', { name: 'Subnet' });
  await userEvent.type(subnet, '10.89.0.0/24');

  const ipRange = screen.getByRole('textbox', { name: 'IP Range' });
  await userEvent.type(ipRange, '10.89.0.0/25');

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'iprange-network',
      IPAM: expect.objectContaining({
        Driver: 'default',
        Config: expect.arrayContaining([
          expect.objectContaining({
            Subnet: '10.89.0.0/24',
            IPRange: '10.89.0.0/25',
          }),
        ]),
      }),
    }),
  );
});

test('Expect updateNetwork to be called with DNS servers after network creation for Podman', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  vi.mocked(window.updateNetwork).mockResolvedValue();
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'dns-network');

  // Switch to Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Enter DNS server (DNS is enabled by default for Podman bridge networks)
  const dnsInputs = screen.getAllByPlaceholderText('8.8.8.8');
  await userEvent.type(dnsInputs[0], '8.8.8.8');

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  // Network should be created without DNS options (compat API doesn't support it)
  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'dns-network',
    }),
  );

  // DNS servers should be added via updateNetwork (libpod API)
  expect(window.updateNetwork).toHaveBeenCalledWith('engine1', 'network123', ['8.8.8.8'], []);
});

test('Expect createNetwork to be called with ipvlan driver and explicit subnet', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'ipvlan-network');

  // Switch to Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Select ipvlan driver - click dropdown button to open, then click option
  const driverDropdown = screen.getByRole('button', { name: 'bridge' });
  await fireEvent.click(driverDropdown);
  const ipvlanOption = screen.getByRole('button', { name: 'ipvlan' });
  await fireEvent.click(ipvlanOption);

  // Enter explicit subnet for ipvlan
  const subnet = screen.getByRole('textbox', { name: /Subnet/ });
  await userEvent.type(subnet, '192.168.1.0/24');

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'ipvlan-network',
      Driver: 'ipvlan',
      IPAM: expect.objectContaining({
        Config: expect.arrayContaining([
          expect.objectContaining({
            Subnet: '192.168.1.0/24',
          }),
        ]),
      }),
    }),
  );
});

test('Expect createNetwork to be called with all advanced options combined', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  vi.mocked(window.updateNetwork).mockResolvedValue();
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'full-network');

  // Switch to Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Enter subnet, gateway, IP range
  const subnet = screen.getByRole('textbox', { name: 'Subnet' });
  await userEvent.type(subnet, '10.50.0.0/24');

  const gateway = screen.getByRole('textbox', { name: 'Gateway' });
  await userEvent.type(gateway, '10.50.0.1');

  const ipRange = screen.getByRole('textbox', { name: 'IP Range' });
  await userEvent.type(ipRange, '10.50.0.128/25');

  // Enable IPv6 and Internal
  const ipv6Checkbox = screen.getByTitle('Enable IPv6');
  await userEvent.click(ipv6Checkbox);

  const internalCheckbox = screen.getByTitle('Internal network');
  await userEvent.click(internalCheckbox);

  // Enter DNS server
  const dnsInputs = screen.getAllByPlaceholderText('8.8.8.8');
  await userEvent.type(dnsInputs[0], '1.1.1.1');

  const createButton = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(createButton);

  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'full-network',
      Driver: 'bridge',
      EnableIPv6: true,
      Internal: true,
      IPAM: expect.objectContaining({
        Driver: 'default',
        Config: expect.arrayContaining([
          expect.objectContaining({
            Subnet: '10.50.0.0/24',
            Gateway: '10.50.0.1',
            IPRange: '10.50.0.128/25',
          }),
        ]),
      }),
    }),
  );

  // DNS servers should be added via updateNetwork (libpod API)
  expect(window.updateNetwork).toHaveBeenCalledWith('engine1', 'network123', ['1.1.1.1'], []);
});

test('Expect Create button to be disabled when ipvlan selected without subnet', async () => {
  vi.mocked(window.createNetwork).mockResolvedValue({ Id: 'network123', engineId: 'engine1' });
  renderCreate();

  const networkName = screen.getByRole('textbox', { name: 'Name *' });
  await userEvent.type(networkName, 'ipvlan-network');

  // Switch to Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // Select ipvlan driver - click dropdown button to open, then click option
  const driverDropdown = screen.getByRole('button', { name: 'bridge' });
  await fireEvent.click(driverDropdown);
  const ipvlanOption = screen.getByRole('button', { name: 'ipvlan' });
  await fireEvent.click(ipvlanOption);

  // Create button should be disabled without subnet for ipvlan
  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeDisabled();

  // Enter subnet - button should become enabled
  const subnet = screen.getByRole('textbox', { name: 'Subnet *' });
  await userEvent.type(subnet, '10.89.0.0/24');
  expect(createButton).toBeEnabled();

  await userEvent.click(createButton);

  expect(window.createNetwork).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      Name: 'ipvlan-network',
      Driver: 'ipvlan',
      IPAM: expect.objectContaining({
        Config: expect.arrayContaining([
          expect.objectContaining({
            Subnet: '10.89.0.0/24',
          }),
        ]),
      }),
    }),
  );
});

test('Expect DNS checkbox to disable DNS servers input when unchecked', async () => {
  renderCreate();

  // Switch to Advanced tab
  const advancedTab = screen.getByRole('button', { name: 'Advanced' });
  await fireEvent.click(advancedTab);

  // DNS should be enabled by default for Podman bridge
  expect(screen.getByTitle('Enable DNS')).toBeInTheDocument();

  // Disable DNS
  const dnsCheckbox = screen.getByTitle('Enable DNS');
  await userEvent.click(dnsCheckbox);

  // DNS server inputs should no longer be visible
  expect(screen.queryByPlaceholderText('8.8.8.8')).not.toBeInTheDocument();
});
