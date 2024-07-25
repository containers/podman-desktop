<script lang="ts">
import type { ProviderInfo } from '/@api/provider-info';

export let provider: ProviderInfo;

let logo: string | undefined = undefined;
$: {
  if (provider.images.logo) {
    if (typeof provider.images.logo === 'string') {
      logo = provider.images.logo;
    } else if (provider.images.logo.dark) {
      // for now use dark theme
      logo = provider.images.logo.dark;
    }
  }
}
</script>

{#if logo}
  <div class="flex">
    <img src={logo} alt={provider.name} class="mx-auto max-h-12" />
  </div>
{/if}
