<script lang="ts">
import { providerInfos } from '../../stores/providers';
import { onDestroy, onMount } from 'svelte';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { PodCreation, podCreationHolder } from '../../stores/creation-from-containers-store';
import NavPage from '../ui/NavPage.svelte';
import { router } from 'tinro';
import type { Unsubscriber } from 'svelte/store';

let podCreation: PodCreation;
let createInProgress = false;
let createError = undefined;

let providers: ProviderInfo[] = [];
$: providerConnections = providers
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.type === 'podman')
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');
$: selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
let selectedProvider: ProviderContainerConnectionInfo = undefined;
$: selectedProvider = !selectedProvider && selectedProviderConnection ? selectedProviderConnection : selectedProvider;

async function createPodFromContainers() {
  createInProgress = true;
  try {
    await doCreatePodFromContainers();
  } catch (error) {
    createError = error;
  }
  createInProgress = false;
}
async function doCreatePodFromContainers() {
  // fetch port info from all containers
  const portmappingsArray = await Promise.all(
    podCreation.containers.map(async container => {
      const containerInspect = await window.getContainerInspect(container.engineId, container.id);

      // convert port bindings to an port mapping object
      return Object.entries(containerInspect.HostConfig.PortBindings).map(([key, value]) => {
        const container_port = parseInt(key.split('/')[0]);
        // we may not have any value
        if (!value || value === null) {
          return undefined;
        }
        const host_port = parseInt(value[0].HostPort);

        const host_ip = value[0].HostIp as string;
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
  const portmappings = portmappingsArray.flat().filter(portmapping => portmapping !== undefined);

  // first create pod
  const { Id, engineId } = await window.createPod(selectedProvider, { name: podCreation.name, portmappings });
  // now, for each container, recreate it with the pod
  // but before, stop the container

  const containersToStart: { engineId: string; id: string }[] = [];

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

    const replicatedContainer = await window.replicatePodmanContainer(
      { ...container },
      { engineId },
      { pod: Id, name: container.name + '-podified' },
    );
    containersToStart.push({ engineId, id: replicatedContainer.Id });
  }

  // finally, start the pod
  await window.startPod(engineId, Id);

  // ok now, redirect to the pods
  router.goto('/pods/');
}

let providersUnsubscribe: Unsubscriber;
let podCreationUnsubscribe: Unsubscriber;
onMount(() => {
  providersUnsubscribe = providerInfos.subscribe(value => {
    providers = value;
  });

  podCreationUnsubscribe = podCreationHolder.subscribe(value => {
    podCreation = value;
  });
});

onDestroy(() => {
  if (providersUnsubscribe) {
    providersUnsubscribe();
  }
  if (podCreationUnsubscribe) {
    podCreationUnsubscribe();
  }
  // reset
  podCreationHolder.set(undefined);
});
</script>

<NavPage title="Copy containers to a pod" searchEnabled="{false}" subtitle="Create a pod from containers">
  <div class="w-full h-full" slot="empty">
    <div class="m-5 p-5 h-full bg-zinc-900 rounded-sm text-gray-400">
      {#if podCreation}
        <div class="">
          <label
            for="podName"
            class="p-2 block mb-2 text-sm font-medium rounded bg-zinc-700 text-gray-900 dark:text-gray-300"
            >Name of the pod:
            <input
              name="podName"
              id="podName"
              bind:value="{podCreation.name}"
              placeholder="Select name of the pod..."
              class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
              required />
          </label>
        </div>

        <div class="">
          <label
            for="podName"
            class="p-2 block mb-2 text-sm font-medium rounded bg-zinc-700 text-gray-900 dark:text-gray-300"
            >Containers to replicate to the pod:

            <table>
              {#each podCreation.containers as container, index}
                <tr class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400">
                  <td class="px-2">{index + 1}.</td>
                  <td class="px-2">{container.name}</td>
                  <td class="px-2">({container.id.substring(0, 7)})</td>
                </tr>
              {/each}
            </table>
          </label>
        </div>
      {/if}

      <div>
        {#if providerConnections.length > 1}
          <label
            for="providerConnectionName"
            class="p-2 block mb-2 text-sm font-medium rounded bg-zinc-700 text-gray-900 dark:text-gray-300"
            >Container Engine
            <select
              class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
              name="providerChoice"
              bind:value="{selectedProvider}">
              {#each providerConnections as providerConnection}
                <option value="{providerConnection}">{providerConnection.name}</option>
              {/each}
            </select>
          </label>
        {/if}
        {#if providerConnections.length == 1}
          <input type="hidden" name="providerChoice" readonly bind:value="{selectedProviderConnection.name}" />
        {/if}
      </div>

      <button
        disabled="{createInProgress}"
        on:click="{() => {
          createPodFromContainers();
        }}"
        class="w-full pf-c-button pf-m-primary"
        type="button">
        <span class="pf-c-button__icon pf-m-start">
          {#if createInProgress}
            <div class="mr-4">
              <i class="pf-c-button__progress">
                <span class="pf-c-spinner pf-m-md" role="progressbar">
                  <span class="pf-c-spinner__clipper"></span>
                  <span class="pf-c-spinner__lead-ball"></span>
                  <span class="pf-c-spinner__tail-ball"></span>
                </span>
              </i>
            </div>
          {:else}
            <i class="fas fa-cube" aria-hidden="true"></i>
          {/if}
        </span>
        Create Pod using these containers
      </button>

      {#if createError}
        <div class="pt-4 text-red-500 text-sm">{createError}</div>
      {/if}
    </div>
  </div>
</NavPage>
