<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import Link from '../ui/Link.svelte';

export let provider: ProviderInfo;
</script>

{#if provider.links.length > 0}
  <div class="mt-2 flex relative w-full content-stretch items-center flex-row justify-around flex-grow flex-nowrap">
    {#each provider.links as link}
      {#if link.group === undefined}
        <Link class="text-base" externalRef="{link.url}">
          {link.title}
        </Link>
      {/if}
    {/each}
  </div>
{/if}
