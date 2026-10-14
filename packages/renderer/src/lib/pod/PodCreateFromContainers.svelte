<script lang="ts">
import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';
import type { PodCreatePortOptions } from '@desktop-framework/api/libpod';
import { Button, ButtonRow, Checkbox, ErrorMessage, Input, StatusIcon } from '@podman-desktop/ui-svelte';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';
import { onDestroy, onMount } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
import SolidPodIcon from '/@/lib/images/SolidPodIcon.svelte';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import WarningMessage from '/@/lib/ui/WarningMessage.svelte';
import { handleNavigation } from '/@/navigation';
import { type PodCreation, podCreationHolder } from '/@/stores/creation-from-containers-store';
import { providerInfos } from '/@/stores/providers';

let podCreation = $state<PodCreation>();
let createInProgress = $state<boolean>(false);
let createError = $state<string>();
let mapPortExposed = new SvelteMap<number, { exposed: boolean; container: string }>();
let containersPorts = $state<{ containers: string[]; ports: number[] }[]>([]);

let providerConnections = $derived<ProviderContainerConnectionInfo[]>(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.type === 'podman')
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

//eslint-disable-next-line svelte/prefer-writable-derived
let selectedProviderConnection = $state<ProviderContainerConnectionInfo>();
//eslint-disable-next-line svelte/prefer-writable-derived
let selectedProvider = $state<ProviderContainerConnectionInfo>();

$effect(() => {
  selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
  const exists = providerConnections.some(
    connection =>
      connection.name === selectedProvider?.name &&
      connection.endpoint.socketPath === selectedProvider?.endpoint.socketPath,
  );
  if (!exists) {
    selectedProvider = selectedProviderConnection;
  }
});

async function createPodFromContainers(): Promise<void> {
  createInProgress = true;
  try {
    await doCreatePodFromContainers();
  } catch (error) {
    createError = String(error);
  }
  createInProgress = false;
}
async function doCreatePodFromContainers(): Promise<void> {
  if (!selectedProvider) {
    throw new Error('no provider selected');
  }
  if (!podCreation) {
    throw new Error('no pod creation');
  }
  // fetch port info from all containers
  const portmappingsArray = await Promise.all(
    podCreation.containers.map(async container => {
      const containerInspect = await window.getContainerInspect(container.engineId, container.id);

      // convert port bindings to an port mapping object
      return Object.entries(containerInspect.HostConfig.PortBindings).map(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valueAny: any = value;
        const container_port = parseInt(key.split('/')[0]);
        // we may not have any value
        if (!value) {
          return undefined;
        }
        const host_port = parseInt(valueAny[0].HostPort);

        const host_ip = valueAny[0].HostIp as string;
        return {
          host_ip,
          host_port,
          container_port,
          range: 1,
          protocol: '',
        };
      });
    }),
  );

  // make it flat and remove undefined values
  const portmappings = portmappingsArray
    .flat()
    .filter(
      portmapping =>
        portmapping !== undefined &&
        mapPortExposed.has(portmapping.host_port) &&
        mapPortExposed.get(portmapping.host_port)?.exposed,
    )
    .filter(item => item !== undefined) as PodCreatePortOptions[];

  // first create pod
  const { Id, engineId } = await window.createPod({
    name: podCreation.name,
    portmappings,
    provider: $state.snapshot(selectedProvider),
  });
  // now, for each container, recreate it with the pod
  // but before, stop the container

  // then, stop all containers
  for (const container of podCreation.containers) {
    // make sure it is stopped
    try {
      await window.stopContainer(container.engineId, container.id);
    } catch (error) {
      // already stopped
    }
  }

  // then replicate containers
  for (const container of podCreation.containers) {
    // recreate the container but adding the pod and using a different name

    await window.replicatePodmanContainer(
      $state.snapshot(container),
      { engineId },
      { pod: Id, name: container.name + '-podified' },
    );
  }

  // finally, start the pod
  await window.startPod(engineId, Id);

  // ok now, redirect to the pods
  router.goto('/pods/');
}

let podCreationUnsubscribe: Unsubscriber;
onMount(() => {
  podCreationUnsubscribe = podCreationHolder.subscribe(value => {
    if (!value) {
      return;
    }
    podCreation = value;
    const mapPortPrivate = new SvelteMap<number, string[]>();
    podCreation.containers.forEach(container => {
      container.ports.forEach(port => {
        mapPortExposed.set(port.PublicPort, {
          exposed: true,
          container: container.name,
        });
        mapPortPrivate.set(port.PrivatePort, [...(mapPortPrivate.get(port.PrivatePort) ?? []), container.name]);
      });
    });
    mapPortPrivate.forEach((value, key) => {
      if (value.length < 2) {
        mapPortPrivate.delete(key);
        return;
      }
      const indexContainersItem = getIndexSameContainersItems(value);
      if (indexContainersItem !== undefined) {
        containersPorts[indexContainersItem].ports.push(key);
      } else {
        containersPorts.push({
          containers: value,
          ports: [key],
        });
      }
    });
  });
});

function getIndexSameContainersItems(containers: string[]): number | undefined {
  let index = 0;
  for (const entry of containersPorts) {
    const isDiff =
      containers.filter(arr1Item => !entry.containers.includes(arr1Item)).length > 0 ||
      entry.containers.filter(arr1Item => !containers.includes(arr1Item)).length > 0;
    if (!isDiff) {
      return index;
    }
    index++;
  }
  return undefined;
}

onDestroy(() => {
  if (podCreationUnsubscribe) {
    podCreationUnsubscribe();
  }
  // reset
  podCreationHolder.set(undefined);
});

function updatePortExposure(port: number, checked: boolean): void {
  const val = mapPortExposed.get(port);
  if (val) {
    mapPortExposed.set(port, {
      exposed: checked,
      container: val.container,
    });
    mapPortExposed = mapPortExposed;
  }
}

function getWarningText(): string {
  let text = '';
  containersPorts.forEach(item => {
    text += 'Containers ';
    item.containers.forEach((container, index) => {
      text += `${container} `;
      if (index === item.containers.length - 2) {
        text += 'and ';
      } else if (index < item.containers.length - 1) {
        text += ', ';
      }
    });
    text += `use same ${item.ports.length > 1 ? 'ports' : 'port'} ${item.ports.join(', ')}\n`;
  });
  return text;
}

function navigateToContainers(): void {
  return handleNavigation({ page: NavigationPage.CONTAINERS });
}
</script>

<EngineFormPage title="Copy containers to a pod" inProgress={createInProgress}>
  {#snippet icon()}
  <SolidPodIcon size="40" />
  {/snippet}

  {#snippet content()}
  <div >
    <div>
      {#if podCreation}
        {#if containersPorts.length > 0}
          <WarningMessage class="flex flex-row w-full  mb-2" error={getWarningText()} />
        {/if}
        <div class="mb-2">
          <span class="block font-semibold rounded-sm text-[var(--pd-content-card-header-text)]"
            >Name of the pod:</span>
        </div>
        <div class="mb-4">
          <Input
            name="podName"
            id="podName"
            bind:value={podCreation.name}
            placeholder="Select name of the pod..."
            aria-label="Pod name"
            required />
        </div>

        <div class="mb-2">
          <span
            class="block font-semibold rounded-sm text-[var(--pd-content-card-header-text)]"
            aria-label="Containers">Containers to replicate to the pod:</span>
        </div>
        <div class="w-full bg-[var(--pd-content-card-inset-bg)] mb-4 max-h-40 overflow-y-auto">
          {#each podCreation.containers as container, index (container.id)}
            <div class="p-2 flex flex-row items-center text-[var(--pd-content-card-text)]">
              <div class="w-10"><StatusIcon icon={ContainerIcon} status="STOPPED" /></div>
              <div class="w-16 pl-3">{index + 1}.</div>
              <div class="grow">{container.name}</div>
              <div class="w-28">({container.id.substring(0, 7)})</div>
            </div>
          {/each}
        </div>

        {#if mapPortExposed.size > 0}
          <div class="mb-2">
            <span
              class="block font-semibold rounded-sm text-[var(--pd-content-card-header-text)]"
              aria-label="Exposed ports">All selected ports will be exposed:</span>
          </div>
          <div class="bg-[var(--pd-content-card-inset-bg)] mb-4 max-h-40 overflow-y-auto">
            {#each [...mapPortExposed] as [port, value] (port)}
              <div class="p-2 flex flex-row align-items text-sm text-[var(--pd-content-card-text)]">
                <Checkbox
                  class="pt-0.5 mr-5"
                  bind:checked={value.exposed}
                  on:click={(event): void => updatePortExposure(port, event.detail)} />
                <div class="w-28 mr-5">Port {port.toString()}</div>
                <span>{value.container}</span>
              </div>
            {/each}
          </div>
        {/if}
      {/if}

      {#if providerConnections.length > 1}
        <label
          for="providerConnectionName"
          class="block mb-2 font-semibold rounded-sm text-[var(--pd-content-card-header-text)]"
          >Container engine:</label>
        <ContainerConnectionDropdown
          class="w-full"
          name="providerChoice"
          bind:value={selectedProvider}
          connections={providerConnections}
        />
      {/if}
      {#if providerConnections.length === 1 && selectedProviderConnection?.name}
        <input type="hidden" name="providerChoice" readonly bind:value={selectedProviderConnection.name} />
      {/if}

      <ButtonRow class="mt-5">
        <Button type="link" on:click={navigateToContainers}>Close</Button>
        <Button
          icon={SolidPodIcon}
          disabled={createInProgress}
          on:click={createPodFromContainers}
          inProgress={createInProgress}
          aria-label="Create pod">
          Create Pod
        </Button>
      </ButtonRow>

      {#if createError}
        <ErrorMessage class="pt-2 text-sm" error={createError} />
      {/if}
    </div>
  </div>
  {/snippet}
</EngineFormPage>
