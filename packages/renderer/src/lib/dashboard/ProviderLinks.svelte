<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

export let provider: ProviderInfo;
</script>

{#if provider.links.length > 0}
  <div class="mt-10 flex flex-row justify-around">
    {#each provider.links as link}
      <p
        on:click="{() => window.openExternal(link.url)}"
        class="text-sm text-center cursor-pointer text-violet-400 hover:text-violet-600 hover:no-underline">
        {link.title}
      </p>
    {/each}
  </div>
{/if}
