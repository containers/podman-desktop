<script lang="ts">
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Checkbox from '../ui/Checkbox.svelte';
import { ContainerGroupInfoTypeUI, type ContainerGroupInfoUI, type ContainerInfoUI } from './ContainerInfoUI';
import Fa from 'svelte-fa';
import StatusIcon from '../images/StatusIcon.svelte';
import PodIcon from '../images/PodIcon.svelte';
import { router } from 'tinro';
import PodActions from '../pod/PodActions.svelte';
import ComposeActions from '../compose/ComposeActions.svelte';
import StateChange from '../ui/StateChange.svelte';
import ContainerActions from './ContainerActions.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import { providerInfos } from '/@/stores/providers';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import { filtered } from '../../stores/containers';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';
import ContainerIcon from '../images/ContainerIcon.svelte';
import ContainerEmptyScreen from './ContainerEmptyScreen.svelte';
import { createEventDispatcher } from 'svelte';

export let containerGroups: ContainerGroupInfoUI[];
export let selectedItemsNumber: number;
export let multipleEngines: boolean;
export let searchTerm = '';

const dispatch = createEventDispatcher();

function errorCallback(container: ContainerInfoUI, errorMessage: string): void {
  dispatch('errorCallback', { container, errorMessage });
}

function inProgressCallback(container: ContainerInfoUI, inProgress: boolean, state?: string): void {
  dispatch('inProgressCallback', { container, inProgress, state });
}

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

// do we need to unselect all checkboxes if we don't have all items being selected ?
$: selectedAllCheckboxes =
  containerGroups.filter(group => group.type !== ContainerGroupInfoTypeUI.STANDALONE).every(group => group.selected) &&
  containerGroups
    .map(group => group.containers)
    .flat()
    .every(container => container.selected);

function toggleCheckboxContainerGroup(checked: boolean, containerGroup: ContainerGroupInfoUI) {
  // need to apply that on all containers
  containerGroup.containers.forEach(container => (container.selected = checked));
}

function openDetailsContainer(container: ContainerInfoUI) {
  router.goto(`/containers/${container.id}/`);
}

function openGroupDetails(containerGroup: ContainerGroupInfoUI): void {
  if (!containerGroup.engineId) {
    return;
  }
  if (containerGroup.type === ContainerGroupInfoTypeUI.POD) {
    router.goto(`/pods/podman/${encodeURI(containerGroup.name)}/${encodeURIComponent(containerGroup.engineId)}/logs`);
  } else if (containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE) {
    router.goto(`/compose/${encodeURI(containerGroup.name)}/${encodeURI(containerGroup.engineId)}/logs`);
  }
}

function toggleContainerGroup(containerGroup: ContainerGroupInfoUI) {
  containerGroup.expanded = !containerGroup.expanded;
  // update the group expanded attribute if this is the matching group
  containerGroups = containerGroups.map(group => (group.name === containerGroup.name ? containerGroup : group));
}

function toggleAllContainerGroups(checked: boolean) {
  const toggleContainers = containerGroups;
  toggleContainers
    .filter(group => group.type !== ContainerGroupInfoTypeUI.STANDALONE)
    .forEach(group => (group.selected = checked));
  toggleContainers.forEach(group => group.containers.forEach(container => (container.selected = checked)));
  containerGroups = toggleContainers;
}

// Go through each container passed in and update the progress
function composeGroupInProgressCallback(containers: ContainerInfoUI[], inProgress: boolean, state?: string): void {
  containers.forEach(container => {
    container.actionInProgress = inProgress;
    // reset error when starting task
    if (inProgress) {
      container.actionError = '';
    }
    if (state) {
      container.state = state;
    }
  });

  containerGroups = [...containerGroups];
}
</script>

<div class="flex min-w-full h-full">
  <table class="mx-5 w-full h-fit" class:hidden="{containerGroups.length === 0}">
    <!-- title -->
    <thead class="sticky top-0 bg-charcoal-700 z-[2]">
      <tr class="h-7 uppercase text-xs text-gray-600">
        <th class="whitespace-nowrap w-5"></th>
        <th class="px-2 w-5">
          <Checkbox
            title="Toggle all"
            bind:checked="{selectedAllCheckboxes}"
            indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
            on:click="{event => toggleAllContainerGroups(event.detail)}" />
        </th>
        <th class="text-center font-extrabold w-10 px-2">Status</th>
        <th class="w-10">Name</th>
        <th>Image</th>
        <th class="pl-4">Age</th>
        <th class="text-right pr-2">actions</th>
      </tr>
    </thead>

    <!-- Display each group -->
    {#each containerGroups as containerGroup}
      <tbody>
        {#if containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE || containerGroup.type === ContainerGroupInfoTypeUI.POD}
          <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
            <td
              class="bg-charcoal-800 group-hover:bg-zinc-700 pl-2 w-3 rounded-tl-lg"
              class:rounded-bl-lg="{!containerGroup.expanded}"
              on:click="{() => toggleContainerGroup(containerGroup)}">
              <Fa
                size="12"
                class="text-gray-700 cursor-pointer"
                icon="{containerGroup.expanded ? faChevronDown : faChevronRight}" />
            </td>
            <td class="px-2">
              <Checkbox
                title="Toggle {containerGroup.type}"
                bind:checked="{containerGroup.selected}"
                on:click="{event => toggleCheckboxContainerGroup(event.detail, containerGroup)}" />
            </td>
            <td class="flex flex-row justify-center h-12" title="{containerGroup.type}">
              <div class="grid place-content-center ml-3 mr-4">
                <StatusIcon icon="{PodIcon}" status="{containerGroup.status}" />
              </div>
            </td>
            <td class="whitespace-nowrap hover:cursor-pointer">
              <div class="flex items-center text-sm text-gray-300 overflow-hidden text-ellipsis">
                <div class="flex flex-col flex-nowrap">
                  <button
                    class="text-sm text-gray-300 overflow-hidden text-ellipsis"
                    title="{containerGroup.type}"
                    on:click="{() => openGroupDetails(containerGroup)}">
                    {containerGroup.name} ({containerGroup.type})
                  </button>
                  <div class="text-xs font-extra-light text-gray-900">
                    {containerGroup.containers.length} container{containerGroup.containers.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="ml-2 text-sm text-gray-700"></div>
              </div>
            </td>
            <td class="whitespace-nowrap pl-4">
              <div class="flex items-center">
                <div class="text-sm text-gray-700"></div>
              </div>
            </td>
            <td
              class="pl-6 text-right whitespace-nowrap rounded-tr-lg"
              class:rounded-br-lg="{!containerGroup.expanded}">
              <!-- Only show POD actions if the container group is POD, otherwise keep blank / empty (for future compose implementation) -->
              {#if containerGroup.type === ContainerGroupInfoTypeUI.POD && containerGroup.engineId && containerGroup.id && containerGroup.shortId && containerGroup.status && containerGroup.engineName && containerGroup.humanCreationDate && containerGroup.created}
                <PodActions
                  pod="{{
                    id: containerGroup.id,
                    shortId: containerGroup.shortId,
                    status: containerGroup.status,
                    name: containerGroup.name,
                    engineId: containerGroup.engineId,
                    engineName: containerGroup.engineName,
                    age: containerGroup.humanCreationDate,
                    created: containerGroup.created,
                    selected: false,
                    containers: containerGroup.containers.map(container => ({
                      Id: container.id,
                      Names: container.name,
                      Status: container.state,
                    })),
                    kind: 'podman',
                  }}"
                  dropdownMenu="{true}" />
              {/if}
              {#if containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE && containerGroup.status && containerGroup.engineId && containerGroup.engineType}
                <ComposeActions
                  compose="{{
                    status: containerGroup.status,
                    name: containerGroup.name,
                    engineId: containerGroup.engineId,
                    engineType: containerGroup.engineType,
                    containers: containerGroup.containers,
                  }}"
                  dropdownMenu="{true}"
                  inProgressCallback="{(containers, flag, state) =>
                    composeGroupInProgressCallback(containerGroup.containers, flag, state)}" />
              {/if}
            </td>
          </tr>
        {/if}
        <!-- Display each container of this group -->
        {#if containerGroup.expanded}
          {#each containerGroup.containers as container, index}
            <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
              <td
                class="{containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE ? 'rounded-tl-lg' : ''} {index ===
                containerGroup.containers.length - 1
                  ? 'rounded-bl-lg'
                  : ''}">
              </td>
              <td class="px-2">
                <Checkbox title="Toggle container" bind:checked="{container.selected}" />
              </td>
              <td class="flex flex-row justify-center h-12">
                <div class="grid place-content-center ml-3 mr-4">
                  <StatusIcon icon="{container.icon}" status="{container.state}" />
                </div>
              </td>
              <td
                class="whitespace-nowrap hover:cursor-pointer group"
                on:click="{() => openDetailsContainer(container)}">
                <div class="flex items-center">
                  <div class="">
                    <div class="flex flex-nowrap">
                      <div
                        class="text-sm text-gray-300 overflow-hidden text-ellipsis group-hover:text-violet-400"
                        title="{container.name}">
                        {container.name}
                      </div>
                    </div>
                    <div class="flex flex-row text-xs font-extra-light text-gray-900">
                      <div>{container.state}</div>
                      <!-- Hide in case of single engines-->
                      {#if multipleEngines}
                        <div
                          class="mx-2 px-2 inline-flex text-xs font-extralight rounded-sm bg-zinc-700 text-slate-400">
                          {container.engineName}
                        </div>
                      {/if}
                      <div class="pl-2 pr-2">{container.displayPort}</div>
                    </div>
                  </div>
                </div>
              </td>
              <!-- Open the container details, TODO: open image details instead? -->
              <td
                class="whitespace-nowrap hover:cursor-pointer group"
                on:click="{() => openDetailsContainer(container)}">
                <div class="flex items-center">
                  <div class="text-sm text-gray-700 overflow-hidden text-ellipsis" title="{container.image}">
                    {container.shortImage}
                  </div>
                </div></td>
              <td class="whitespace-nowrap pl-4">
                <div class="flex items-center">
                  <div class="text-sm text-gray-700">
                    <StateChange state="{container.state}">{container.uptime}</StateChange>
                  </div>
                </div>
              </td>
              <td
                class="pl-6 text-right whitespace-nowrap {containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE
                  ? 'rounded-tr-lg'
                  : ''} {index === containerGroup.containers.length - 1 ? 'rounded-br-lg' : ''}">
                <div class="flex w-full">
                  <div class="flex items-center w-5">
                    {#if container.actionError}
                      <ErrorMessage error="{container.actionError}" icon />
                    {:else}
                      <div>&nbsp;</div>
                    {/if}
                  </div>
                  <div class="text-right w-full">
                    <ContainerActions
                      errorCallback="{error => errorCallback(container, error)}"
                      inProgressCallback="{(flag, state) => inProgressCallback(container, flag, state)}"
                      container="{container}"
                      dropdownMenu="{true}" />
                  </div>
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
      <tr><td class="leading-[8px]">&nbsp;</td></tr>
    {/each}
  </table>

  {#if providerConnections.length === 0}
    <NoContainerEngineEmptyScreen />
  {:else if $filtered.length === 0}
    {#if searchTerm}
      <FilteredEmptyScreen icon="{ContainerIcon}" kind="containers" bind:searchTerm="{searchTerm}" />
    {:else}
      <ContainerEmptyScreen />
    {/if}
  {/if}
</div>
