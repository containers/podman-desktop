<script lang="ts">
import type { ImageFilesystemLayers, ImageInfo } from '@podman-desktop/api';
import { Button, Checkbox } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { imageFilesProviders } from '/@/stores/image-files-providers';
import type { ImageFilesInfo } from '/@api/image-files-info';

import FilesystemLayerView from './FilesystemLayerView.svelte';
import { type ImageFilesystemLayerUI, toImageFilesystemLayerUIs } from './imageDetailsFiles';
import ImageDetailsFilesLayers from './ImageDetailsFilesLayers.svelte';

let { imageInfo }: { imageInfo: ImageInfo | undefined } = $props();

let imageLayers = $state<ImageFilesystemLayers>();
let selectedLayer = $state<ImageFilesystemLayerUI>();
let loading = $state<boolean>(false);
let error = $state<string>('');
let showLayerOnly = $state<boolean>(false);
let showFetchButton = $state<boolean>(false);

let filesProvidersUnsubscribe: Unsubscriber;
let filesProvider: ImageFilesInfo | undefined = undefined;
let cancellableTokenId: number = 0;
let askFetchLayers: boolean = true;

function onSelectedLayer(event: CustomEvent<ImageFilesystemLayerUI>): void {
  selectedLayer = event.detail;
}

async function fetchImageLayers(provider: ImageFilesInfo, img: ImageInfo): Promise<void> {
  try {
    loading = true;
    cancellableTokenId = await window.getCancellableTokenSource();
    imageLayers = await window.imageGetFilesystemLayers(provider.id, img, cancellableTokenId);
  } catch (err: unknown) {
    error = String(err);
  } finally {
    loading = false;
  }
}

async function onFetchLayers(): Promise<void> {
  showFetchButton = false;
  if (filesProvider !== undefined && imageInfo !== undefined) {
    await fetchImageLayers(filesProvider, imageInfo);
  }
}

onMount(async () => {
  try {
    const value = await window.getConfigurationValue<boolean>('userConfirmation.fetchImageFiles');
    if (value !== undefined) {
      askFetchLayers = value;
    }
  } finally {
    // we do this after trying to get the configuration, to be sure we are using the right configuration
    filesProvidersUnsubscribe = imageFilesProviders.subscribe(providers => {
      if (providers.length === 1 && imageInfo) {
        filesProvider = providers[0];
        if (askFetchLayers) {
          showFetchButton = true;
        } else {
          fetchImageLayers(filesProvider, imageInfo);
        }
      }
    });
  }
});

onDestroy(() => {
  window.cancelToken(cancellableTokenId);
  filesProvidersUnsubscribe?.();
});
</script>

{#if loading}
  <div class="p-4">Layers are being loaded. This can take a while for large images, please wait...</div>
{/if}
{#if showFetchButton}
  <div aria-label="fetch" class="p-4"><Button on:click={onFetchLayers}>Fetch Layers</Button></div>
{/if}
{#if error}
  <div class="p-4 text-[var(--pd-state-error)]">
    {error}
  </div>
{:else if imageLayers}
  <div class="flex flex-col w-full h-full p-8 pr-0 text-[var(--pd-content-text)] bg-[var(--pd-content-bg)]">
    <div class="mb-2 flex flex-row pr-12 pb-2">
      <span class="grow">Layers</span>
      <span><Checkbox bind:checked={showLayerOnly}>Show layer only</Checkbox></span>
    </div>
    <div class="h-full flex flex-row space-x-8">
      <div role="list" aria-label="layers" class="h-full overflow-y-auto w-3/4">
        <ImageDetailsFilesLayers on:selected={onSelectedLayer} layers={toImageFilesystemLayerUIs(imageLayers.layers)} />
      </div>
      <div aria-label="tree" class="h-full w-full pr-4 overflow-y-auto pb-16">
        {#if selectedLayer}
          <div class="grid grid-cols-[90px_60px_70px_1fr]">
            <FilesystemLayerView
              tree={showLayerOnly ? selectedLayer.layerTree.root : selectedLayer.stackTree.root}
              layerMode={showLayerOnly} />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
