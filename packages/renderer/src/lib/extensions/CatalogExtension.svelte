<script lang="ts">
import { faArrowUpRightFromSquare, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import FeaturedExtensionDownload from '../featured/FeaturedExtensionDownload.svelte';
import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';

export let catalogExtensionUI: CatalogExtensionInfoUI;

function openExtensionDetails() {
  router.goto(`/extensions/details/${catalogExtensionUI.id}/`);
}
</script>

<div
  class="rounded-lg border border-[var(--pd-card-bg)] flex flex-col bg-[var(--pd-card-bg)] hover:border-dustypurple-500 min-h-32 max-h-32"
  role="group"
  aria-label="{catalogExtensionUI.displayName}">
  <!-- if featured need to display a top banner -->

  {#if catalogExtensionUI.isFeatured}
    <div class="bg-dustypurple-500 rounded-t-md px-2 font-light text-xs min-h-6 flex flex-row items-center">
      Featured
    </div>
  {/if}

  <div class="p-3 h-full w-full flex flex-col justify-start">
    <div class="flex flex-row w-full">
      <div class="w-3/4 flex flex-col">
        <div class="flex flex-col w-full">
          <div class="flex-row flex items-center">
            <img
              src="{catalogExtensionUI.iconHref}"
              alt="{catalogExtensionUI.displayName} logo"
              class="mr-2 max-w-10 max-h-10 object-contain" />

            <div>
              <div class="line-clamp-2 leading-4 max-h-8">
                {catalogExtensionUI.displayName}
              </div>
              <div class="pt-2 text-xs text-gray-700 line-clamp-1">{catalogExtensionUI.shortDescription}</div>
            </div>
          </div>
          <div class="pt-1 text-gray-800 text-xs">{catalogExtensionUI.publisherDisplayName}</div>
        </div>
      </div>

      {#if catalogExtensionUI.isInstalled}
        <div class="flex flex-1 text-dustypurple-700 p-1 justify-items-end flex-row place-content-end items-center">
          <Fa class="ml-1.5 mr-2" size="1.1x" icon="{faCheckCircle}" />
          <div class="uppercase text-xs cursor-default">Already installed</div>
        </div>
      {:else if catalogExtensionUI.fetchable}
        <div class="flex flex-1 justify-items-end w-18 flex-col items-end place-content-center">
          <FeaturedExtensionDownload extension="{catalogExtensionUI}" />
        </div>
      {/if}
    </div>
    <div class="text-gray-200 items-end flex flex-1">
      <div class="text-gray-700 text-xs">
        v{catalogExtensionUI.fetchVersion}
        {#if catalogExtensionUI.installedVersion && catalogExtensionUI.installedVersion !== catalogExtensionUI.fetchVersion}
          <span>(installed: v{catalogExtensionUI.installedVersion})</span>
        {/if}
      </div>
      <div class="flex flex-1 justify-end items-center">
        <Fa icon="{faArrowUpRightFromSquare}" />
        <button class="ml-2" on:click="{() => openExtensionDetails()}">More details</button>
      </div>
    </div>
  </div>
</div>
