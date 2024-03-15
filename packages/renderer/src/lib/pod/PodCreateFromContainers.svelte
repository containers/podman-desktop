<script lang="ts">
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import type { PodCreatePortOptions } from '../../../../main/src/plugin/dockerode/libpod-dockerode';
import { type PodCreation, podCreationHolder } from '../../stores/creation-from-containers-store';
import { providerInfos } from '../../stores/providers';
import ContainerIcon from '../images/ContainerIcon.svelte';
import SolidPodIcon from '../images/SolidPodIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import Button from '../ui/Button.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import FormPage from '../ui/FormPage.svelte';

let podCreation: PodCreation;
let createInProgress = false;
let createError: string | undefined = undefined;
$: mapPortExposed = new Map<number, { exposed: boolean; container: string }>();
let containersPorts: { containers: string[]; ports: number[] }[];
$: containersPorts = [];

let providers: ProviderInfo[] = [];
$: providerConnections = providers
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.type === 'podman')
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');
$: selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
let selectedProvider: ProviderContainerConnectionInfo | undefined = undefined;
$: selectedProvider = !selectedProvider && selectedProviderConnection ? selectedProviderConnection : selectedProvider;

async function createPodFromContainers() {
  createInProgress = true;
  try {
    await doCreatePodFromContainers();
  } catch (error) {
    createError = String(error);
  }
  createInProgress = false;
}
async function doCreatePodFromContainers() {
  if (!selectedProvider) {
    throw new Error('no provider selected');
  }

  // fetch port info from all containers
  const portmappingsArray = await Promise.all(
    podCreation.containers.map(async container => {
      const containerInspect = await window.getContainerInspect(container.engineId, container.id);

      // convert port bindings to an port mapping object
      return Object.entries(containerInspect.HostConfig.PortBindings).map(([key, value]) => {
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
  const { Id, engineId } = await window.createPod({ name: podCreation.name, portmappings, provider: selectedProvider });
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
      { ...container },
      { engineId },
      { pod: Id, name: container.name + '-podified' },
    );
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
    if (!value) {
      return;
    }
    podCreation = value;
    const mapPortPrivate = new Map<number, string[]>();
    podCreation.containers.forEach(container => {
      container.ports.forEach(port => {
        mapPortExposed.set(port.PublicPort, {
          exposed: true,
          container: container.name,
        });
        mapPortPrivate.set(port.PrivatePort, [...(mapPortPrivate.get(port.PrivatePort) || []), container.name]);
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

<FormPage title="Copy containers to a pod" inProgress="{createInProgress}">
  <SolidPodIcon slot="icon" size="40" />

  <div class="min-w-full h-fit" slot="content">
    <div class="m-5 p-6 bg-charcoal-800 rounded-sm text-gray-700">
      <div>
        {#if podCreation}
          {#if containersPorts.length > 0}
            <div class="bg-charcoal-600 border-t-2 border-amber-500 p-4 mb-2" role="alert" aria-label="warning">
              <div class="flex flex-row">
                <div class="mr-3">
                  <Fa size="1.125x" class="text-amber-400" icon="{faTriangleExclamation}" />
                </div>
                <div class="flex flex-col">
                  <div class="text-sm text-amber-400">Possible runtime error</div>
                  {#each containersPorts as { containers, ports }}
                    <div class="mt-1 text-sm text-white">
                      Containers
                      {#each containers as container, index}
                        <span class="font-bold">{container}</span>
                        {#if index === containers.length - 2}
                          and
                        {:else if index < containers.length - 1}
                          ,
                        {/if}
                        {' '}
                      {/each}
                      use same <span class="font-bold">{ports.length > 1 ? 'ports' : 'port'} {ports.join(', ')}</span>.
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
          <div class="mb-2">
            <span class="block text-sm font-semibold rounded text-gray-400">Name of the pod:</span>
          </div>
          <div class="mb-4">
            <Input
              name="podName"
              id="podName"
              bind:value="{podCreation.name}"
              placeholder="Select name of the pod..."
              aria-label="Pod name"
              class="w-full mt-1"
              required />
          </div>

          <div class="mb-2">
            <span class="block text-sm font-semibold rounded text-gray-400" aria-label="Containers"
              >Containers to replicate to the pod:</span>
          </div>
          <div class="w-full bg-charcoal-900 mb-4 max-h-40 overflow-y-auto">
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
              <span class="block text-sm font-semibold rounded text-gray-400" aria-label="Exposed ports"
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
              class="p-2 block mb-2 text-sm font-medium rounded bg-zinc-700 text-gray-300"
              >Container Engine
              <select
                class="w-full p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-400 placeholder-gray-400"
                name="providerChoice"
                bind:value="{selectedProvider}">
                {#each providerConnections as providerConnection}
                  <option value="{providerConnection}">{providerConnection.name}</option>
                {/each}
              </select>
            </label>
          {/if}
          {#if providerConnections.length === 1 && selectedProviderConnection?.name}
            <input type="hidden" name="providerChoice" readonly bind:value="{selectedProviderConnection.name}" />
          {/if}
        </div>

        <div class="w-full grid justify-items-end">
          <div>
            <Button type="link" on:click="{() => router.goto('/containers')}">Close</Button>
            <Button
              icon="{SolidPodIcon}"
              bind:disabled="{createInProgress}"
              on:click="{() => {
                createPodFromContainers();
              }}"
              bind:inProgress="{createInProgress}"
              aria-label="Create pod">
              Create Pod
            </Button>
          </div>
        </div>

        {#if createError}
          <ErrorMessage class="pt-2 text-sm" error="{createError}" />
        {/if}
      </div>
    </div>
  </div>
</FormPage>
