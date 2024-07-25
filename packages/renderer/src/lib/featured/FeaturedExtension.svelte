<script lang="ts">
import { faCheckCircle, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import type { FeaturedExtension } from '../../../../main/src/plugin/featured/featured-api';
import FeaturedExtensionDownload from './FeaturedExtensionDownload.svelte';

export let featuredExtension: FeaturedExtension;
export let variant: 'primary' | 'secondary' = 'primary';
export let displayTitle: boolean = false;
</script>

<div
  title={featuredExtension.description}
  class:bg-[var(--pd-card-bg)]={variant === 'primary'}
  class:border-[var(--pd-card-bg)]={variant === 'primary'}
  class:bg-[var(--pd-invert-content-card-bg)]={variant === 'secondary'}
  class:border-[var(--pd-invert-content-card-bg)]={variant === 'secondary'}
  class="rounded-md flex flex-row justify-center p-4 border-2 hover:border-dustypurple-500"
  aria-label={featuredExtension.displayName}>
  <div class="flex flex-col flex-1">
    {#if displayTitle}
      <span class="text-sm font-bold mb-1.5 text-[var(--pd-details-card-text)]">EXTENSION</span>
    {/if}
    <div class="flex flex-row place-items-center flex-1">
      <div>
        <img class="w-12 h-12 object-contain" alt="{featuredExtension.displayName} logo" src={featuredExtension.icon} />
      </div>
      <div class="flex flex-1 mx-2 cursor-default font-bold justify-start text-[var(--pd-details-body-text)]">
        {featuredExtension.displayName}
      </div>
      <div class="h-full w-18 flex flex-col items-end place-content-center">
        {#if featuredExtension.installed}
          <div class="text-dustypurple-700 p-1 text-center flex flex-row place-items-center">
            <Fa class="ml-1.5 mr-2" size="1.1x" icon={faCheckCircle} />
            <div class="uppercase font-bold text-sm cursor-default">installed</div>
          </div>
        {:else if featuredExtension.fetchable}
          <FeaturedExtensionDownload extension={featuredExtension} />
        {:else}
          <div class="text-charcoal-300 p-1 text-center flex flex-row place-items-center">
            <Fa class="ml-1.5 mr-1" size="1.1x" icon={faCircleXmark} />
            <div class="uppercase text-sm cursor-default font-extralight">N/A</div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
