<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

export let provider: ProviderInfo;

let logo;
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
    <!--w-3/4 lg:w-2/3 xl:w-1/2 -->
    <img src="{logo}" alt="{provider.name}" class="mx-auto max-h-24 xl:max-h-36" />
  </div>
{/if}
