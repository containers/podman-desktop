<script lang="ts">
    import Fa from 'svelte-fa/src/fa.svelte'
    import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'
    import { faStopCircle } from '@fortawesome/free-solid-svg-icons'
    import { faTrash } from '@fortawesome/free-solid-svg-icons'
    import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
    import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons'
    import { onMount } from "svelte";
    import {filtered, searchPattern} from '../stores/containers';
    import {providerInfos} from '../stores/providers';
import type { ContainerInfo } from '../../../preload/src/api/container-info';
import ContainerIcon from './ContainerIcon.svelte'

interface ContainerInfoUI {
  id: string;
  name: string;
  image: string;
  engine: string;
  state: string;
  port: string;
  hasPublicPort: boolean;
  openingUrl?: string;
}

let openChoiceModal = false
let fromDockerfileModal = false

let dockerImageName = 'my-custom-image'
let dockerImageProviderName = '';
let buildInProgress= false;
let buildFinished = false;

let containers: ContainerInfoUI[] = [];
let searchTerm = '';
$: searchPattern.set(searchTerm);

onMount(async () => {
  filtered.subscribe(value => {
  containers = value.map((containerInfo: ContainerInfo) => {
    return {
      id: containerInfo.Id,
      name: getName(containerInfo),
      image: getImage(containerInfo),
      state: getState(containerInfo),
      engine: getEngine(containerInfo),
      port: getPort(containerInfo),
      hasPublicPort: hasPublicPort(containerInfo),
      openingUrl: getOpeningUrl(containerInfo),
    };
  })});

providerInfos.subscribe(value => {
  if (value.length > 0) {
  dockerImageProviderName = value[0].name;
  }
});

});

function keydownChoice(e: KeyboardEvent) {
    e.stopPropagation()
    if (e.key === 'Escape') {
      toggleCreateContainer();
    }
  }

  function keydownDockerfileChoice(e: KeyboardEvent) {
    e.stopPropagation()
    if (e.key === 'Escape') {
      fromDockerfileModal = false;
    }
  }
  
function toggleCreateContainer(): void {
  openChoiceModal = !openChoiceModal;
}

function fromExistingImage(): void {
  openChoiceModal = false;
  fromDockerfileModal = false;
  window.location.href = '#/images'
}

function fromDockerfile(): void {
  openChoiceModal = false;
  fromDockerfileModal = true;
}

let buildLog = '';

function eventCollect(eventName: string, data: string): void {
  buildLog += `${data}<br/>`;
}

async function buildDockerImage(): Promise<void> {
  buildLog = '';
  buildInProgress = true;
  buildFinished = false;

  const data: any = document.getElementById("dockerImageFolder");
  if (data && data.files && data.files.length > 0) {
    const dockerFilePath = Array.from(data.files).map((item:any) => item?.path).find(itemPath => itemPath.endsWith('Dockerfile'));
    if (dockerFilePath) {

      const rootDirectory = dockerFilePath.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');;
      await window.buildImage(rootDirectory, dockerImageName, eventCollect);
      buildFinished = true;
      window.dispatchEvent(new CustomEvent('image-build', { detail: { name: dockerImageName } }));
    }
  }

}


function getName(containerInfo: ContainerInfo) {
  return containerInfo.Names[0].replace(/^\//, '');
}

function getState(containerInfo: ContainerInfo):string {
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

function openBrowser(containerInfo: ContainerInfoUI): void {
    console.log('opening url', containerInfo.openingUrl);
    window.openExternal(containerInfo.openingUrl);
}

function getEngine(containerInfo: ContainerInfo): string {
  return containerInfo.engine;
}

async function startContainer(containerInfo: ContainerInfoUI) {
  await window.startContainer(containerInfo.engine, containerInfo.id);
  console.log('container started');
}

async function stopContainer(containerInfo: ContainerInfoUI) {
  await window.stopContainer(containerInfo.engine, containerInfo.id);
  console.log('container stopped');
}



</script>


<div class="flex flex-col" >
    
        <div class="min-w-full">
          <div class="flex flex-row">
          <div class="py-5 px-5 lg:w-[35rem] w-[22rem]">
            <div class="flex items-center bg-gray-700 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 ml-2 mr-2 " fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input bind:value={searchTerm} type="text" name="containerSearchName" placeholder="Search...."
                class="w-full py-2 outline-none bg-gray-700">
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
          <table class="min-w-full divide-y divide-gray-800" class:hidden="{containers.length === 0}">
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
            <tbody class="bg-gray-800 divide-y divide-gray-200">
              {#each containers as container}
              <tr>
                <td class="px-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-10 py-3">
                        <!--<Fa class="h-10 w-10 rounded-full {getColorForState(container)}" icon={faBox} />-->
                        <ContainerIcon state="{container.state}"/>
                    </div>
                    <div class="ml-4">
                      <div class="flex flex-row">
                        <div class="text-sm text-gray-200">{container.name}</div>
                        <div class="pl-2 text-sm text-violet-400">{container.image}</div>
                      </div>
                      <div class="flex flex-row text-xs font-extra-light text-gray-500">
                        <div>{container.state}</div>
                        <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-900 text-slate-400">{container.engine}</div>
                        <div class="pl-2 pr-2">{container.port}</div>
                    </div>
                  </div>
                  </div>
                </td>
                <td class="px-6 py-2 whitespace-nowrap">
                  <div class="flex flex-row justify-end">
                    <button title="Open Browser" on:click={() => openBrowser(container)} hidden class:block="{container.state === 'RUNNING' && container.hasPublicPort}" ><Fa class="h-10 w-10 cursor-pointer rounded-full text-3xl text-sky-800" icon={faExternalLinkSquareAlt} /></button>
                    <button title="Start Container" on:click={() => startContainer(container)} hidden class:block="{container.state !== 'RUNNING'}" ><Fa class="h-10 w-10 cursor-pointer rounded-full text-3xl text-sky-800" icon={faPlayCircle} /></button>
                    <button title="Stop Container" on:click={() => stopContainer(container)} hidden class:block="{container.state === 'RUNNING'}" ><Fa class="h-10 w-10 cursor-pointer rounded-full text-3xl text-sky-800" icon={faStopCircle} /></button>
                    <!--<button title="Delete Container"><Fa class="cursor-pointer h-10 w-10 rounded-full text-3xl text-sky-800" icon={faTrash} /></button>-->
                </div>
                </td>
              </tr>
              {/each}
            </tbody>
          </table>
        </div>
  </div>
  <div class="h-full min-w-full flex flex-col" class:hidden="{containers.length > 0}">

    <div class="pf-c-empty-state h-full">
      <div class="pf-c-empty-state__content">
        <i class="fas fa-cubes pf-c-empty-state__icon" aria-hidden="true"></i>
    
        <h1 class="pf-c-title pf-m-lg">No containers</h1>
        <div
          class="pf-c-empty-state__body"
        >No containers</div>
        
      </div>
    </div>

  </div>




{#if openChoiceModal}
<div class="modal z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0" tabindex={0} autofocus on:keydown={keydownChoice}>
  <div class="modal-overlay fixed w-full h-full bg-gray-900 opacity-50"></div>




  <div class="relative px-4 w-full max-w-4xl h-full md:h-auto">
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">

      <section class="text-gray-400 bg-gray-700 body-font border-gray-200 border-2">
        <div class="container px-5 py-24 mx-auto flex flex-wrap">
          <div class="flex flex-wrap -m-4">
            <div class="p-4 lg:w-1/2 md:w-full ">
              <div class="flex border-2 rounded-lg border-gray-800 p-8 sm:flex-row flex-col hover:bg-gray-800 hover:cursor-pointer" on:click="{() => fromDockerfile()}">
                <div class="w-16 h-16 sm:mr-8 sm:mb-0 mb-4 inline-flex items-center justify-center rounded-full bg-gray-800 text-indigo-400 flex-shrink-0">
                  <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-8 h-8" viewBox="0 0 24 24">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h2 class="text-white text-lg title-font font-medium mb-3">From Dockerfile</h2>
                  <p class="leading-relaxed text-base">Build image using a local Dockerfile.</p>
                </div>
              </div>
            </div>
            <div class="p-4 lg:w-1/2 md:w-full">
              <div class="flex border-2 rounded-lg border-gray-800 p-8 sm:flex-row flex-col hover:bg-gray-800 hover:cursor-pointer" on:click="{() => fromExistingImage()}">
                <div class="w-16 h-16 sm:mr-8 sm:mb-0 mb-4 inline-flex items-center justify-center rounded-full bg-gray-800 text-indigo-400 flex-shrink-0">
                  <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-6 h-6" viewBox="0 0 24 24">
                    <circle cx="6" cy="6" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"></path>
                  </svg>
                </div>
                <div class="flex-grow">
                  <h2 class="text-white text-lg title-font font-medium mb-3">From existing image</h2>
                  <p class="leading-relaxed text-base">Use an existing image from the system to build a container.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
</div>


</div>
{/if}




{#if fromDockerfileModal}
<div class="modal z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0" tabindex={0} autofocus on:keydown={keydownDockerfileChoice}>
  <div class="modal-overlay fixed w-full h-full bg-gray-900 opacity-50"></div>



  <div class="relative px-4 w-full max-w-4xl h-full md:h-auto">
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">


      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div class="flex justify-end p-2">
            <button on:click='{() => {fromDockerfileModal = false}}' type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>  
            </button>
        </div>
        <!--<form class="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">-->
          <div class="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
            <h3 class="text-xl font-medium text-gray-900 dark:text-white">Build Image From Dockerfile</h3>
            <button hidden='{!buildFinished}' on:click="{() => fromExistingImage()}" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Done</button>

            <div class="flex w-full h-full text-gray-300">
              {@html buildLog}
              </div>
   
            <div hidden='{buildInProgress}'>
                <label for="dockerImageFolder" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Dockerfile base directory</label>
                <input type="file" webkitdirectory name="dockerImageFolder" id="dockerImageFolder" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required>
            </div>
            <div hidden='{buildInProgress}'>
                <label for="dockerImageName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Image Name</label>
                <input type="text" bind:value={dockerImageName} name="dockerImageName" id="dockerImageName" placeholder="Enter image name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required>
                <label for="dockerImageProviderName" class="py-6 block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Provider
                  <select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" name="providerChoice" bind:value={dockerImageProviderName} >
                    {#each $providerInfos as provider}
                      <option value="{provider.name}">{provider.name}</option>
                    {/each}
                  </select>
                </label>
            </div>


            <button  hidden='{buildInProgress}' on:click="{() => buildDockerImage()}" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Build</button>
       <!-- </form>-->
       </div>
    </div>
    </div>
</div>


</div>
{/if}