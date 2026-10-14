<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';
import { Button } from '@podman-desktop/ui-svelte';

import FeaturedExtensionDownload from '/@/lib/featured/FeaturedExtensionDownload.svelte';
import { handleNavigation } from '/@/navigation';
import { recommendedRegistries } from '/@/stores/recommendedRegistries';

interface Props {
  imageError?: string;
  imageName?: string;
}

let { imageError = $bindable(), imageName }: Props = $props();
let registriesFilteredByIds = $derived($recommendedRegistries.filter(reg => imageName?.includes(reg.id)));
let recommendedRegistriesToInstall = $derived(
  registriesFilteredByIds.filter(registry =>
    registry.errors.some(registryMatchingError => imageError?.includes(registryMatchingError)),
  ),
);

function goToAuthPage(): void {
  handleNavigation({
    page: NavigationPage.AUTHENTICATION,
  });
}
</script>

{#each recommendedRegistriesToInstall as registry (registry.id)}
  <div class="text-[var(--pd-state-warning)] flex flex-row min-h-10 items-center pt-2 space-x-2">
    {#if !registry.isInstalled}
      <FeaturedExtensionDownload extension={registry.extensionDetails} />
    {/if}
    <p>
      {registry.isInstalled ? 'Check' : 'Install'} the &nbsp;<a
        class="text-[var(--pd-state-warning)] underline"
        href="/extensions/details/{registry.extensionId}">{registry.name} extension</a>
      to manage {registry.id}
    </p>

    {#if registry.isInstalled}
      <Button on:click={goToAuthPage}>Sign in...</Button>
    {/if}
  </div>
{/each}
