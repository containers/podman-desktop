<script lang="ts">
    import Fa from 'svelte-fa/src/fa.svelte'
    import { faBox } from '@fortawesome/free-solid-svg-icons'
    import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'
    import { faStopCircle } from '@fortawesome/free-solid-svg-icons'
    import { faTrash } from '@fortawesome/free-solid-svg-icons'
    import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'

    import { onMount } from "svelte";
    import {filtered, searchPattern} from '../stores/images'
    import {searchPattern as searchPatternContainer} from '../stores/containers'
    import type { ImageInfo } from '../../../preload/src/api/image-info';
    import type { ImageInspectInfo } from '../../../preload/src/api/image-inspect-info';
    import type { ContainerCreateOptions } from '../../../preload/src/api/container-info'

let searchTerm = '';
$: searchPattern.set(searchTerm);
let runContainerFromImageModal = false
let modalImageInspectInfo: ImageInspectInfo;
let modalImageInfo: ImageInfo;

function getName(imageInfo: ImageInfo) {
  // get name
  return imageInfo.RepoTags.map((tag => {
    return tag.split(':')[0];
  })).join(',');

}
let modalContainerName = '';
let modalContainerPortMapping: string[];
let modalExposedPorts = [];

async function runImage(imageInfo: ImageInfo) {
  modalExposedPorts = [];
  modalImageInspectInfo = undefined;
  modalContainerPortMapping = [];
  modalImageInfo = imageInfo;
  const imageInspectInfo = await window.getImageInspect(imageInfo.engine, imageInfo.Id);
  modalImageInspectInfo = imageInspectInfo;
  modalExposedPorts = Array.from(Object.keys(modalImageInspectInfo?.Config?.ExposedPorts || {}));
  modalContainerPortMapping = new Array<string>(modalExposedPorts.length);
  runContainerFromImageModal = true;
}

function toggleCreateContainer(): void {
  runContainerFromImageModal = !runContainerFromImageModal;
}

async function startContainer() {
  console.log('start container', modalContainerPortMapping);
  console.log('start container', modalContainerName);

  // create ExposedPorts objects
  const ExposedPorts = {};

  const PortBindings = {};
  modalExposedPorts.forEach((port, index) => {
    if (modalContainerPortMapping[index]) {
      PortBindings[port] = [{HostPort: modalContainerPortMapping[index]}];
    }
    ExposedPorts[port] = {};
  });

  const Image = modalImageInfo.Id;

  const HostConfig = {
        PortBindings,
    };

  const options: ContainerCreateOptions = {
    Image,
    name: modalContainerName,
    HostConfig,
    ExposedPorts,
  
  }
  console.log('calling create and start with options', options);
  const response = await window.createAndStartContainer(modalImageInspectInfo.engine, options);
  runContainerFromImageModal = false;

  // redirect to containers
  window.location.href = '#/containers';

}

function keydownDockerfileChoice(e: KeyboardEvent) {
    e.stopPropagation()
    if (e.key === 'Escape') {
      runContainerFromImageModal = false;
    }
  }

function getId(imageInfo: ImageInfo) {
  let id = imageInfo.Id;
  if (id.startsWith('sha256:')) {
    id = id.substring('sha256:'.length);
  }
  return id.substring(0, 12);
}

function getTag(imageInfo: ImageInfo) {
  // get name
  return imageInfo.RepoTags.map((tag => {
    return tag.split(':')[1];
  })).join(',');

}

function getSize(imageInfo: ImageInfo) {
  return imageInfo.Size;
}

function getColorForState(imageInfo: ImageInfo): string {
  if (imageInfo.Id === 'running') {
    return 'text-emerald-500'
  }
  return 'text-gray-700';
}

function getEngine(containerInfo: ImageInfo): string {
  return containerInfo.engine;
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
  <!--
  <div class="flex flex-1 justify-end">
  <div class="py-5 px-5">
    <button type="button" on:click="{() => toggleCreateContainer()}" class="text-white bg-violet-700 hover:bg-violet-800 focus:ring-4 focus:ring-violet-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 ">
      <Fa class="h-10 w-8 cursor-pointer rounded-full text-xl text-white" icon={faPlusCircle} />
      Create container
    </button>
  </div>              
</div>
-->
  </div>
          <table class="min-w-full divide-y divide-gray-800">
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
              {#each $filtered as image}
              <tr>
                <td class="px-6 py-2 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="ml-4">
                      <div class="flex flex-row">
                        <div class="text-sm text-gray-200">{getName(image)}</div>
                        <div class="pl-2 text-sm text-violet-400">{getId(image)}</div>
                      </div>
                      <div class="flex flex-row text-xs font-extra-light text-gray-500">
                        <div>{getTag(image)}</div>
                        <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-900 text-slate-400">{getEngine(image)}</div>
                    </div>

                </div>
                <div class="flex flex-row text-xs font-extra-light text-gray-500">
                <!--  <div>{getSize(image)}</div>-->
              </div>

                  </div>
                </td>
                <td class="px-6 py-2 whitespace-nowrap">
                  <div class="flex flex-row justify-end">
                    <button title="Run Image" on:click={() => runImage(image)} ><Fa class="h-10 w-10 cursor-pointer rounded-full text-3xl text-sky-800" icon={faPlayCircle} /></button>
                  <!--  <button title="Start Container" on:click={() => startContainer(image)} hidden class:block="{container?.State !== 'running'}" ><Fa class="h-10 w-10 cursor-pointer rounded-full text-3xl text-sky-800" icon={faPlayCircle} /></button>
                    <button title="Stop Container" on:click={() => stopContainer(image)} hidden class:block="{container?.State === 'running'}" ><Fa class="h-10 w-10 cursor-pointer rounded-full text-3xl text-sky-800" icon={faStopCircle} /></button>
                    <button title="Delete Container"><Fa class="cursor-pointer h-10 w-10 rounded-full text-3xl text-sky-800" icon={faTrash} /></button>
                    -->
                </div>
                </td>
              </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
      <div class="h-full min-w-full flex flex-col" class:hidden="{$filtered.length > 0}">

        <div class="pf-c-empty-state h-full">
          <div class="pf-c-empty-state__content">
            <i class="fas fa-cubes pf-c-empty-state__icon" aria-hidden="true"></i>
        
            <h1 class="pf-c-title pf-m-lg">No images</h1>
            <div
              class="pf-c-empty-state__body"
            >No images</div>
            
          </div>
        </div>
    
      </div>



      {#if runContainerFromImageModal}
      <div class="modal z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0" tabindex={0} autofocus on:keydown={keydownDockerfileChoice}>
        <div class="modal-overlay fixed w-full h-full bg-gray-900 opacity-50"></div>
      
      
      
        <div class="relative px-4 w-full max-w-4xl h-full md:h-auto">
          <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      
      
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div class="flex justify-end p-2">
                  <button on:click='{() => {runContainerFromImageModal = false}}' type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>  
                  </button>
              </div>
              <!--<form class="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">-->
                <div class="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
                  <h3 class="text-xl font-medium text-gray-900 dark:text-white">Create Container {getName(modalImageInfo)}</h3>
         
                  <div>
                      <label for="modalContainerName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Container Name</label>
                      <input type="text" bind:value={modalContainerName} name="modalContainerName" id="modalContainerName" placeholder="Enter container name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required>
                      <!-- add a label for each port-->
                      <label for="modalContainerName" class:hidden="{modalExposedPorts.length === 0}" class="pt-6 block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Port Mapping</label>
                      {#each modalExposedPorts as port, index}
                      <input type="text" bind:value={modalContainerPortMapping[index]} placeholder="Enter value for port {port}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required>
                      {/each}
                  </div>
      
                  
                  <button  on:click="{() => startContainer()}" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Start Container</button>
                  
             <!-- </form>-->
             </div>
          </div>
          </div>
      </div>
      
      
      </div>
      {/if}      