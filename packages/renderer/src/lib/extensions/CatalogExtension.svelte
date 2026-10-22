<script lang="ts">
import { faCheckCircle, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { router } from 'tinro';

import FeaturedExtensionDownload from '/@/lib/featured/FeaturedExtensionDownload.svelte';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';

interface Props {
  catalogExtensionUI: CatalogExtensionInfoUI;
  oninstall?: (extensionId: string) => void;
  ondetails?: (extensionId: string) => void;
}
let {
  catalogExtensionUI,
  oninstall = (_extensionId: string): void => {},
  ondetails = (_extensionId: string): void => {},
}: Props = $props();

function openExtensionDetails(): void {
  ondetails(catalogExtensionUI.id);
  router.goto(`/extensions/details/${catalogExtensionUI.id}/`);
}
</script>

<div
  class="rounded-lg border border-[var(--pd-content-bg)] flex flex-col bg-[var(--pd-content-card-bg)] hover:border-[var(--pd-content-card-border-selected)] min-h-32 max-h-32"
  role="group"
  aria-label={catalogExtensionUI.displayName}>
  <!-- if featured need to display a top banner -->

  {#if catalogExtensionUI.isFeatured}
    <div class="bg-[var(--pd-badge-purple)] text-[var(--pd-card-header-text)] rounded-t-md px-2 text-sm min-h-6 flex flex-row items-center">
      Featured
    </div>
  {/if}

  <div class="p-3 h-full w-full flex flex-col justify-start">
    <div class="flex flex-row w-full">
      <div class="w-3/4 flex flex-col">
        <div class="flex flex-col w-full">
          <div class="flex-row flex items-center">
            <img
              src={catalogExtensionUI.iconHref}
              alt="{catalogExtensionUI.displayName} logo"
              class="mr-2 max-w-10 max-h-10 object-contain" />

            <div>
              <div class="line-clamp-2 leading-4 max-h-8 text-[var(--pd-content-header)]">
                {catalogExtensionUI.displayName}
              </div>
              <div class="pt-2 text-[var(--pd-content-text)] line-clamp-1">
                {catalogExtensionUI.shortDescription}
              </div>
            </div>
          </div>
          <div class="pt-1 text-[var(--pd-content-text)] text-sm">{catalogExtensionUI.publisherDisplayName}</div>
        </div>
      </div>

      {#if catalogExtensionUI.isInstalled && !catalogExtensionUI.isBundled}
        <div class="flex flex-1 text-[var(--pd-invert-content-info-icon)] p-1 justify-items-end flex-row place-content-end items-center">
          <Icon class="ml-1.5 mr-2" size="1.1x" icon={faCheckCircle} />
          <div class="uppercase text-sm cursor-default">Already installed</div>
        </div>
      {:else if catalogExtensionUI.fetchable}
        <div class="flex flex-1 justify-items-end w-18 flex-col items-end place-content-center">
          <FeaturedExtensionDownload oninstall={oninstall} extension={catalogExtensionUI} />
        </div>
      {/if}
    </div>
    <div class="items-end flex flex-1">
      <div class="text-[var(--pd-content-text)] text-sm">
        v{catalogExtensionUI.fetchVersion}
        {#if catalogExtensionUI.isBundled}
          <span>(bundled: v{catalogExtensionUI.installedVersion})</span>
        {:else if catalogExtensionUI.installedVersion && catalogExtensionUI.installedVersion !== catalogExtensionUI.fetchVersion}
          <span>(installed: v{catalogExtensionUI.installedVersion})</span>
        {/if}
      </div>
      <div class="flex flex-1 justify-end items-center">
        <Button
          type="link"
          icon={faCircleInfo}
          aria-label="{catalogExtensionUI.displayName} details"
          on:click={openExtensionDetails}>More details</Button>
      </div>
    </div>
  </div>
</div>
