<script lang="ts">
import { recommendedRegistries } from '/@/stores/recommendedRegistries';

import type { RecommendedRegistry } from '../../../../main/src/plugin/recommendations/recommendations-api';
import FeaturedExtensionDownload from '../featured/FeaturedExtensionDownload.svelte';

export let imageError: string | undefined;

export let imageName: string | undefined;

let recommendedRegistriesToInstall: RecommendedRegistry[] = [];
let registriesFilteredByIds: RecommendedRegistry[] = [];

$: registriesFilteredByIds = $recommendedRegistries.filter(reg => imageName?.includes(reg.id));
$: recommendedRegistriesToInstall = registriesFilteredByIds.filter(registry =>
  registry.errors.some(registryMatchingError => imageError?.includes(registryMatchingError)),
);
</script>

{#each recommendedRegistriesToInstall as registry}
  <div class="text-amber-500 flex flex-row min-h-10 items-center pt-2 space-x-2">
    {#if !registry.isInstalled}
      <FeaturedExtensionDownload extension="{registry.extensionDetails}" />
    {/if}
    <p>
      {registry.isInstalled ? 'Check' : 'Install'} the &nbsp;<a
        class="text-amber-500 underline"
        href="/extensions/details/{registry.extensionId}">{registry.name} extension</a>
      to manage {registry.id}
    </p>
  </div>
{/each}
