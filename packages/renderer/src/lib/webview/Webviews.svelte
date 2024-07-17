<script lang="ts">
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import type { TinroRouteMeta } from 'tinro';

import IconImage from '/@/lib/appearance/IconImage.svelte';
import NavItem from '/@/lib/ui/NavItem.svelte';
import { webviews } from '/@/stores/webviews';

export let meta: TinroRouteMeta;
</script>

{#each $webviews as webview (webview.id)}
  <NavItem href="/webviews/{webview.id}" bind:meta={meta} tooltip={webview.name}>
    {#if !webview.icon}
      <Fa icon={faPuzzlePiece} size="1.5x" />
    {:else}
      <IconImage image={webview?.icon} alt={webview.name} class="max-h-6 max-w-[24px]" />
    {/if}
  </NavItem>
{/each}
