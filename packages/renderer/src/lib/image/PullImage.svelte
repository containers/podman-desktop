<script lang="ts">
import type { ImageSearchOptions, ProviderContainerConnectionInfo, PullEvent } from '@desktop-framework/api';
import { NavigationPage, PreferredRegistriesSettings } from '@desktop-framework/api';
import { faArrowCircleDown, faBan, faCog, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, Checkbox, ErrorMessage, Link, Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import type { Terminal } from '@xterm/xterm';
import { onMount, tick } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { router } from 'tinro';

import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
import { ImageUtils } from '/@/lib/image/image-utils';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import TerminalWindow from '/@/lib/ui/TerminalWindow.svelte';
import type { TypeaheadItem } from '/@/lib/ui/Typeahead';
import Typeahead from '/@/lib/ui/Typeahead.svelte';
import WarningMessage from '/@/lib/ui/WarningMessage.svelte';
import { handleNavigation } from '/@/navigation';
import { providerInfos } from '/@/stores/providers';

import type { ImageInfoUI } from './ImageInfoUI';
import RecommendedRegistry from './RecommendedRegistry.svelte';

const DOCKER_PREFIX = 'docker.io';
const DOCKER_PREFIX_WITH_SLASH = DOCKER_PREFIX + '/';

// Get the preferred registries from configuration
let preferredRegistries = $state<string[]>([DOCKER_PREFIX]);
const imageUtils = new ImageUtils();

let logsPull = $state<Terminal>();
let pullError = $state('');
let pullInProgress = $state(false);
let pullFinished = $state(false);
let pullCancellableTokenId = $state<number | undefined>();
let pullCancellationRequested = $state(false);
let shortnameImages: string[] = [];
let podmanFQN = $state('');
let usePodmanFQN = $state(false);
let isValidName = $state(true);
let searchResult = $state<TypeaheadItem[]>([]);
let sortResults = $state<(a: string, b: string) => number>();

interface Props {
  imageToPull?: string;
}

let { imageToPull = $bindable() }: Props = $props();

let providerConnections = $derived(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

let selectedProviderConnection = $state<ProviderContainerConnectionInfo>();

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

  if (logsPull) {
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
  logsPull?.clear();

  // reset error
  pullError = '';

  pullInProgress = true;
  try {
    pullCancellationRequested = false;
    pullCancellableTokenId = await window.getCancellableTokenSource();
    const selectedProviderConnectionSnapshot = $state.snapshot(selectedProviderConnection);
    if (podmanFQN) {
      usePodmanFQN
        ? await window.pullImage(
            selectedProviderConnectionSnapshot,
            podmanFQN.trim(),
            callback,
            undefined,
            pullCancellableTokenId,
          )
        : await window.pullImage(
            selectedProviderConnectionSnapshot,
            `docker.io/${imageToPull.trim()}`,
            callback,
            undefined,
            pullCancellableTokenId,
          );
    } else {
      await window.pullImage(
        selectedProviderConnectionSnapshot,
        imageToPull.trim(),
        callback,
        undefined,
        pullCancellableTokenId,
      );
    }
    pullFinished = true;
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === 'object' && 'message' in error && error.message ? error.message : error;
    const normalizedErrorMessage = String(errorMessage).toLowerCase();
    const pullCanceled =
      pullCancellationRequested ||
      normalizedErrorMessage.includes('aborted') ||
      normalizedErrorMessage.includes('cancelled') ||
      normalizedErrorMessage.includes('canceled');
    if (!pullCanceled) {
      pullError = `Error while pulling image from ${selectedProviderConnection.name}: ${errorMessage}`;
    }
  } finally {
    pullCancellableTokenId = undefined;
    pullInProgress = false;
    pullCancellationRequested = false;
  }
}

async function pullImageFinished(): Promise<void> {
  router.goto('/images');
}

async function getFirstPulledImageInfo(): Promise<ImageInfoUI | undefined> {
  const dockerLibraryImage =
    imageToPull?.startsWith('docker.io/') && imageToPull.split('/').length === 2
      ? `${imageToPull.split('/')[0]}/library/${imageToPull.split('/')[1]}`
      : undefined;

  const target = usePodmanFQN && podmanFQN ? podmanFQN : (dockerLibraryImage ?? imageToPull);
  if (!target) return undefined;

  const localImages = (
    await window.listImages({
      provider: $state.snapshot(selectedProviderConnection),
    })
  ).filter(image => (image.RepoTags ?? []).some(repoTag => repoTag.includes(target)));

  if (localImages.length === 0) return undefined;

  const [first] = imageUtils.getImagesInfoUI(localImages[0], []);
  return first;
}

async function gotoImageDetails(): Promise<void> {
  const image = await getFirstPulledImageInfo();
  if (image) {
    router.goto(`/images/${image.id}/${image.engineId}/${image.base64RepoTag}/summary`);
  }
}

async function gotoImageRun(): Promise<void> {
  const image = await getFirstPulledImageInfo();
  if (image) {
    handleNavigation({
      page: NavigationPage.IMAGE_RUN,
      parameters: {
        id: image.id,
        engineId: image.engineId,
        tag: image.tag ? `${image.name}:${image.tag}` : image.name,
      },
    });
  }
}
async function cancelPullImage(): Promise<void> {
  if (pullCancellableTokenId === undefined) {
    return;
  }
  pullCancellationRequested = true;
  await window.cancelToken(pullCancellableTokenId);
}

async function gotoManageRegistries(): Promise<void> {
  router.goto('/preferences/registries');
}

onMount(() => {
  selectedProviderConnection ??= providerConnections.length > 0 ? providerConnections[0] : undefined;
});

onMount(async () => {
  const configuration = await window.getConfigurationValue<string>(
    `${PreferredRegistriesSettings.SectionName}.${PreferredRegistriesSettings.Preferred}`,
  );
  if (configuration) {
    const registries = configuration
      .split(',')
      .map(r => r.trim())
      .filter(r => r !== '');
    preferredRegistries = registries.length > 0 ? registries : [];

    if (!preferredRegistries.includes(DOCKER_PREFIX)) {
      preferredRegistries.push(DOCKER_PREFIX);
    }
  }
});

let imageNameInvalid = $state<string>();
let imageNameIsInvalid = $state(imageToPull === undefined || imageToPull.trim() === '');
function validateImageName(image: string): void {
  if (image === undefined || image.trim() === '') {
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

  if (!value.includes('/')) {
    // Search across all preferred registries
    const seenFullNames = new SvelteSet<string>();

    for (const registry of preferredRegistries) {
      try {
        const options: ImageSearchOptions = {
          registry: registry,
          query: value,
        };
        const searchResult = await window.searchImageInRegistry(options);
        // Add all results with their full registry prefix
        for (const r of searchResult) {
          const fullName = [registry, r.name].join('/');
          // Only add if we haven't seen this exact full name before
          if (!seenFullNames.has(fullName)) {
            seenFullNames.add(fullName);
          }
        }
      } catch (error: unknown) {
        console.error(`Failed to search registry ${registry}: ${error}`);
      }
    }
    return Array.from(seenFullNames.values());
  } else {
    // User specified a registry in the search term
    const [registry, ...rest] = value.split('/');
    const options: ImageSearchOptions = {
      registry: registry,
      query: rest.join('/'),
    };
    const searchResult = await window.searchImageInRegistry(options);
    return searchResult.map(r => {
      return [options.registry, r.name].join('/');
    });
  }
}

let latestTagMessage = $state<string>();
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

async function searchFunction(value: string): Promise<void> {
  try {
    const result = await searchImages(value);
    sortResults = (a: string, b: string): number => {
      // Check if results match the search value exactly
      const dockerIoValue = `docker.io/${value}`;
      const aStartsWithValue = a.startsWith(value) || a.startsWith(dockerIoValue);
      const bStartsWithValue = b.startsWith(value) || b.startsWith(dockerIoValue);

      // Check if results are from preferred registries and get their priority
      const aRegistryIndex = preferredRegistries.findIndex(reg => a.startsWith(`${reg}/`));
      const bRegistryIndex = preferredRegistries.findIndex(reg => b.startsWith(`${reg}/`));

      // Prioritize preferred registries by order
      if (aRegistryIndex !== -1 && bRegistryIndex !== -1) {
        // Both are in preferred registries, sort by their order
        if (aRegistryIndex !== bRegistryIndex) {
          return aRegistryIndex - bRegistryIndex;
        }
      } else if (aRegistryIndex !== -1) {
        // Only a is in preferred registries
        return -1;
      } else if (bRegistryIndex !== -1) {
        // Only b is in preferred registries
        return 1;
      }

      // Then prioritize exact matches
      if (aStartsWithValue === bStartsWithValue) {
        return a.localeCompare(b);
      } else if (aStartsWithValue && !bStartsWithValue) {
        return -1;
      } else {
        return 1;
      }
    };
    searchResult = result.map(value => ({ value: value }));
  } catch (error: unknown) {
    searchResult = [];
    sortResults = undefined;
  }
}
</script>

<EngineFormPage
  title="Pull an image from a registry"
  inProgress={pullInProgress}
  showEmptyScreen={providerConnections.length === 0}>
  {#snippet icon()}
    <i class="fas fa-arrow-circle-down fa-2x" aria-hidden="true"></i>
  {/snippet}

  {#snippet actions()}
    <Button on:click={gotoManageRegistries} icon={faCog}>Manage registries</Button>
  {/snippet}

  {#snippet content()}
  <div class="space-y-6">
    <div class="w-full">

      <div class="self-center text-[var(--pd-table-body-text)] pb-4">Specify preferred registries for pulling images in <Link on:click={gotoManageRegistries}>Settings &gt; Registries</Link>.</div>

      <label for="imageName" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
        >Image to pull</label>
      <div class="flex flex-col">
        <Typeahead
          id="imageName"
          name="imageName"
          placeholder="Image name"
          onInputChange={searchFunction}
          resultItems={searchResult}
          compare={sortResults}
          onChange={async (s: string): Promise<void> => {
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
              <Icon size="1.1x" class="text-[var(--pd-state-warning)]" icon={faTriangleExclamation} />
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
          <ContainerConnectionDropdown
            id="providerChoice"
            name="providerChoice"
            bind:value={selectedProviderConnection}
            connections={providerConnections}/>
        </div>
      {/if}
      {#if providerConnections.length === 1}
        <input type="hidden" name="providerChoice" readonly bind:value={selectedProviderConnection} />
      {/if}
    </div>
    <footer>
      <div class="w-full flex flex-col justify-end">
        <ButtonRow>
          {#if !pullFinished}
            <Button
              icon={faArrowCircleDown}
              disabled={imageNameIsInvalid || pullInProgress}
              on:click={pullImage}
              inProgress={pullInProgress}>
              {pullInProgress ? 'Pulling image' : 'Pull image'}
            </Button>
            {#if pullInProgress}
              <Button icon={faBan} disabled={!pullInProgress} on:click={cancelPullImage} type="secondary">Cancel</Button>
            {/if}
          {:else}
            <Button type='link' on:click={pullImageFinished}>Close</Button>
            <Button type='secondary' on:click={gotoImageDetails}>View details</Button>
            <Button type='primary' on:click={gotoImageRun}>Run</Button>
          {/if}
        </ButtonRow>
        {#if pullError}
          <ErrorMessage error={pullError} />
        {/if}
        <RecommendedRegistry bind:imageError={pullError} imageName={imageToPull} />
      </div>
    </footer>
    <TerminalWindow bind:terminal={logsPull} />
  </div>
  {/snippet}
</EngineFormPage>
