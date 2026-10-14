<script lang="ts">
import type {
  NetworkCreateFormInfo,
  NetworkCreateOptions,
  ProviderContainerConnectionInfo,
} from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, Checkbox, Dropdown, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onMount } from 'svelte';
import { router } from 'tinro';

import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
import NetworkIcon from '/@/lib/images/NetworkIcon.svelte';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import { handleNavigation } from '/@/navigation';
import Route from '/@/Route.svelte';
import { networksListInfo } from '/@/stores/networks';
import { providerInfos } from '/@/stores/providers';

let networkInfo: NetworkCreateFormInfo = $state({
  networkName: '',
  subnet: '',
  selectedProvider: undefined,
  labels: [],
  ipRange: '',
  gateway: '',
  ipv6Enabled: false,
  internalEnabled: false,
  driver: 'bridge',
  options: [],
  dnsEnabled: undefined,
  dnsServers: undefined,
});

let createError: string | undefined = $state(undefined);
let createNetworkInProgress: boolean = $state(false);
let selectedProvider: ProviderContainerConnectionInfo | undefined = $derived(networkInfo.selectedProvider);

// Fetch available network drivers for selected provider
let driverOptions = $derived(
  selectedProvider ? window.getNetworkDrivers($state.snapshot(selectedProvider)) : Promise.resolve([]),
);

// Detect if the selected provider is Podman (for DNS server feature that doesnt use dockerode api)
// feature works only for bridge driver
let isPodman = $derived(networkInfo.selectedProvider?.type === 'podman');
let dnsAvailable = $derived(isPodman && networkInfo.driver === 'bridge');

// Subnet is required for ipvlan and macvlan
let requiresSubnet = $derived(networkInfo.driver === 'ipvlan' || networkInfo.driver === 'macvlan');

async function createNetwork(): Promise<void> {
  createError = undefined;
  createNetworkInProgress = true;

  try {
    if (!networkInfo.selectedProvider) {
      throw new Error('There is no container engine available.');
    }

    if (requiresSubnet && !networkInfo.subnet) {
      throw new Error('Subnet is required for ipvlan/macvlan networks.');
    }

    // Build IPAM config if subnet is provided
    const ipamConfig: { Subnet?: string; IPRange?: string; Gateway?: string }[] = [];
    if (networkInfo.subnet) {
      const config: { Subnet?: string; IPRange?: string; Gateway?: string } = {
        Subnet: networkInfo.subnet,
      };
      if (networkInfo.ipRange) {
        config.IPRange = networkInfo.ipRange;
      }
      if (networkInfo.gateway) {
        config.Gateway = networkInfo.gateway;
      }
      ipamConfig.push(config);
    }

    // Build network options
    // For ipvlan/macvlan, we must provide IPAM config with subnet
    // For bridge, IPAM is optional
    const networkOptions: NetworkCreateOptions = {
      Name: networkInfo.networkName,
      Driver: networkInfo.driver,
      EnableIPv6: networkInfo.ipv6Enabled,
      Internal: networkInfo.internalEnabled,
      IPAM:
        ipamConfig.length > 0
          ? {
              Driver: 'default',
              Config: ipamConfig,
            }
          : undefined,
    };

    const result = await window.createNetwork($state.snapshot(networkInfo.selectedProvider), networkOptions);

    if (!result.Id || !result.engineId) {
      throw new Error('Network creation failed: Missing network ID or engine ID');
    }

    // Add DNS servers for Podman using libpod API (compat API doesn't support DNS)
    if (isPodman && dnsAvailable && networkInfo.dnsEnabled) {
      const dnsServers = networkInfo.dnsServers?.filter(dns => dns.trim() !== '') ?? [];
      if (dnsServers.length > 0) {
        await window.updateNetwork(result.engineId, result.Id, dnsServers, []);
      }
    }

    await waitForNetworkInStore(result.Id, result.engineId);

    // Route to the network details page
    handleNavigation({
      page: NavigationPage.NETWORK,
      parameters: {
        name: networkInfo.networkName,
        engineId: result.engineId,
      },
    });
  } catch (error: unknown) {
    createError = error instanceof Error ? error.message : String(error);
    console.error('Error creating network:', error);
  } finally {
    createNetworkInProgress = false;
  }
}

/**
 * Wait for the network to appear in the store before navigating.
 */
async function waitForNetworkInStore(networkId: string, engineId: string): Promise<void> {
  return new Promise<void>(resolve => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve();
    }, 10000);

    const unsubscribe = networksListInfo.subscribe(networks => {
      if (networks.some(network => network.id === networkId && network.engineId === engineId)) {
        clearTimeout(timeout);
        unsubscribe();
        resolve();
      }
    });
  });
}

function cancelRoute(): void {
  handleNavigation({ page: NavigationPage.NETWORKS });
}

let providerConnections = $derived(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

// Select default provider connection on mount only (not on tab switches)
onMount(() => {
  networkInfo.selectedProvider ??= providerConnections.length > 0 ? providerConnections[0] : undefined;
});

// Initialize DNS defaults when Podman is selected, reset for other providers
$effect(() => {
  if (networkInfo.selectedProvider?.type === 'podman') {
    if (networkInfo.dnsEnabled === undefined) {
      networkInfo.dnsEnabled = true;
      networkInfo.dnsServers = [''];
    }
  } else {
    networkInfo.dnsEnabled = undefined;
    networkInfo.dnsServers = undefined;
  }
});

// Redirect to basic tab if landing on base path without a specific tab
$effect(() => {
  const currentPath = $router.path;
  if (currentPath.endsWith('/create') || currentPath.endsWith('/create/')) {
    router.goto(`${currentPath.replace(/\/$/, '')}/basic`);
  }
});

let hasInvalidFields = $derived(
  !networkInfo.networkName || !networkInfo.selectedProvider || (requiresSubnet && !networkInfo.subnet),
);

// DNS server management functions
function addDnsServer(): void {
  networkInfo.dnsServers = [...(networkInfo.dnsServers ?? []), ''];
}

function removeDnsServer(index: number): void {
  networkInfo.dnsServers = (networkInfo.dnsServers ?? []).filter((_, i) => i !== index);
}
</script>

<Route path="/*">
  <EngineFormPage
    title="Create a network"
    showEmptyScreen={providerConnections.length === 0 && !createNetworkInProgress}>
    {#snippet icon()}
      <Icon icon={NetworkIcon} class="2x" />
    {/snippet}
    {#snippet content()}
      <div class="space-y-2">
        <div class="flex flex-row px-2 border-b border-[var(--pd-content-divider)]">
          <Button type="tab" onclick={(): void => router.goto(getTabUrl($router.path, 'basic'))} selected={isTabSelected($router.path, 'basic')}>Basic</Button>
          <Button type="tab" onclick={(): void => router.goto(getTabUrl($router.path, 'advanced'))} selected={isTabSelected($router.path, 'advanced')}>Advanced</Button>
        </div>
        <div>
          <Route path="/basic" breadcrumb="Basic" navigationHint="tab">
            <div class="h-96 overflow-y-auto pr-4 space-y-6">
              {#if providerConnections.length > 1}
                <div>
                  <label for="providerChoice" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
                    >Container engine <span class="text-(--pd-state-error)">*</span></label>
                  <ContainerConnectionDropdown
                    id="providerChoice"
                    name="providerChoice"
                    bind:value={networkInfo.selectedProvider}
                    connections={providerConnections}
                    onchange={(): void => { networkInfo.driver = 'bridge'; }} />
                </div>
              {/if}

              <div>
                <label for="networkName" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
                  >Name <span class="text-(--pd-state-error)">*</span></label>
                <Input
                  bind:value={networkInfo.networkName}
                  name="networkName"
                  id="networkName"
                  placeholder="Network name"
                  required
                  class="w-full" />
              </div>
            </div>
          </Route>
          <Route path="/advanced" breadcrumb="Advanced" navigationHint="tab">
            <div class="h-96 overflow-y-auto pr-4 space-y-6">
              <!-- Network Driver -->
              <div>
                <label for="driver" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
                  >Network Driver</label>
                <Dropdown class="w-full" name="driver" bind:value={networkInfo.driver}>
                  {#each await driverOptions as option (option)}
                    <option value={option}>{option}</option>
                  {/each}
                </Dropdown>
              </div>

              <!-- Subnet -->
              <div>
                <label for="subnet" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]">
                  Subnet
                  {#if requiresSubnet}
                    <span class="text-(--pd-state-error)">*</span>
                  {/if}
                </label>
                <Input
                  bind:value={networkInfo.subnet}
                  name="subnet"
                  id="subnet"
                  placeholder="e.g. 10.89.0.0/24"
                  required={requiresSubnet}
                  class="w-full" />
              </div>

              <!-- IPv6 (dual stack) -->
              <div>
                <label for="ipv6" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
                  >IPv6 (Dual Stack)</label>
                <Checkbox bind:checked={networkInfo.ipv6Enabled} title="Enable IPv6">
                  Enable IPv6 networking alongside IPv4
                </Checkbox>
              </div>

              <!-- Internal Network -->
              <div>
                <label for="internal" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
                  >Internal Network</label>
                <Checkbox bind:checked={networkInfo.internalEnabled} title="Internal network">
                  Disable external connections
                </Checkbox>
              </div>

              <!-- IP Range (IPAM) -->
              <div>
                <label for="ipRange" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
                  >IP Range</label>
                <Input
                  bind:value={networkInfo.ipRange}
                  name="ipRange"
                  id="ipRange"
                  placeholder="10.89.0.0/25 or fd00::/80"
                  class="w-full" />
              </div>

              <!-- Gateway -->
              <div>
                <label for="gateway" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
                  >Gateway</label>
                <Input
                  bind:value={networkInfo.gateway}
                  name="gateway"
                  id="gateway"
                  placeholder="10.89.0.1 or fd00::1"
                  class="w-full" />
              </div>

              <!-- DNS Servers (Podman only) -->
              {#if isPodman}
                <div class:opacity-50={!dnsAvailable}>
                  <label for="dns" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]">
                    DNS Servers
                  </label>
                  
                  {#if dnsAvailable}
                    <Checkbox bind:checked={networkInfo.dnsEnabled} title="Enable DNS" class="mb-2">
                      Enable DNS
                    </Checkbox>
                  {/if}
                  
                  {#if networkInfo.dnsEnabled && dnsAvailable && networkInfo.dnsServers}
                    {#each networkInfo.dnsServers as _, index (index)}
                      <div class="flex flex-row items-center w-full py-1">
                        <Input
                          bind:value={networkInfo.dnsServers[index]}
                          aria-label={`DNS server ${index + 1}`}
                          placeholder="8.8.8.8"
                          class="w-full" />
                        <Button
                          type="link"
                          hidden={index === networkInfo.dnsServers.length - 1}
                          onclick={(): void => removeDnsServer(index)}
                          title={`Remove DNS server ${index + 1}`}
                          icon={faMinusCircle} />
                        <Button
                          type="link"
                          hidden={index < networkInfo.dnsServers.length - 1}
                          onclick={addDnsServer}
                          title="Add DNS server"
                          icon={faPlusCircle} />
                      </div>
                    {/each}
                  {/if}
                  
                  {#if networkInfo.driver !== 'bridge'}
                    <p class="text-sm text-[var(--pd-content-card-text)] mt-1">
                      DNS is only available for bridge networks.
                    </p>
                  {/if}
                </div>
              {/if}
            </div>
          </Route>
        </div>

        <ButtonRow>
          <Button type="secondary" onclick={cancelRoute}>Cancel</Button>
          <Button
            disabled={hasInvalidFields || createNetworkInProgress}
            inProgress={createNetworkInProgress}
            onclick={createNetwork}>
            Create
          </Button>
        </ButtonRow>

        {#if createError}
          <ErrorMessage class="text-sm" error={createError} />
        {/if}
      </div>
    {/snippet}
  </EngineFormPage>
</Route>
