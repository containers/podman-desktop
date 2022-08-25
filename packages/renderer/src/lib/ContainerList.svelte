<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { filtered, searchPattern } from '../stores/containers';

import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';
import ContainerIcon from './ContainerIcon.svelte';
import { router } from 'tinro';
import { ContainerGroupInfoTypeUI, ContainerGroupInfoUI, ContainerInfoUI } from './container/ContainerInfoUI';
import ContainerActions from './container/ContainerActions.svelte';
import ContainerEmptyScreen from './container/ContainerEmptyScreen.svelte';
import Modal from './dialogs/Modal.svelte';
import { ContainerUtils } from './container/container-utils';
import { providerInfos } from '../stores/providers';
import NoContainerEngineEmptyScreen from './image/NoContainerEngineEmptyScreen.svelte';
import moment from 'moment';
import type { Unsubscriber } from 'svelte/store';
import NavPage from './ui/NavPage.svelte';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import ContainerGroupIcon from './container/ContainerGroupIcon.svelte';

const containerUtils = new ContainerUtils();
let openChoiceModal = false;

// groups of containers that will be displayed
let containerGroups: ContainerGroupInfoUI[] = [];
let searchTerm = '';
$: searchPattern.set(searchTerm);

function fromExistingImage(): void {
  openChoiceModal = false;
  window.location.href = '#/images';
}

let multipleEngines = false;

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

// number of selected items in the list
$: selectedItemsNumber =
  containerGroups.reduce(
    (previous, current) => previous + current.containers.filter(container => container.selected).length,
    0,
  ) + containerGroups.filter(group => group.selected).length;

// do we need to unselect all checkboxes if we don't have all items being selected ?
$: selectedAllCheckboxes =
  containerGroups.filter(group => group.type !== ContainerGroupInfoTypeUI.STANDALONE).every(group => group.selected) &&
  containerGroups
    .map(group => group.containers)
    .flat()
    .every(container => container.selected);

let refreshTimeouts: NodeJS.Timeout[] = [];

const SECOND = 1000;
function refreshUptime() {
  containerGroups = containerGroups.map(containerGroupUiInfo => {
    containerGroupUiInfo.containers = containerGroupUiInfo.containers.map(containerUiInfo => {
      return { ...containerUiInfo, uptime: containerUtils.refreshUptime(containerUiInfo) };
    });
    return containerGroupUiInfo;
  });

  // compute new interval
  const newInterval = computeInterval();
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;
  refreshTimeouts.push(setTimeout(refreshUptime, newInterval));
}

function computeInterval(): number {
  const allContainers = containerGroups.map(group => group.containers).flat();
  // no container running, no refresh
  if (!allContainers.some(container => container.state === 'RUNNING')) {
    return -1;
  }

  // limit to containers running
  const runningContainers = allContainers.filter(container => container.state === 'RUNNING');

  // do we have containers that have been started in less than 1 minute
  // if so, need to update every second
  const containersStartedInLessThan1Mn = runningContainers.filter(
    container => moment().diff(container.startedAt, 'minutes') < 1,
  );
  if (containersStartedInLessThan1Mn.length > 0) {
    return 2 * SECOND;
  }

  // every minute for containers started less than 1 hour
  const containersStartedInLessThan1Hour = runningContainers.filter(
    container => moment().diff(container.startedAt, 'hours') < 1,
  );
  if (containersStartedInLessThan1Hour.length > 0) {
    // every minute
    return 60 * SECOND;
  }

  // every hour for containers started less than 1 day
  const containersStartedInLessThan1Day = runningContainers.filter(
    container => moment().diff(container.startedAt, 'days') < 1,
  );
  if (containersStartedInLessThan1Day.length > 0) {
    // every hour
    return 60 * 60 * SECOND;
  }

  // every day
  return 60 * 60 * 24 * SECOND;
}

function toggleCheckboxContainerGroup(value: boolean, containerGroup: ContainerGroupInfoUI) {
  // need to apply that on all containers
  containerGroup.containers.forEach(container => (container.selected = value));
}

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedContainers() {
  const selectedContainers = containerGroups
    .map(group => group.containers)
    .flat()
    .filter(container => container.selected);

  if (selectedContainers.length > 0) {
    bulkDeleteInProgress = true;
    await Promise.all(
      selectedContainers.map(async container => {
        try {
          await window.deleteContainer(container.engineId, container.id);
        } catch (e) {
          console.log('error while removing container', e);
        }
      }),
    );
    bulkDeleteInProgress = false;
  }
}

let containersUnsubscribe: Unsubscriber;
onMount(async () => {
  containersUnsubscribe = filtered.subscribe(value => {
    const currentContainers = value.map((containerInfo: ContainerInfo) => {
      return containerUtils.getContainerInfoUI(containerInfo);
    });

    // multiple engines ?
    const engineNamesArray = currentContainers.map(container => container.engineName);
    // remove duplicates
    const engineNames = [...new Set(engineNamesArray)];
    if (engineNames.length > 1) {
      multipleEngines = true;
    } else {
      multipleEngines = false;
    }

    // create groups
    const computedContainerGroups = containerUtils.getContainerGroups(currentContainers);

    // update selected items based on current selected items
    computedContainerGroups.forEach(group => {
      const matchingGroup = containerGroups.find(currentGroup => currentGroup.name === group.name);
      if (matchingGroup) {
        group.selected = matchingGroup.selected;
        group.containers.forEach(container => {
          const matchingContainer = matchingGroup.containers.find(
            currentContainer => currentContainer.id === container.id,
          );
          if (matchingContainer) {
            container.selected = matchingContainer.selected;
          }
        });
      }
    });

    // update the value
    containerGroups = computedContainerGroups;

    // compute refresh interval
    const interval = computeInterval();
    refreshTimeouts.push(setTimeout(refreshUptime, interval));
  });
});

onDestroy(() => {
  // kill timers
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;

  // unsubscribe from the store
  if (containersUnsubscribe) {
    containersUnsubscribe();
  }
});

function openDetailsContainer(container: ContainerInfoUI) {
  router.goto(`/containers/${container.id}/logs`);
}

function keydownChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    toggleCreateContainer();
  }
}

function toggleCreateContainer(): void {
  openChoiceModal = !openChoiceModal;
}

function fromDockerfile(): void {
  openChoiceModal = false;
  router.goto('/images/build');
}

function toggleContainerGroup(containerGroup: ContainerGroupInfoUI) {
  containerGroup.expanded = !containerGroup.expanded;
  // update the group expanded attribute if this is the matching group
  containerGroups = containerGroups.map(group => (group.name === containerGroup.name ? containerGroup : group));
}

function toggleAllContainerGroups(value: boolean) {
  const toggleContainers = containerGroups;
  toggleContainers
    .filter(group => group.type !== ContainerGroupInfoTypeUI.STANDALONE)
    .forEach(group => (group.selected = value));
  toggleContainers.forEach(group => group.containers.forEach(container => (container.selected = value)));
  containerGroups = toggleContainers;
}
</script>

<NavPage
  bind:searchTerm
  title="containers"
  subtitle="Hover over a container to view action buttons; click to open up full details.">
  <button
    slot="additional-actions"
    on:click="{() => toggleCreateContainer()}"
    class="pf-c-button pf-m-primary"
    type="button">
    <span class="pf-c-button__icon pf-m-start">
      <i class="fas fa-plus-circle" aria-hidden="true"></i>
    </span>
    Create container
  </button>
  <div slot="bottom-additional-actions" class="flex flex-row justify-start items-center w-full">
    {#if selectedItemsNumber > 0}
      <button
        class="pf-c-button pf-m-primary"
        on:click="{() => deleteSelectedContainers()}"
        title="Delete {selectedItemsNumber} selected items"
        type="button">
        <span class="pf-c-button__icon pf-m-start">
          {#if bulkDeleteInProgress}
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
            <i class="fas fa-trash" aria-hidden="true"></i>
          {/if}
        </span>
      </button>
      <span class="pl-2">On {selectedItemsNumber} selected items.</span>
    {/if}
  </div>

  <div class="min-w-full flex" slot="table">
    <table class="mx-5 w-full" class:hidden="{containerGroups.length === 0}">
      <!-- title -->
      <thead>
        <tr class="h-7 uppercase text-xs text-gray-500">
          <th class="whitespace-nowrap w-5"></th>
          <th class="px-2 w-5"
            ><input
              type="checkbox"
              indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
              bind:checked="{selectedAllCheckboxes}"
              on:click="{event => toggleAllContainerGroups(event.currentTarget.checked)}"
              class="cursor-pointer invert hue-rotate-[218deg] brightness-75" /></th>
          <th class="text-center font-extrabold w-10">Status</th>
          <th>Name</th>
          <th class="text-center">started</th>
          <th class="text-center">actions</th>
        </tr>
      </thead>

      <!-- Display each group -->
      {#each containerGroups as containerGroup}
        <tbody>
          {#if containerGroup.type === ContainerGroupInfoTypeUI.COMPOSE}
            <tr class="h-10 group">
              <td
                class="bg-zinc-900 group-hover:bg-zinc-700 pl-2 w-3 rounded-tl-lg"
                class:rounded-bl-lg="{!containerGroup.expanded}"
                on:click="{() => toggleContainerGroup(containerGroup)}">
                <Fa
                  size="12"
                  class="text-gray-400 cursor-pointer"
                  icon="{containerGroup.expanded ? faChevronDown : faChevronRight}" />
              </td>
              <td class="px-2 w-5 bg-zinc-900 group-hover:bg-zinc-700">
                <input
                  type="checkbox"
                  on:click="{event => toggleCheckboxContainerGroup(event.currentTarget.checked, containerGroup)}"
                  bind:checked="{containerGroup.selected}"
                  class=" cursor-pointer invert hue-rotate-[218deg] brightness-75" />
              </td>
              <td
                class="bg-zinc-900 group-hover:bg-zinc-700 flex flex-row justify-center h-12"
                title="{containerGroup.type}">
                <ContainerGroupIcon type="{containerGroup.type}" containers="{containerGroup.containers}" />
              </td>
              <td
                colspan="4"
                class="bg-zinc-900 group-hover:bg-zinc-700 rounded-tr-lg {!containerGroup.expanded
                  ? 'rounded-br-lg'
                  : ''}">
                <div class="flex items-center text-sm text-gray-200 overflow-hidden text-ellipsis">
                  <div class="flex flex-col flex-nowrap">
                    <div class="text-sm text-gray-200 overflow-hidden text-ellipsis" title="Compose">
                      {containerGroup.name} (compose)
                    </div>
                    <div class="text-xs font-extra-light text-gray-500">
                      {containerGroup.containers.length} containers
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          {/if}
          <!-- Display each container of this group -->
          {#if containerGroup.expanded}
            {#each containerGroup.containers as container, index}
              <tr class="group h-12 bg-zinc-900 hover:bg-zinc-700">
                <td
                  class="{containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE ? 'rounded-tl-lg' : ''} {index ===
                  containerGroup.containers.length - 1
                    ? 'rounded-bl-lg'
                    : ''}">
                </td>
                <td class="px-2">
                  <input
                    type="checkbox"
                    bind:checked="{container.selected}"
                    class="cursor-pointer invert hue-rotate-[218deg] brightness-75" />
                </td>
                <td class="flex flex-row justify-center h-12">
                  <ContainerIcon state="{container.state}" />
                </td>
                <td class="whitespace-nowrap hover:cursor-pointer" on:click="{() => openDetailsContainer(container)}">
                  <div class="flex items-center">
                    <div class="">
                      <div class="flex flex-nowrap">
                        <div class="text-sm text-gray-200 overflow-hidden text-ellipsis" title="{container.name}">
                          {container.name}
                        </div>
                        <div
                          class="pl-2 text-sm text-violet-400 overflow-hidden text-ellipsis"
                          title="{container.image}">
                          {container.image}
                        </div>
                      </div>
                      <div class="flex flex-row text-xs font-extra-light text-gray-500">
                        <div>{container.state}</div>
                        <!-- Hide in case of single engines-->
                        {#if multipleEngines}
                          <div
                            class="mx-2 px-2 inline-flex text-xs font-extralight rounded-sm bg-zinc-700 text-slate-400">
                            {container.engineName}
                          </div>
                        {/if}
                        <div class="pl-2 pr-2">{container.port}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-2 whitespace-nowrap w-10">
                  <div class="flex items-center">
                    <div class="ml-2 text-sm text-gray-400">{container.uptime}</div>
                  </div>
                </td>
                <td
                  class="px-6 whitespace-nowrap {containerGroup.type === ContainerGroupInfoTypeUI.STANDALONE
                    ? 'rounded-tr-lg'
                    : ''} {index === containerGroup.containers.length - 1 ? 'rounded-br-lg' : ''}">
                  <div class="flex flex-row justify-end opacity-0 group-hover:opacity-100 ">
                    <ContainerActions container="{container}" />
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
        <tr><td class="leading-[8px]">&nbsp;</td></tr>
      {/each}
    </table>
  </div>

  <div slot="empty" class="min-h-full">
    {#if providerConnections.length > 0}
      <ContainerEmptyScreen slot="empty" containers="{$filtered}" />
    {:else}
      <NoContainerEngineEmptyScreen slot="empty" />
    {/if}
  </div>
</NavPage>

{#if openChoiceModal}
  <Modal
    on:close="{() => {
      openChoiceModal = false;
    }}">
    <div
      class="pf-c-modal-box pf-m-sm modal z-50 "
      tabindex="{0}"
      autofocus
      aria-modal="true"
      on:keydown="{keydownChoice}"
      aria-labelledby="modal-title-modal-basic-example-modal"
      aria-describedby="modal-description-modal-basic-example-modal">
      <button
        class="pf-c-button pf-m-plain"
        type="button"
        aria-label="Close dialog"
        on:click="{() => toggleCreateContainer()}">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
      <header class="pf-c-modal-box__header" on:keydown="{keydownChoice}">
        <h1 class="pf-c-modal-box__title">Create a new container</h1>
      </header>
      <div class="pf-c-modal-box__body">
        <ul class="list-disc">
          <li>Create a container from a Containerfile description. Browse a local content description.</li>
          <li>Or create a container from an existing image stored in the local registry.</li>
        </ul>
      </div>
      <footer class="pf-c-modal-box__footer">
        <button class="pf-c-button pf-m-primary" type="button" on:click="{() => fromDockerfile()}"
          >From Containerfile/Dockerfile</button>
        <button class="pf-c-button pf-m-secondary" type="button" on:click="{() => fromExistingImage()}"
          >From existing image</button>
      </footer>
    </div>
  </Modal>
{/if}
