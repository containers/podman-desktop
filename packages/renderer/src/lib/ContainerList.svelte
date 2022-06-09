<script lang="ts">
import { onMount } from 'svelte';
import { filtered, searchPattern } from '../stores/containers';

import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';
import ContainerIcon from './ContainerIcon.svelte';
import { router } from 'tinro';
import ContainerDetails from './ContainerDetails.svelte';
import type { ContainerInfoUI } from './container/ContainerInfoUI';
import ContainerActions from './container/ContainerActions.svelte';
import ContainerEmptyScreen from './container/ContainerEmptyScreen.svelte';
import Modal from './dialogs/Modal.svelte';

let openChoiceModal = false;

let isExpanded = false;
let selectedContainer: ContainerInfoUI | undefined;

let containers: ContainerInfoUI[] = [];
let searchTerm = '';
$: searchPattern.set(searchTerm);

// track if need to expand the details if someone wants details
router.subscribe(route => {
  if (route.path && route.path.startsWith('/containers/')) {
    const containerId = route.path.split('/')[2];
    if (!containerId) {
      selectedContainer = undefined;
    } else if (containerId && !selectedContainer) {
      selectedContainer = containers.find(container => container.id === containerId);
      isExpanded = true;
    }
  }
});

$: {
  // need to update the detail container when list is changing
  if (selectedContainer) {
    const containerInNewList = containers.find(c => c.id === selectedContainer.id);
    if (containerInNewList) {
      selectedContainer = containerInNewList;
    }
  }
}

function fromExistingImage(): void {
  openChoiceModal = false;
  window.location.href = '#/images';
}

let multipleEngines = false;

onMount(async () => {
  filtered.subscribe(value => {
    containers = value.map((containerInfo: ContainerInfo) => {
      return {
        id: containerInfo.Id,
        shortId: containerInfo.Id.substring(0, 8),
        name: getName(containerInfo),
        image: getImage(containerInfo),
        state: getState(containerInfo),
        engineId: getEngineId(containerInfo),
        engineName: getEngineName(containerInfo),
        command: containerInfo.Command,
        port: getPort(containerInfo),
        hasPublicPort: hasPublicPort(containerInfo),
        openingUrl: getOpeningUrl(containerInfo),
      };
    });

    // multiple engines ?
    const engineNamesArray = containers.map(container => container.engineName);
    // remove duplicates
    const engineNames = [...new Set(engineNamesArray)];
    if (engineNames.length > 1) {
      multipleEngines = true;
    } else {
      multipleEngines = false;
    }
  });
});

function expandContainerSelection(container: ContainerInfoUI) {
  if (selectedContainer?.name === container.name) {
    selectedContainer = undefined;
    isExpanded = false;
    return;
  }
  isExpanded = true;
  router.goto(`/containers/${container.id}/logs`);
  selectedContainer = container;
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

function getName(containerInfo: ContainerInfo) {
  return containerInfo.Names[0].replace(/^\//, '');
}

function getState(containerInfo: ContainerInfo): string {
  return (containerInfo.State || '').toUpperCase();
}

function getImage(containerInfo: ContainerInfo): string {
  return containerInfo.Image;
}

function getPort(containerInfo: ContainerInfo): string {
  const ports = containerInfo.Ports?.filter(port => port.PublicPort).map(port => port.PublicPort);

  if (ports && ports.length > 1) {
    return `PORTS: ${ports.join(', ')}`;
  } else if (ports && ports.length === 1) {
    return `PORT: ${ports[0]}`;
  } else {
    return '';
  }
}

function hasPublicPort(containerInfo: ContainerInfo): boolean {
  const publicPorts = containerInfo.Ports?.filter(port => port.PublicPort).map(port => port.PublicPort);

  return publicPorts.length > 0;
}

function getOpeningUrl(containerInfo: ContainerInfo): string {
  const ports = containerInfo.Ports?.filter(port => port.PublicPort).map(port => port.PublicPort);
  if (ports && ports.length > 0) {
    return `http://localhost:${ports[0]}`;
  } else {
    return '';
  }
}

function getEngineId(containerInfo: ContainerInfo): string {
  return containerInfo.engineId;
}

function getEngineName(containerInfo: ContainerInfo): string {
  return containerInfo.engineName;
}
</script>

<div class="flex flex-col min-h-full">
  <div class="min-w-full flex-1">
    <div class="flex">
      <div class="pt-5 px-5">
        <p class="text-xl">Containers</p>
        <p class="text-sm text-gray-400">
          Hover over a container to view action buttons; click to open up full details.
        </p>
      </div>
    </div>
    <div class="flex flex-row">
      <div class="pt-2 px-5 lg:w-[35rem] w-[22rem]">
        <div class="flex items-center bg-gray-700 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 ml-2 mr-2 "
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            bind:value="{searchTerm}"
            type="text"
            name="containerSearchName"
            placeholder="Search containers...."
            class="w-full py-2 outline-none text-sm bg-gray-700" />
        </div>
      </div>
      <div class="flex flex-1 justify-end">
        <div class="py-5 px-5">
          <button on:click="{() => toggleCreateContainer()}" class="pf-c-button pf-m-primary" type="button">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-plus-circle" aria-hidden="true"></i>
            </span>
            Create container
          </button>
        </div>
      </div>
    </div>
    <div class="min-w-full h-[calc(100%_-_5.5rem)] flex flex-row">
      <table
        class="divide-y divide-gray-800 h-2 flex-1 border-t border-t-zinc-700"
        class:min-w-full="{!isExpanded}"
        class:w-100="{isExpanded}"
        class:hidden="{containers.length === 0}">
        <tbody class="bg-zinc-800 divide-y divide-zinc-700">
          {#each containers as container}
            <tr class="group h-12 hover:bg-zinc-700">
              <td
                class="px-4 whitespace-nowrap hover:cursor-pointer"
                on:click="{() => expandContainerSelection(container)}">
                <div class="flex items-center">
                  <div class="flex-shrink-0 w-3 py-3">
                    <ContainerIcon state="{container.state}" />
                  </div>
                  <div class="ml-4">
                    <div class="flex flex-nowrap">
                      <div
                        class="text-sm text-gray-200 overflow-hidden text-ellipsis"
                        class:w-24="{isExpanded}"
                        title="{container.name}">
                        {container.name}
                      </div>
                      <div
                        class="pl-2 text-sm text-violet-400 overflow-hidden text-ellipsis"
                        class:w-24="{isExpanded}"
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
              <td class="px-6 whitespace-nowrap" class:hidden="{isExpanded}">
                <div class="flex-row justify-end hidden group-hover:flex ">
                  <ContainerActions container="{container}" />
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if selectedContainer}
        <ContainerDetails container="{selectedContainer}" />
      {/if}
      <ContainerEmptyScreen containers="{$filtered}" />
    </div>
  </div>
</div>

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
