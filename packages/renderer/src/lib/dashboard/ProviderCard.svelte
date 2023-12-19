<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import IconImage from '../appearance/IconImage.svelte';
import ProviderStatus from '../ui/ProviderStatus.svelte';
import ProviderLinks from './ProviderLinks.svelte';

export let provider: ProviderInfo;
</script>

<div class="bg-charcoal-800 mb-5 rounded-md p-3 flex-nowrap" role="region" aria-label="{provider.name} Provider">
  <div class="flex flex-row">
    <div class="flex flex-row">
      <IconImage image="{provider?.images?.icon}" class="mx-auto max-h-12" alt="{provider.name}"></IconImage>
      <div class="flex flex-col text-gray-400 ml-3 whitespace-nowrap" aria-label="context-name">
        <div class="flex flex-row items-center">
          {provider.name}
          {#if provider.version}
            <div class="text-gray-800 text-sm pl-1" aria-label="Provider Version">
              v{provider.version}
            </div>
          {/if}
        </div>
        <div class="flex flex-row pt-1" aria-label="Actual State">
          <ProviderStatus status="{provider.status}" />
        </div>
      </div>
    </div>
    <div class="flex flex-col items-center text-center flex-grow">
      <slot name="content" />
    </div>
  </div>

  <ProviderLinks provider="{provider}" />
</div>
