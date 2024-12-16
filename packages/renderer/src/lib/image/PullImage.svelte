<script lang="ts">
import { faArrowCircleDown, faCog, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Button, Checkbox, Dropdown, ErrorMessage, Tooltip } from '@podman-desktop/ui-svelte';
import type { Terminal } from '@xterm/xterm';
import { onMount, tick } from 'svelte';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import type { ImageSearchOptions } from '/@api/image-registry';
import type { ProviderContainerConnectionInfo } from '/@api/provider-info';
import type { PullEvent } from '/@api/pull-event';

import { providerInfos } from '../../stores/providers';
import EngineFormPage from '../ui/EngineFormPage.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import Typeahead from '../ui/Typeahead.svelte';
import WarningMessage from '../ui/WarningMessage.svelte';
import RecommendedRegistry from './RecommendedRegistry.svelte';

const DOCKER_PREFIX = 'docker.io';
const DOCKER_PREFIX_WITH_SLASH = DOCKER_PREFIX + '/';

let logsPull: Terminal;
let pullError = '';
let pullInProgress = false;
let pullFinished = false;
let shortnameImages: string[] = [];
let podmanFQN = '';
let usePodmanFQN = false;
let isValidName = true;

export let imageToPull: string | undefined = undefined;

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

let selectedProviderConnection: ProviderContainerConnectionInfo | undefined;

const lineNumberPerId = new Map<string, number>();
let lineIndex = 0;

async function resolveShortname(): Promise<void> {
  if (!selectedProviderConnection || selectedProviderConnection.type !== 'podman') {
    return;
  }
  if (imageToPull && !imageToPull.includes('/')) {
    shortnameImages = (await window.resolveShortnameImage(selectedProviderConnection, imageToPull)) ?? [];
    // not a shortname
  } else {
    podmanFQN = '';
    shortnameImages = [];
    usePodmanFQN = false;
  }
  // checks if there is no FQN that is from dokcer hub
  if (!shortnameImages.find(name => name.includes('docker.io'))) {
    podmanFQN = shortnameImages[0];
  } else {
    podmanFQN = '';
    shortnameImages = [];
    usePodmanFQN = false;
  }
}

function callback(event: PullEvent) {
  let lineIndexToWrite;
  if (event.status && event.id) {
    const lineNumber = lineNumberPerId.get(event.id);
    if (lineNumber) {
      lineIndexToWrite = lineNumber;
    } else {
      lineIndex++;
      lineIndexToWrite = lineIndex;
      lineNumberPerId.set(event.id, lineIndex);
    }
  }
  // no index, append
  if (!lineIndexToWrite) {
    lineIndex++;
    lineIndexToWrite = lineIndex;
  }

  if (event.status) {
    // move cursor to the home
    logsPull.write(`\u001b[${lineIndexToWrite};0H`);
    // erase the line
    logsPull.write('\u001B[2K');
    // do we have id ?
    if (event.id) {
      logsPull.write(`${event.id}: `);
    }
    logsPull.write(event.status);
    // do we have progress ?
    if (event.progress && event.progress !== '') {
      logsPull.write(event.progress);
    } else if (event?.progressDetail?.current && event?.progressDetail?.total) {
      logsPull.write(` ${Math.round((event.progressDetail.current / event.progressDetail.total) * 100)}%`);
    }
    // write end of line
    logsPull.write('\n\r');
  } else if (event.error) {
    logsPull.write(event.error.replaceAll('\n', '\n\r') + '\n\r');
  }
}

async function pullImage() {
  if (!selectedProviderConnection) {
    pullError = 'No current provider connection';
    return;
  }

  if (!imageToPull) {
    pullError = 'No image to pull';
    return;
  }

  lineNumberPerId.clear();
  lineIndex = 0;
  await tick();
  logsPull?.reset();

  // reset error
  pullError = '';

  pullInProgress = true;
  try {
    if (podmanFQN) {
      usePodmanFQN
        ? await window.pullImage(selectedProviderConnection, podmanFQN.trim(), callback)
        : await window.pullImage(selectedProviderConnection, `docker.io/${imageToPull.trim()}`, callback);
    } else {
      await window.pullImage(selectedProviderConnection, imageToPull.trim(), callback);
    }
    pullInProgress = false;
    pullFinished = true;
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === 'object' && 'message' in error && error.message ? error.message : error;
    pullError = `Error while pulling image from ${selectedProviderConnection.name}: ${errorMessage}`;
    pullInProgress = false;
  }
}

async function pullImageFinished() {
  router.goto('/images');
}

async function gotoManageRegistries() {
  router.goto('/preferences/registries');
}

onMount(() => {
  if (!selectedProviderConnection) {
    selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
  }
});

let imageNameInvalid: string | undefined = undefined;
let imageNameIsInvalid = imageToPull === undefined || imageToPull.trim() === '';
function validateImageName(image: string): void {
  if (imageToPull && (image === undefined || image.trim() === '')) {
    imageNameIsInvalid = true;
    imageNameInvalid = 'Please enter a value';
  } else {
    imageNameIsInvalid = false;
    imageNameInvalid = undefined;
  }
  imageToPull = image;
}

// allTags is defined if last search was a query to search tags of an image
let allTags: string[] | undefined = undefined;
async function searchImages(value: string): Promise<string[]> {
  if (value.includes(':')) {
    if (allTags !== undefined) {
      return allTags.filter(i => i.startsWith(value));
    }
    const parts = value.split(':');
    const originalImage = parts[0];
    let image = parts[0];
    if (image.startsWith(DOCKER_PREFIX_WITH_SLASH)) {
      image = image.slice(DOCKER_PREFIX_WITH_SLASH.length);
    }
    const tags = await window.listImageTagsInRegistry({ image });
    allTags = tags.map(t => `${originalImage}:${t}`);
    return allTags.filter(i => i.startsWith(value));
  }
  allTags = undefined;
  if (value === undefined || value.trim() === '') {
    return [];
  }
  const options: ImageSearchOptions = {
    query: '',
  };
  if (!value.includes('/')) {
    options.registry = DOCKER_PREFIX;
    options.query = value;
  } else {
    const [registry, ...rest] = value.split('/');
    options.registry = registry;
    options.query = rest.join('/');
  }
  let result: string[];
  const searchResult = await window.searchImageInRegistry(options);
  result = searchResult.map(r => {
    return [options.registry, r.name].join('/');
  });
  return result;
}

let latestTagMessage: string | undefined = undefined;
async function searchLatestTag(): Promise<void> {
  if (imageNameIsInvalid || !imageToPull) {
    latestTagMessage = undefined;
    return;
  }
  try {
    let image = imageToPull;
    if (image.startsWith(DOCKER_PREFIX_WITH_SLASH)) {
      image = image.slice(DOCKER_PREFIX_WITH_SLASH.length);
    }
    const tags = await window.listImageTagsInRegistry({ image });
    if (imageToPull.includes(':')) {
      latestTagMessage = undefined;
      checkIfTagExist(image, tags);
      return;
    }
    isValidName = Boolean(tags);
    const latestFound = tags.includes('latest');
    if (!latestFound) {
      latestTagMessage = '"latest" tag not found. You can search a tag by appending ":" to the image name';
      isValidName = false;
    } else {
      latestTagMessage = undefined;
    }
  } catch {
    isValidName = false;
    latestTagMessage = undefined;
  }
}

function checkIfTagExist(image: string, tags: string[]): void {
  const tag = image.split(':')[1];

  isValidName = tags.some(t => t === tag);
}
</script>

<EngineFormPage
  title="Pull image from a registry"
  inProgress={pullInProgress}
  showEmptyScreen={providerConnections.length === 0}>
  <svelte:fragment slot="icon">
    <i class="fas fa-arrow-circle-down fa-2x" aria-hidden="true"></i>
  </svelte:fragment>

  <svelte:fragment slot="actions">
    <Button on:click={() => gotoManageRegistries()} icon={faCog}>Manage registries</Button>
  </svelte:fragment>

  <div slot="content" class="space-y-6">
    <div class="w-full">
      <label for="imageName" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
        >Image to Pull</label>
      <div class="flex flex-col">
        <Typeahead
          id="imageName"
          name="imageName"
          placeholder="Image name"
          searchFunction={searchImages}
          onChange={async (s: string) => {
            validateImageName(s);
            await resolveShortname();
            await searchLatestTag();
          }}
          onEnter={pullImage}
          disabled={pullFinished || pullInProgress}
          error={!isValidName}
          required
          initialFocus />
        {#if selectedProviderConnection?.type === 'podman' && podmanFQN}
          <div class="absolute mt-2 ml-[-18px] self-start">
            <Tooltip tip="Shortname images will be pulled from Docker Hub" topRight>
              <Fa id="shortname-warning" size="1.1x" class="text-[var(--pd-state-warning)]" icon={faTriangleExclamation} />
            </Tooltip>
          </div>
        {/if}
      </div>
      {#if selectedProviderConnection?.type === 'podman' && podmanFQN}
        <Checkbox class="pt-2" bind:checked={usePodmanFQN} title="Use Podman FQN" disabled={podmanFQN === ''}
          >Use Podman FQN for shortname image</Checkbox>
      {/if}
      {#if imageNameInvalid}
        <ErrorMessage error={imageNameInvalid} />
      {/if}
      {#if latestTagMessage}
        <WarningMessage error={latestTagMessage} />
      {/if}

      {#if providerConnections.length > 1}
        <div class="pt-4">
          <label for="providerChoice" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
            >Container Engine</label>
          <Dropdown
            id="providerChoice"
            name="providerChoice"
            bind:value={selectedProviderConnection}
            options={providerConnections.map(providerConnection => ({
              label: providerConnection.name,
              value: providerConnection,
            }))}>
          </Dropdown>
        </div>
      {/if}
      {#if providerConnections.length === 1}
        <input type="hidden" name="providerChoice" readonly bind:value={selectedProviderConnection} />
      {/if}
    </div>
    <footer>
      <div class="w-full flex flex-col justify-end">
        {#if !pullFinished}
          <Button
            icon={faArrowCircleDown}
            bind:disabled={imageNameIsInvalid}
            on:click={() => pullImage()}
            bind:inProgress={pullInProgress}>
            Pull image
          </Button>
        {:else}
          <Button on:click={() => pullImageFinished()}>Done</Button>
        {/if}
        {#if pullError}
          <ErrorMessage error={pullError} />
        {/if}
        <RecommendedRegistry bind:imageError={pullError} imageName={imageToPull} />
      </div>
    </footer>
    <TerminalWindow bind:terminal={logsPull} />
  </div>
</EngineFormPage>
