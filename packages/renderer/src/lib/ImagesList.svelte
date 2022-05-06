<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';

import { filtered, searchPattern } from '../stores/images';
import type { ImageInfo } from '../../../preload/src/api/image-info';
import type { ImageInspectInfo } from '../../../preload/src/api/image-inspect-info';
import type { ContainerCreateOptions } from '../../../preload/src/api/container-info';
import { onMount } from 'svelte';
import ImageEmptyScreen from './image/ImageEmptyScreen.svelte';
import moment from 'moment';
import filesize from 'filesize';
import { router } from 'tinro';

const buttonStyle = 'p-1 mx-1 shadow-md shadow-gray-900  hover:bg-gray-700';
const iconStyle = 'p-1 h-7 w-7 cursor-pointer rounded-full text-3xl text-violet-500 hover:text-violet-600';

let searchTerm = '';
$: searchPattern.set(searchTerm);

interface ImageInfoUI {
  id: string;
  shortId: string;
  name: string;
  engineId: string;
  engineName: string;
  tag: string;
  humanCreationDate: string;
  humanSize: string;
}
let images: ImageInfoUI[] = [];

function getPort(portDescriptor: string): Promise<number | undefined> {
  let port: number;
  if (portDescriptor.endsWith('/tcp')) {
    port = parseInt(portDescriptor.substring(0, portDescriptor.length - 4));
  } else {
    port = parseInt(portDescriptor);
  }
  // invalid port
  if (port === NaN) {
    return Promise.resolve(undefined);
  }
  return window.getFreePort(port);
}

onMount(async () => {
  filtered.subscribe(value => {
    images = value.map((imageInfo: ImageInfo) => {
      return {
        id: imageInfo.Id,
        shortId: getShortId(imageInfo.Id),
        humanCreationDate: getHumanDate(imageInfo.Created),
        humanSize: getHumanSize(imageInfo.Size),
        name: getName(imageInfo),
        engineId: getEngineId(imageInfo),
        engineName: getEngineName(imageInfo),
        tag: getTag(imageInfo),
      };
    });
  });
});

let runContainerFromImageModal = false;
let modalImageInspectInfo: ImageInspectInfo;
let modalImageInfo: ImageInfoUI;

// extract SHA256 from image id and take the first 12 digits
function getShortId(id: string): string {
  if (id.startsWith('sha256:')) {
    id = id.substring('sha256:'.length);
  }
  return id.substring(0, 12);
}

function gotoBuildImage(): void {
  router.goto('/images/build');
}

function getHumanSize(size: number): string {
  return filesize(size);
}

function getHumanDate(date: number): string {
  return moment(date * 1000).fromNow();
}

function getName(imageInfo: ImageInfo) {
  // get name
  if (!imageInfo.RepoTags) {
    return '<none>';
  }
  return imageInfo.RepoTags.map(tag => {
    return tag.split(':')[0];
  }).join(',');
}
let modalContainerName = '';
let modalContainerPortMapping: string[];
let modalExposedPorts = [];

async function runImage(imageInfo: ImageInfoUI) {
  modalExposedPorts = [];
  modalImageInspectInfo = undefined;
  modalContainerPortMapping = [];
  modalImageInfo = imageInfo;
  const imageInspectInfo = await window.getImageInspect(imageInfo.engineId, imageInfo.id);
  modalImageInspectInfo = imageInspectInfo;
  modalExposedPorts = Array.from(Object.keys(modalImageInspectInfo?.Config?.ExposedPorts || {}));

  // auto-assign ports from available free port
  modalContainerPortMapping = new Array<string>(modalExposedPorts.length);
  await Promise.all(
    modalExposedPorts.map(async (port, index) => {
      const localPort = await getPort(port);
      modalContainerPortMapping[index] = `${localPort}`;
    }),
  );
  runContainerFromImageModal = true;
}

async function startContainer() {
  console.log('start container', modalContainerPortMapping);
  console.log('start container', modalContainerName);

  // create ExposedPorts objects
  const ExposedPorts = {};

  const PortBindings = {};
  modalExposedPorts.forEach((port, index) => {
    if (modalContainerPortMapping[index]) {
      PortBindings[port] = [{ HostPort: modalContainerPortMapping[index] }];
    }
    ExposedPorts[port] = {};
  });

  const Image = modalImageInfo.id;

  const HostConfig = {
    PortBindings,
  };

  const options: ContainerCreateOptions = {
    Image,
    name: modalContainerName,
    HostConfig,
    ExposedPorts,
  };
  console.log('calling create and start with options', options);
  const response = await window.createAndStartContainer(modalImageInspectInfo.engineId, options);
  runContainerFromImageModal = false;

  // redirect to containers
  window.location.href = '#/containers';
}

function keydownDockerfileChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    runContainerFromImageModal = false;
  }
}

function getTag(imageInfo: ImageInfo) {
  if (!imageInfo.RepoTags) {
    return '<none>';
  }
  return imageInfo.RepoTags.map(tag => {
    return tag.split(':')[1];
  }).join(',');
}

function getEngineId(containerInfo: ImageInfo): string {
  return containerInfo.engineId;
}

function getEngineName(containerInfo: ImageInfo): string {
  return containerInfo.engineName;
}
</script>

<div class="flex flex-col">
  <div class="min-w-full">
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
          <button on:click="{() => gotoBuildImage()}" class="pf-c-button pf-m-primary" type="button">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-cube" aria-hidden="true"></i>
            </span>
            Build Image
          </button>
        </div>
      </div>
    </div>
    <table class="min-w-full divide-y divide-gray-800 border-t border-t-zinc-700">
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
        {#each images as image}
          <tr class="group hover:cursor-pointer hover:bg-zinc-700">
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="ml-4">
                  <div class="flex flex-row">
                    <div class="text-sm text-gray-200">{image.name}</div>
                    <div class="pl-2 text-sm text-violet-400">{image.shortId}</div>
                  </div>
                  <div class="flex flex-row text-xs font-extra-light text-gray-500">
                    <div>{image.tag}</div>
                    <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-900 text-slate-400">
                      {image.engineName}
                    </div>
                  </div>
                </div>
                <div class="flex flex-row text-xs font-extra-light text-gray-500">
                  <!--  <div>{getSize(image)}</div>-->
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="ml-2 text-sm text-gray-200">{image.humanCreationDate}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex">
                <div class="w-full text-right text-sm text-gray-200">{image.humanSize}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap">
              <div class="hidden group-hover:flex flex-row justify-end">
                <button class="{buttonStyle}" title="Run Image" on:click="{() => runImage(image)}"
                  ><Fa class="{iconStyle}" icon="{faPlayCircle}" /></button>
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
<ImageEmptyScreen images="{$filtered}" />

{#if runContainerFromImageModal}
  <div
    class="modal z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0"
    tabindex="{0}"
    autofocus
    on:keydown="{keydownDockerfileChoice}">
    <div class="modal-overlay fixed w-full h-full bg-gray-900 opacity-50"></div>

    <div class="relative px-4 w-full max-w-4xl h-full md:h-auto">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div class="flex justify-end p-2">
            <button
              on:click="{() => {
                runContainerFromImageModal = false;
              }}"
              type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              data-modal-toggle="authentication-modal">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"></path
                ></svg>
            </button>
          </div>
          <!--<form class="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">-->
          <div class="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
            <h3 class="text-xl font-medium text-gray-900 dark:text-white">
              Create container from image {modalImageInfo.name}
            </h3>

            <div>
              <label for="modalContainerName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >Container Name</label>
              <input
                type="text"
                bind:value="{modalContainerName}"
                name="modalContainerName"
                id="modalContainerName"
                placeholder="Enter container name (leave blank to have one generated)"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                required />
              <!-- add a label for each port-->
              <label
                for="modalContainerName"
                class:hidden="{modalExposedPorts.length === 0}"
                class="pt-6 block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Port Mapping</label>
              {#each modalExposedPorts as port, index}
                <div class="flex flex-row justify-center items-center w-full">
                  <span class="flex-1 inline-block align-middle whitespace-nowrap">Local port for {port}:</span>

                  <input
                    type="text"
                    bind:value="{modalContainerPortMapping[index]}"
                    placeholder="Enter value for port {port}"
                    class="bg-gray-50 border ml-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    required />
                </div>
              {/each}
            </div>

            <button on:click="{() => startContainer()}" class="w-full pf-c-button pf-m-primary">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-play" aria-hidden="true"></i>
              </span>
              Start Container</button>

            <!-- </form>-->
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
