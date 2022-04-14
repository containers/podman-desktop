<script lang="ts">
import { onMount } from 'svelte';
import { filtered, searchPattern } from '../stores/containers';

import type { ContainerInfo } from '../../../preload/src/api/container-info';
import ContainerIcon from './ContainerIcon.svelte';
import { router, Route } from 'tinro';
import ContainerDetails from './ContainerDetails.svelte';
import type { ContainerInfoUI } from './container/ContainerInfoUI';
import ContainerActions from './container/ContainerActions.svelte';
import ContainerEmptyScreen from './container/ContainerEmptyScreen.svelte';

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
    if (containerId && !selectedContainer) {
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

<!--{#if selectedContainer}

<Route path="/" redirect="{`/containers/${selectedContainer.id}/logs`}" />
{/if}
-->
<div class="flex flex-col min-h-full">
  <div class="min-w-full flex-1">
    <div class="flex flex-row">
      <div class="py-5 px-5 lg:w-[35rem] w-[22rem]">
        <div class="flex items-center bg-gray-700 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 ml-2 mr-2 "
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
            placeholder="Search...."
            class="w-full py-2 outline-none bg-gray-700" />
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
    <!--
        <table
  class="pf-c-table pf-m-grid-md"
  role="grid"
  aria-label="This is a simple table example"
  id="table-basic"
>

<svg
  class="pf-c-spinner"
  role="progressbar"
  viewBox="0 0 100 100"
  aria-label="Loading..."
>
  <circle class="pf-c-spinner__path" cx="50" cy="50" r="45" fill="none" />
</svg>
  <caption>This is the table caption</caption>
  <thead>
    <tr role="row">
      <th role="columnheader" scope="col">Repositories</th>
      <th role="columnheader" scope="col">Branches</th>
      <th role="columnheader" scope="col">Pull requests</th>
      <th role="columnheader" scope="col">Workspaces</th>
      <th role="columnheader" scope="col">Last commit</th>
    </tr>
  </thead>

  <tbody role="rowgroup">
    <tr role="row">
      <td role="cell" data-label="Repository name">Repository 1</td>
      <td role="cell" data-label="Branches">10</td>
      <td role="cell" data-label="Pull requests">25</td>
      <td role="cell" data-label="Workspaces">5</td>
      <td role="cell" data-label="Last commit">2 days ago</td>
    </tr>

    <tr role="row">
      <td role="cell" data-label="Repository name">Repository 2</td>
      <td role="cell" data-label="Branches">10</td>
      <td role="cell" data-label="Pull requests">25</td>
      <td role="cell" data-label="Workspaces">5</td>
      <td role="cell" data-label="Last commit">2 days ago</td>
    </tr>

    <tr role="row">
      <td role="cell" data-label="Repository name">Repository 3</td>
      <td role="cell" data-label="Branches">10</td>
      <td role="cell" data-label="Pull requests">25</td>
      <td role="cell" data-label="Workspaces">5</td>
      <td role="cell" data-label="Last commit">2 days ago</td>
    </tr>

    <tr role="row">
      <td role="cell" data-label="Repository name">Repository 4</td>
      <td role="cell" data-label="Branches">10</td>
      <td role="cell" data-label="Pull requests">25</td>
      <td role="cell" data-label="Workspaces">5</td>
      <td role="cell" data-label="Last commit">2 days ago</td>
    </tr>
  </tbody>
</table>
-->
    <div class="min-w-full h-[calc(100%_-_5.5rem)] flex flex-row">
      <table
        class="divide-y divide-gray-800 h-2 flex-1 border-t border-t-zinc-700"
        class:min-w-full="{!isExpanded}"
        class:w-100="{isExpanded}"
        class:hidden="{containers.length === 0}">
        <!--<thead class="bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ports</th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Edit</span>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engine</th>
              </tr>
            </thead>-->
        <tbody class="bg-zinc-800 divide-y divide-zinc-700">
          {#each containers as container}
            <tr class="group h-16 hover:bg-zinc-700">
              <td
                class="px-4 whitespace-nowrap hover:cursor-pointer"
                on:click="{() => expandContainerSelection(container)}">
                <div class="flex items-center">
                  <div class="flex-shrink-0 w-10 py-3">
                    <!--<Fa class="h-10 w-10 rounded-full {getColorForState(container)}" icon={faBox} />-->
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
                      <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-900 text-slate-400">
                        {container.engineName}
                      </div>
                      <div class="pl-2 pr-2">{container.port}</div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-2 whitespace-nowrap" class:hidden="{isExpanded}">
                <div class=" flex-row justify-end hidden group-hover:flex ">
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
  <div class="pf-c-backdrop">
    <div class="pf-l-bullseye">
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
            <li>Create a container from a ContainerFile description. Browse a local content description.</li>
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
    </div>
  </div>
{/if}
