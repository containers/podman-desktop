<script lang="ts">
import { providerInfos } from '../../stores/providers';
import { onDestroy, onMount } from 'svelte';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { type PodCreation, podCreationHolder } from '../../stores/creation-from-containers-store';
import NavPage from '../ui/NavPage.svelte';
import { router } from 'tinro';
import type { Unsubscriber } from 'svelte/store';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import ContainerIcon from '../images/ContainerIcon.svelte';

let podCreation: PodCreation;
let createInProgress = false;
let createError = undefined;
$: mapPortExposed = new Map<number, { exposed: boolean; container: string }>();

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
  const portmappings = portmappingsArray
    .flat()
    .filter(
      portmapping =>
        portmapping !== undefined &&
        mapPortExposed.has(portmapping.host_port) &&
        mapPortExposed.get(portmapping.host_port).exposed,
    );

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
    podCreation.containers.forEach(container => {
      container.ports.forEach(port => {
        mapPortExposed.set(port, {
          exposed: true,
          container: container.name,
        });
      });
    });
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

function updatePortExposure(port: number, checked: boolean) {
  const val = mapPortExposed.get(port);
  if (val) {
    mapPortExposed.set(port, {
      exposed: checked,
      container: val.container,
    });
    mapPortExposed = mapPortExposed;
  }
}
</script>

<NavPage title="Copy containers to a pod" searchEnabled="{false}">
  <div class="w-full h-full min-w-fit" slot="empty">
    <div class="m-5 p-6 h-full bg-charcoal-800 rounded-sm text-gray-700">
      <div class="w-4/5 min-w-[500px]">
        {#if podCreation}
          <div class="">
            <label for="podName" class="block mb-2 text-sm font-medium rounded text-gray-400 dark:text-gray-400"
              >Name of the pod:
              <input
                name="podName"
                id="podName"
                bind:value="{podCreation.name}"
                placeholder="Select name of the pod..."
                class="w-full mt-1 p-2 outline-0 text-sm bg-charcoal-500 focus:bg-charcoal-900 border-violet-700 border-b focus:border-violet-700 focus:border rounded-sm text-gray-500 focus:text-gray-700 placeholder-gray-700"
                required />
            </label>
          </div>

          <div class="mb-2">
            <span class="block text-sm font-medium rounded text-gray-400 dark:text-gray-400"
              >Containers to replicate to the pod:</span>
          </div>
          <div class="max-w-full bg-charcoal-900 mb-4 max-h-40 overflow-y-auto">
            {#each podCreation.containers as container, index}
              <div class="p-2 flex flex-row items-center text-gray-700">
                <div class="w-10"><StatusIcon icon="{ContainerIcon}" status="STOPPED" /></div>
                <div class="w-16 pl-3">{index + 1}.</div>
                <div class="grow">{container.name}</div>
                <div class="w-28">({container.id.substring(0, 7)})</div>
              </div>
            {/each}
          </div>

          {#if mapPortExposed.size > 0}
            <div class="mb-2">
              <span class="block text-sm font-medium rounded text-gray-400 dark:text-gray-400"
                >All selected ports will be exposed:</span>
            </div>
            <div class="bg-charcoal-900 mb-4 max-h-40 overflow-y-auto">
              {#each [...mapPortExposed] as [port, value]}
                <div class="p-2 flex flex-row align-items text-gray-700">
                  <input
                    type="checkbox"
                    class="mr-5"
                    checked="{value.exposed}"
                    on:click="{event => updatePortExposure(port, event.currentTarget.checked)}" />
                  <div class="w-28 mr-5">
                    <span class="text-sm">Port {port.toString()}</span>
                  </div>
                  <span class="text-sm">{value.container}</span>
                </div>
              {/each}
            </div>
          {/if}
        {/if}

        <div>
          {#if providerConnections.length > 1}
            <label
              for="providerConnectionName"
              class="p-2 block mb-2 text-sm font-medium rounded bg-zinc-700 text-gray-300 dark:text-gray-300"
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

        <div class="w-full">
          <div class="float-right">
            <button class="pf-c-button underline hover:text-gray-400" on:click="{() => router.goto('/containers')}">
              Close
            </button>
            <button
              disabled="{createInProgress}"
              on:click="{() => {
                createPodFromContainers();
              }}"
              class="pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                {#if createInProgress}
                  <div class="mr-24">
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
              Create Pod
            </button>
          </div>
        </div>

        {#if createError}
          <ErrorMessage class="pt-2 text-sm" error="{createError}" />
        {/if}
      </div>
    </div>
  </div>
</NavPage>
