<script lang="ts">
import type { ProviderInfo } from '@desktop-framework/api';
import { Link } from '@podman-desktop/ui-svelte';

interface Props {
  provider: ProviderInfo;
}
let { provider }: Props = $props();
</script>

{#if provider.links.length > 0}
  <div class="mt-2 flex relative w-full content-stretch items-center flex-row justify-around grow flex-nowrap">
    {#each provider.links as link, index (index)}
      {#if link.group === undefined}
        <Link class="text-base" on:click={(): Promise<void> => window.openExternal(link.url)}>
          {link.title}
        </Link>
      {/if}
    {/each}
  </div>
{/if}
