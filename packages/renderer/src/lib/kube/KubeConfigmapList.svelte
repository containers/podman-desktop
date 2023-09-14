<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import type { Unsubscriber } from 'svelte/store';
import { filtered, searchPattern } from '../../stores/kubernetesConfigMaps';
import NavPage from '../ui/NavPage.svelte';
import type { ConfigMapUIInfo } from '../../../../main/src/plugin/api/kubernetes-info';
import PodIcon from '../images/PodIcon.svelte';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import KubernetesFakeStatusIcon from '../images/KubernetesFakeStatusIcon.svelte';

// Store
let configmaps: ConfigMapUIInfo[] = [];

// Search term items
let searchTerm = '';
$: searchPattern.set(searchTerm);

// Subscribe on load to the store
let configmapsUnsubscribe: Unsubscriber;
onMount(async () => {
  configmapsUnsubscribe = filtered.subscribe(value => {
    configmaps = value;
  });
  console.log(configmaps);
});

// Unsubscribe from the store to avoid memory leaks
onDestroy(() => {
  if (configmapsUnsubscribe) {
    configmapsUnsubscribe();
  }
});
</script>

<NavPage bind:searchTerm="{searchTerm}" title="ConfigMaps">
  <div class="min-w-full flex" slot="table">
    <table class="mx-5 w-full" class:hidden="{configmaps.length === 0}">
      <!-- title -->
      <thead>
        <tr class="h-7 uppercase text-xs text-gray-600">
          <th class="text-center font-extrabold w-10 px-2">Status</th>
          <th>Name</th>
          <th class="whitespace-nowrap px-6">Namespace</th>
          <th class="whitespace-nowrap px-6">Keys</th>
          <th class="text-right pr-2">Actions</th>
        </tr>
      </thead>
      <tbody class="">
        {#each configmaps as configmap}
          <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
            <td class="bg-charcoal-800 group-hover:bg-zinc-700 flex flex-row justify-center h-12">
              <div class="grid place-content-center ml-3 mr-4">
                <KubernetesFakeStatusIcon icon="{PodIcon}" />
              </div>
            </td>
            <td class="whitespace-nowrap w-10 hover:cursor-pointer">
              <div class="flex items-center">
                <div class="flex flex-row items-center">
                  <div class="text-sm text-gray-300">{configmap.name}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{configmap.namespace}</div>
              </div>
            </td>
            <!-- Show comma separated configmap.keys -->
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-600">{configmap.keys.join(', ')}</div>
              </div>
            </td>
            <td class="pl-6 text-right whitespace-nowrap rounded-tr-lg rounded-br-lg">
              <div class="flex w-full">
                <div class="flex items-center w-5">
                  <div>&nbsp;</div>
                </div>
                <div class="text-right w-full">
                  <ListItemButtonIcon title="Delete ConfigMap" icon="{faTrash}" />
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
