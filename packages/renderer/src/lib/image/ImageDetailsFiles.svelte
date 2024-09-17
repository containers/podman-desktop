<script lang="ts">
import type { ImageFilesystemLayers, ImageInfo } from '@podman-desktop/api';
import { Checkbox } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { imageFilesProviders } from '/@/stores/image-files-providers';
import type { ImageFilesInfo } from '/@api/image-files-info';

import FilesystemLayerView from './FilesystemLayerView.svelte';
import { type ImageFilesystemLayerUI, toImageFilesystemLayerUIs } from './imageDetailsFiles';
import ImageDetailsFilesLayers from './ImageDetailsFilesLayers.svelte';

export let imageInfo: ImageInfo | undefined;

let imageLayers: ImageFilesystemLayers | undefined;
let filesProvidersUnsubscribe: Unsubscriber;
let filesProvider: ImageFilesInfo;
let selectedLayer: ImageFilesystemLayerUI;
let showLayerOnly: boolean;
let loading: boolean;
let cancellableTokenId: number = 0;
let error: string = '';

function onSelectedLayer(event: CustomEvent<ImageFilesystemLayerUI>) {
  selectedLayer = event.detail;
}

onMount(async () => {
  filesProvidersUnsubscribe = imageFilesProviders.subscribe(providers => {
    if (providers.length === 1 && imageInfo) {
      filesProvider = providers[0];
      loading = true;
      window.getCancellableTokenSource().then(token => {
        cancellableTokenId = token;
        window
          .imageGetFilesystemLayers(filesProvider.id, imageInfo, cancellableTokenId)
          .then(layers => {
            imageLayers = layers;
          })
          .catch((err: unknown) => {
            error = String(err);
          })
          .finally(() => {
            loading = false;
          });
      });
    }
  });
});

onDestroy(() => {
  window.cancelToken(cancellableTokenId);
  filesProvidersUnsubscribe?.();
});
</script>

{#if loading}
  <div class="p-4">Layers are being loaded. This can take a while for large images, please wait...</div>
{/if}

{#if error}
  <div class="p-4 text-[var(--pd-state-error)]">
    {error}
  </div>
{:else if imageLayers}
  <div class="flex flex-col w-full h-full p-8 pr-0 text-[var(--pd-content-text)] bg-[var(--pd-content-bg)]">
    <div class="pr-4">
      <slot name="header-info" />
    </div>
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
