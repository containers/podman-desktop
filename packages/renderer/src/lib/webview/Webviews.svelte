<script lang="ts">
import Fa from 'svelte-fa';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { webviews } from '/@/stores/webviews';
import IconImage from '/@/lib/appearance/IconImage.svelte';
import NavItem from '/@/lib/ui/NavItem.svelte';
import type { TinroRouteMeta } from 'tinro';

export let meta: TinroRouteMeta;
</script>

{#each $webviews as webview}
  <NavItem href="/webviews/{webview.id}" bind:meta="{meta}" tooltip="{webview.name}">
    {#if !webview.icon}
      <Fa icon="{faPuzzlePiece}" size="24" />
    {:else}
      <IconImage image="{webview?.icon}" alt="{webview.name}" class="max-h-6 max-w-[24px]" />
    {/if}
  </NavItem>
{/each}
