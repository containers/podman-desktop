<script lang="ts">
import { runImageInfo } from '../../stores/run-image-store';
import { onMount } from 'svelte';
import type { ContainerCreateOptions } from '../../../../main/src/plugin/api/container-info';
import type { ImageInspectInfo } from '../../../../main/src/plugin/api/image-inspect-info';
import NavPage from '../ui/NavPage.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

let image: ImageInfoUI;

let imageInspectInfo: ImageInspectInfo;

let containerName = '';
let containerPortMapping: string[];
let exposedPorts = [];
let dataReady = false;

let imageDisplayName = '';

onMount(async () => {
  runImageInfo.subscribe(async value => {
    exposedPorts = [];
    containerPortMapping = [];
    image = value;

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
    if (image.name && image.name.length > 60) {
      imageDisplayName = '...' + image.name.substring(image.name.length - 60);
    } else {
      imageDisplayName = image.name;
    }
  });
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

  // redirect to containers
  window.location.href = '#/containers';
}
</script>

{#if dataReady}
  <NavPage
    title="Create container from Image {imageDisplayName}"
    searchEnabled="{false}"
    subtitle="{image.tag}@{image.shortId} ">
    <div slot="empty" class="bg-zinc-700 p-5 h-full">
      <div class="bg-zinc-800 px-6 py-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
        <div>
          <label for="modalContainerName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >Container Name:</label>
          <input
            type="text"
            bind:value="{containerName}"
            name="modalContainerName"
            id="modalContainerName"
            placeholder="Enter container name (leave blank to have one generated)"
            class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
            required />
          <!-- add a label for each port-->
          <label
            for="modalContainerName"
            class:hidden="{exposedPorts.length === 0}"
            class="pt-6 block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Port Mapping:</label>
          {#each exposedPorts as port, index}
            <div class="flex flex-row justify-center items-center w-full">
              <span class="text-sm flex-1 inline-block align-middle whitespace-nowrap text-gray-400"
                >Local port for {port}:</span>
              <input
                type="text"
                bind:value="{containerPortMapping[index]}"
                placeholder="Enter value for port {port}"
                class="ml-2 w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
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
  </NavPage>
{/if}
