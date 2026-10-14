<script lang="ts">
import {
  type ImageInfo,
  type ImageSearchOptions,
  NavigationPage,
  type ProviderContainerConnectionInfo,
  type PullEvent,
} from '@desktop-framework/api';
import { faArrowCircleDown, faCircleCheck, faCog, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, Checkbox, ErrorMessage, Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import type { Terminal } from '@xterm/xterm';
import { onMount, tick } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { router } from 'tinro';

import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
import { ImageUtils } from '/@/lib/image/image-utils';
import RecommendedRegistry from '/@/lib/image/RecommendedRegistry.svelte';
import ImageIcon from '/@/lib/images/ImageIcon.svelte';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import TerminalWindow from '/@/lib/ui/TerminalWindow.svelte';
import type { TypeaheadItem } from '/@/lib/ui/Typeahead';
import Typeahead from '/@/lib/ui/Typeahead.svelte';
import WarningMessage from '/@/lib/ui/WarningMessage.svelte';
import { handleNavigation } from '/@/navigation';
import { lastPage } from '/@/stores/breadcrumb';
import { providerInfos } from '/@/stores/providers';

const DOCKER_PREFIX = 'docker.io';
const DOCKER_PREFIX_WITH_SLASH = DOCKER_PREFIX + '/';

const imageUtils = new ImageUtils();

let logsPull: Terminal | undefined = $state();
let pullError = $state('');
let pullInProgress = $state(false);
let pullFinished = $state(false);
let shortnameImages: string[] = [];
let podmanFQN = $state('');
let usePodmanFQN = $state(false);
let isValidName = $state(true);
let matchingLocalImages: string[] = $state([]);
let values: TypeaheadItem[] = $state([]);

let imageToPull: string = $state('');
let sortResults: ((a: string, b: string) => number) | undefined = $state();
let searchRequestId = 0;

let providerConnections = $derived(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

let selectedProviderConnection: ProviderContainerConnectionInfo | undefined = $state();

const lineNumberPerId = new SvelteMap<string, number>();
let lineIndex = 0;

async function resolveShortname(): Promise<void> {
  if (selectedProviderConnection?.type !== 'podman') {
    return;
  }
  if (imageToPull && !imageToPull.includes('/')) {
    shortnameImages =
      (await window.resolveShortnameImage($state.snapshot(selectedProviderConnection), imageToPull)) ?? [];
    // not a shortname
  } else {
    podmanFQN = '';
    shortnameImages = [];
    usePodmanFQN = false;
  }
  // checks if there is no FQN that is from docker hub
  if (!shortnameImages.find(name => name.includes('docker.io'))) {
    podmanFQN = shortnameImages[0];
  } else {
    podmanFQN = '';
    shortnameImages = [];
    usePodmanFQN = false;
  }
}

function callback(event: PullEvent): void {
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
    logsPull?.write(`\u001b[${lineIndexToWrite};0H`);
    // erase the line
    logsPull?.write('\u001B[2K');
    // do we have id ?
    if (event.id) {
      logsPull?.write(`${event.id}: `);
    }
    logsPull?.write(event.status);
    // do we have progress ?
    if (event.progress && event.progress !== '') {
      logsPull?.write(event.progress);
    } else if (event?.progressDetail?.current && event?.progressDetail?.total) {
      logsPull?.write(` ${Math.round((event.progressDetail.current / event.progressDetail.total) * 100)}%`);
    }
    // write end of line
    logsPull?.write('\n\r');
  } else if (event.error) {
    logsPull?.write(event.error.replaceAll('\n', '\n\r') + '\n\r');
  }
}

async function pullImage(): Promise<void> {
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
        ? await window.pullImage($state.snapshot(selectedProviderConnection), podmanFQN.trim(), callback)
        : await window.pullImage(
            $state.snapshot(selectedProviderConnection),
            `docker.io/${imageToPull.trim()}`,
            callback,
          );
    } else {
      await window.pullImage($state.snapshot(selectedProviderConnection), imageToPull.trim(), callback);
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

async function gotoManageRegistries(): Promise<void> {
  router.goto('/preferences/registries');
}

onMount(() => {
  // Select default connection
  selectedProviderConnection ??= providerConnections.length > 0 ? providerConnections[0] : undefined;
});

let imageNameInvalid: string | undefined = $state();
let imageNameIsInvalid = $state(true);
function validateImageName(image: string): void {
  if (image === undefined || image.trim() === '') {
    imageNameIsInvalid = true;
    imageNameInvalid = 'Please enter a value';
  } else {
    imageNameIsInvalid = false;
    imageNameInvalid = undefined;
  }
  imageToPull = image.trim();
}

// allTags is defined if last search was a query to search tags of an image
let allTags: string[] | undefined = undefined;
async function searchImages(value: string): Promise<{ images: string[]; tags: string[] | undefined }> {
  if (value.includes(':')) {
    if (allTags !== undefined) {
      return { images: allTags.filter(i => i.startsWith(value)), tags: allTags };
    }
    const parts = value.split(':');
    const originalImage = parts[0];
    let image = parts[0];
    if (image.startsWith(DOCKER_PREFIX_WITH_SLASH)) {
      image = image.slice(DOCKER_PREFIX_WITH_SLASH.length);
    }
    const tags = await window.listImageTagsInRegistry({ image });
    const computedTags = tags.map(t => `${originalImage}:${t}`);
    return { images: computedTags.filter(i => i.startsWith(value)), tags: computedTags };
  }
  if (value === undefined || value.trim() === '') {
    return { images: [], tags: undefined };
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
  const searchResult = await window.searchImageInRegistry(options);
  const result = searchResult.map(r => {
    return [options.registry, r.name].join('/');
  });
  return { images: result, tags: undefined };
}

async function searchLocalImages(value: string): Promise<string[]> {
  const listImages: ImageInfo[] = await window.listImages({
    provider: $state.snapshot(selectedProviderConnection),
  });
  const localImagesNames = listImages.map(image => {
    if (image.RepoTags) {
      return image.RepoTags;
    }
    return [];
  });
  return localImagesNames.flat().filter(image => image !== '' && image.includes(value));
}

let latestTagMessage: string | undefined = $state();
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

async function buildContainerFromImage(): Promise<void> {
  // filter all the local images that at least one of their repo tags includes the imageToPull
  let dockerLibraryImage: string | undefined;
  if (imageToPull.startsWith('docker.io/') && imageToPull.split('/').length === 2) {
    let [registry, imageName] = imageToPull.split('/');
    dockerLibraryImage = `${registry}/library/${imageName}`;
  }
  const localImages = (
    await window.listImages({
      provider: $state.snapshot(selectedProviderConnection),
    })
  ).filter(
    image =>
      (
        image.RepoTags?.filter(repoTag =>
          repoTag.includes(podmanFQN && usePodmanFQN ? podmanFQN : (dockerLibraryImage ?? imageToPull)),
        ) ?? []
      ).length > 0,
  );
  if (localImages.length > 0) {
    const chosenImage = imageUtils.getImagesInfoUI(localImages[0], []);
    if (chosenImage.length > 0) {
      handleNavigation({
        page: NavigationPage.IMAGE_RUN,
        parameters: {
          id: chosenImage[0].id,
          engineId: chosenImage[0].engineId,
          tag: chosenImage[0].tag ? `${chosenImage[0].name}:${chosenImage[0].tag}` : chosenImage[0].name,
        },
      });
    }
  }
}

async function searchFunction(value: string): Promise<void> {
  // do not search for images if no connection is selected
  if (!selectedProviderConnection) return;

  const requestId = ++searchRequestId;
  value = value.trim();
  const localImagesValues = await searchLocalImages(value);
  const remoteSearchResult = await searchImages(value);

  if (requestId !== searchRequestId) return;

  matchingLocalImages = localImagesValues;
  allTags = remoteSearchResult.tags;

  sortResults = (a: string, b: string): number => {
    const dockerIoValue = `docker.io/${value}`;
    const aStartsWithValue = a.startsWith(value) || a.startsWith(dockerIoValue);
    const bStartsWithValue = b.startsWith(value) || b.startsWith(dockerIoValue);
    if (aStartsWithValue === bStartsWithValue) {
      return a.localeCompare(b);
    } else if (aStartsWithValue && !bStartsWithValue) {
      return -1;
    } else {
      return 1;
    }
  };

  values = [
    ...localImagesValues.map(v => ({ value: v, group: 'Local Images' })),
    ...remoteSearchResult.images.map(v => ({ value: v, group: 'Registry Images' })),
  ];
}

async function pullImageAndRun(): Promise<void> {
  await pullImage();
  await buildContainerFromImage();
}

async function onEnterOperation(): Promise<void> {
  if (imageToPull === '') {
    return;
  }
  if (matchingLocalImages.includes(imageToPull)) {
    await buildContainerFromImage();
  } else {
    await pullImageAndRun();
  }
}

function onContainerConnectionChange(): void {
  // reset values
  values = [];
  matchingLocalImages = [];
  imageToPull = '';
}

// trigger search on mount to populate the typeahead with local images
onMount(() => {
  searchFunction('').catch(() => {});
});
</script>

<EngineFormPage title="Select an image">
  {#snippet icon()}
    <ImageIcon />
  {/snippet}
  {#snippet actions()}
    <Button on:click={gotoManageRegistries} icon={faCog}>Manage registries</Button>
  {/snippet}
  {#snippet content()}
  <div class="space-y-2 flex flex-col">
    <div class="flex flex-col">
      {#key selectedProviderConnection}
        <Typeahead
          id="imageName"
          name="imageName"
          placeholder="Select or enter an image to run"
          onInputChange={searchFunction}
          resultItems={values}
          compare={sortResults}
          onChange={async (s: string): Promise<void> => {
            validateImageName(s);
            await resolveShortname();
            await searchLatestTag();
        }}
          onEnter={onEnterOperation}
          disabled={pullFinished || pullInProgress}
          error={!isValidName}
          required
          initialFocus />
      {/key}
      {#if selectedProviderConnection?.type === 'podman' && podmanFQN && !matchingLocalImages.includes(podmanFQN)}
        <div class="absolute mt-2 ml-[-18px] self-start">
          <Tooltip tip="Shortname images will be pulled from Docker Hub" topRight>
            <Icon size="1.1x" class="text-[var(--pd-state-warning)]" icon={faTriangleExclamation} />
          </Tooltip>
        </div>
      {/if}
    </div>
    {#if selectedProviderConnection?.type === 'podman' && podmanFQN  && !matchingLocalImages.includes(podmanFQN)}
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
        <ContainerConnectionDropdown
          id="providerChoice"
          name="providerChoice"
          onchange={onContainerConnectionChange}
          bind:value={selectedProviderConnection}
          connections={providerConnections}
          disabled={pullFinished || pullInProgress}/>
      </div>
    {/if}
    {#if providerConnections.length === 1}
      <input type="hidden" name="providerChoice" readonly bind:value={selectedProviderConnection} />
    {/if}

    <footer>
      <div class="w-full flex flex-col justify-end gap-3 my-3">
        <ButtonRow>
          <Button type="secondary" on:click={(): void => router.goto($lastPage.path)}>Cancel</Button>
          {#if !matchingLocalImages.includes(imageToPull) && imageToPull !== ''}
            <Button
              icon={faArrowCircleDown}
              disabled={imageNameIsInvalid}
              on:click={pullImageAndRun}
              inProgress={pullInProgress}>
              Pull Image and Run
            </Button>
          {:else}
            <Button icon={faCircleCheck} disabled={imageNameIsInvalid} on:click={buildContainerFromImage}>Run Image</Button>
          {/if}
        </ButtonRow>
        {#if pullError}
          <ErrorMessage error={pullError} />
        {/if}
        <RecommendedRegistry bind:imageError={pullError} imageName={imageToPull} />
      </div>
    </footer>
    {#if (!matchingLocalImages.includes(imageToPull) && pullInProgress) || pullFinished}
      <TerminalWindow bind:terminal={logsPull} />
    {/if}
  </div>
  {/snippet}
</EngineFormPage>

