<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import type { ImageInspectInfo } from '../../../../main/src/plugin/api/image-inspect-info';
import type { ContainerCreateOptions } from '../../../../main/src/plugin/api/container-info';
import { onMount } from 'svelte';
import Modal from '../dialogs/Modal.svelte';

export let image: ImageInfoUI;
export let closeCallback: () => void;

let imageInspectInfo: ImageInspectInfo;

let containerName = '';
let containerPortMapping: string[];
let exposedPorts = [];
let dataReady = false;

let imageDisplayName = '';

onMount(async () => {
  exposedPorts = [];
  containerPortMapping = [];
  imageInspectInfo = await window.getImageInspect(image.engineId, image.id);
  exposedPorts = Array.from(Object.keys(imageInspectInfo?.Config?.ExposedPorts || {}));

  // auto-assign ports from available free port
  containerPortMapping = new Array<string>(exposedPorts.length);
  await Promise.all(
    exposedPorts.map(async (port, index) => {
      const localPort = await getPort(port);
      containerPortMapping[index] = `${localPort}`;
    }),
  );
  dataReady = true;

  if (image.name && image.name.length > 20) {
    imageDisplayName = '...' + image.name.substring(image.name.length - 20);
  } else {
    imageDisplayName = image.name;
  }
});

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

function keydownDockerfileChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    closeCallback();
  }
}

async function startContainer() {
  // create ExposedPorts objects
  const ExposedPorts = {};

  const PortBindings = {};
  exposedPorts.forEach((port, index) => {
    if (containerPortMapping[index]) {
      PortBindings[port] = [{ HostPort: containerPortMapping[index] }];
    }
    ExposedPorts[port] = {};
  });

  const Image = image.id;

  const HostConfig = {
    PortBindings,
  };

  const options: ContainerCreateOptions = {
    Image,
    name: containerName,
    HostConfig,
    ExposedPorts,
  };
  await window.createAndStartContainer(imageInspectInfo.engineId, options);
  closeCallback();

  // redirect to containers
  window.location.href = '#/containers';
}
</script>

{#if dataReady}
  <Modal
    on:close="{() => {
      closeCallback();
    }}">
    <!-- svelte-ignore a11y-autofocus -->
    <div
      class="modal z-50 w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0"
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
                  closeCallback();
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
            <div class="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white truncate">
                Create container from image {imageDisplayName}
              </h3>

              <div>
                <label for="modalContainerName" class="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
                  >Container Name</label>
                <input
                  type="text"
                  bind:value="{containerName}"
                  name="modalContainerName"
                  id="modalContainerName"
                  placeholder="Enter container name (leave blank to have one generated)"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  required />
                <!-- add a label for each port-->
                <label
                  for="modalContainerName"
                  class:hidden="{exposedPorts.length === 0}"
                  class="pt-6 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">Port Mapping</label>
                {#each exposedPorts as port, index}
                  <div class="flex flex-row justify-center items-center w-full">
                    <span class="flex-1 inline-block align-middle whitespace-nowrap">Local port for {port}:</span>

                    <input
                      type="text"
                      bind:value="{containerPortMapping[index]}"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
{/if}
