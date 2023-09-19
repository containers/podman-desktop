<script lang="ts">
import { featuredExtensionInfos } from '/@/stores/featuredExtensions';
import { faCheckCircle, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import FeaturedExtensionDownload from './FeaturedExtensionDownload.svelte';
</script>

<!--Title-->
<p class="text-lg first-letter:uppercase font-bold">featured extensions:</p>
<div
  class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-4"
  role="region"
  aria-label="FeaturedExtensions">
  {#each $featuredExtensionInfos as featuredExtension}
    <div
      title="{featuredExtension.description}"
      class="rounded-md
               bg-charcoal-800 flex flex-row justify-center p-4 h-20 border-2 border-charcoal-800 hover:border-dustypurple-500"
      aria-label="{featuredExtension.displayName}">
      <div class=" flex flex-col flex-1">
        <div class="flex flex-row place-items-center flex-1">
          <div>
            <img
              class="w-12 h-12 object-contain"
              alt="{featuredExtension.displayName} logo"
              src="{featuredExtension.icon}" />
          </div>
          <div class="flex flex-1 mx-2 cursor-default font-bold justify-start">
            {featuredExtension.displayName}
          </div>
          <div class="h-full w-18 flex flex-col items-end place-content-center">
            {#if featuredExtension.installed}
              <div class="text-dustypurple-700 p-1 text-center flex flex-row place-items-center">
                <Fa class="ml-1.5 mr-2" size="18" icon="{faCheckCircle}" />
                <div class="uppercase font-bold text-xs cursor-default">installed</div>
              </div>
            {:else if featuredExtension.fetchable}
              <FeaturedExtensionDownload featuredExtension="{featuredExtension}" />
            {:else}
              <div class="text-charcoal-300 p-1 text-center flex flex-row place-items-center">
                <Fa class="ml-1.5 mr-1" size="18" icon="{faCircleXmark}" />
                <div class="uppercase text-xs cursor-default font-extralight">N/A</div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
