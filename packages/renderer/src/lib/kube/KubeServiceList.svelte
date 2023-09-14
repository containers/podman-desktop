<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import type { Unsubscriber } from 'svelte/store';
import { filtered, searchPattern } from '../../stores/kubernetesServices';
import NavPage from '../ui/NavPage.svelte';
import type { ServiceUIInfo } from '../../../../main/src/plugin/api/kubernetes-info';
import PodIcon from '../images/PodIcon.svelte';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import KubernetesFakeStatusIcon from '../images/KubernetesFakeStatusIcon.svelte';

// Store
let services: ServiceUIInfo[] = [];

// Search term items
let searchTerm = '';
$: searchPattern.set(searchTerm);

// Subscribe on load to the store
let servicesUnsubscribe: Unsubscriber;
onMount(async () => {
  servicesUnsubscribe = filtered.subscribe(value => {
    services = value;
  });
  console.log(services);
});

// Unsubscribe from the store to avoid memory leaks
onDestroy(() => {
  if (servicesUnsubscribe) {
    servicesUnsubscribe();
  }
});
</script>

<NavPage bind:searchTerm="{searchTerm}" title="services">
  <div class="min-w-full flex" slot="table">
    <table class="mx-5 w-full" class:hidden="{services.length === 0}">
      <!-- title -->
      <thead>
        <tr class="h-7 uppercase text-xs text-gray-600">
          <th class="text-center font-extrabold w-10 px-2">Status</th>
          <th>Name</th>
          <th class="whitespace-nowrap px-6">Namespace</th>
          <th class="whitespace-nowrap px-6">Type</th>
          <th class="whitespace-nowrap px-6">Cluster IP</th>
          <th class="whitespace-nowrap px-6">External IP</th>
          <th class="whitespace-nowrap px-6">Ports</th>
          <th class="text-right pr-2">Actions</th>
        </tr>
      </thead>
      <tbody class="">
        {#each services as service}
          <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
            <td class="bg-charcoal-800 group-hover:bg-zinc-700 flex flex-row justify-center h-12">
              <div class="grid place-content-center ml-3 mr-4">
                <KubernetesFakeStatusIcon icon="{PodIcon}" />
              </div>
            </td>
            <td class="whitespace-nowrap w-10 hover:cursor-pointer">
              <div class="flex items-center">
                <div class="flex flex-row items-center">
                  <div class="text-sm text-gray-300">{service.name}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{service.namespace}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{service.type}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{service.clusterIP}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{service.externalIP}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{service.ports}</div>
              </div>
            </td>
            <td class="pl-6 text-right whitespace-nowrap rounded-tr-lg rounded-br-lg">
              <div class="flex w-full">
                <div class="flex items-center w-5">
                  <div>&nbsp;</div>
                </div>
                <div class="text-right w-full">
                  <ListItemButtonIcon title="Delete Service" icon="{faTrash}" />
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
