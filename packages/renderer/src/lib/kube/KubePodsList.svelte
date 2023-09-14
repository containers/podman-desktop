<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import { router } from 'tinro';
import type { Unsubscriber } from 'svelte/store';
import { filtered, searchPattern } from '../../stores/kubernetesPods';
import NavPage from '../ui/NavPage.svelte';
import type { PodUIInfo } from '../../../../main/src/plugin/api/kubernetes-info';
import PodIcon from '../images/PodIcon.svelte';
import KubernetesPodStatusIcon from '../images/KubernetesPodStatusIcon.svelte';
import KubeActions from './KubeActions.svelte';

// Store
let pods: PodUIInfo[] = [];

const objectType: string = 'pods';

// Search term items
let searchTerm = '';
$: searchPattern.set(searchTerm);

// Subscribe on load to the store
let podsUnsubscribe: Unsubscriber;
onMount(async () => {
  podsUnsubscribe = filtered.subscribe(value => {
    pods = value;
  });
});

// Unsubscribe from the store to avoid memory leaks
onDestroy(() => {
  if (podsUnsubscribe) {
    podsUnsubscribe();
  }
});

function openKubeDetails(namespace: string, name: string) {
  router.goto(`/kubernetes/details/pods/${encodeURI(namespace)}/${encodeURI(name)}/summary`);
}
</script>

<NavPage bind:searchTerm="{searchTerm}" title="pods">
  <div class="flex min-w-full h-full" slot="content">
    <table class="mx-5 w-full h-fit">
      <!-- title -->
      <thead>
        <tr class="h-7 uppercase text-xs text-gray-600">
          <th class="text-center font-extrabold w-10 px-2">Status</th>
          <th>Name</th>
          <th class="whitespace-nowrap px-6">Namespace</th>
          <th class="whitespace-nowrap px-6">Containers</th>
          <th class="whitespace-nowrap px-6">Restarts</th>
          <th class="whitespace-nowrap px-6">Node</th>
          <th class="whitespace-nowrap px-6">QoS</th>
          <th class="whitespace-nowrap px-6">Age</th>
          <th class="text-right pr-2">Actions</th>
        </tr>
      </thead>
      <tbody class="">
        {#each pods as pod}
          <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
            <td class="bg-charcoal-800 group-hover:bg-zinc-700 flex flex-row justify-center h-12">
              <div class="grid place-content-center ml-3 mr-4">
                <KubernetesPodStatusIcon icon="{PodIcon}" status="{pod.status}" terminating="{pod.terminating}" />
              </div>
            </td>
            <td
              class="whitespace-nowrap w-10 hover:cursor-pointer"
              on:click="{() => openKubeDetails(pod.namespace, pod.name)}">
              <div class="flex items-center">
                <div class="flex flex-row items-center">
                  <div class="text-sm text-gray-300">{pod.name}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{pod.namespace}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <!-- Create a small green box for each container  if pod.containers container has state as 'running' -->
                {#each pod.containers as container}
                  {#if container.state === 'running'}
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-1 text-center"></div>
                  {:else if container.state == 'waiting'}
                    <div class="w-2 h-2 bg-amber-500 rounded-full mr-1 text-center"></div>
                  {:else if container.state == 'terminated'}
                    <div class="w-2 h-2 bg-red-500 rounded-full mr-1 text-center"></div>
                  {:else}
                    <div class="w-2 h-2 bg-gray-500 rounded-full mr-1 text-center"></div>
                  {/if}
                {/each}
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{pod.restarts}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{pod.node}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{pod.qos}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{pod.age}</div>
              </div>
            </td>
            <td class="pl-6 text-right whitespace-nowrap rounded-tr-lg rounded-br-lg">
              <div class="flex w-full">
                <div class="flex items-center w-5">
                  <div>&nbsp;</div>
                </div>
                <div class="text-right w-full">
                  <KubeActions pod="{pod}" />
                </div>
              </div>
            </td>
          </tr>
          <tr><td class="leading-[8px]">&nbsp;</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</NavPage>
