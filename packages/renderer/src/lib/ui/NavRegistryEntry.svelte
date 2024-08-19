<svelte:options runes={true} />

<script lang="ts">
import Fa from 'svelte-fa';
import type { TinroRouteMeta } from 'tinro';

import type { NavigationRegistryEntry } from '/@/stores/navigation/navigation-registry';

import NavItem from './NavItem.svelte';

let { entry, meta = $bindable() }: { entry: NavigationRegistryEntry; meta: TinroRouteMeta } = $props();
</script>

{#if !entry.hidden}
  <NavItem href={entry.link} counter={entry.counter} tooltip={entry.tooltip} ariaLabel={entry.name} bind:meta={meta}>
    {#if entry.icon === undefined}
      {entry.name}
    {:else if entry.icon.faIcon}
      <Fa icon={entry.icon.faIcon.definition} size={entry.icon.faIcon.size} />
    {:else if entry.icon.iconComponent}
      <!-- svelte-ignore svelte_component_deprecated -->
      <svelte:component this={entry.icon.iconComponent} size="24" />
    {:else if entry.icon.iconImage && typeof entry.icon.iconImage === 'string'}
      <img src={entry.icon.iconImage} width="22" height="22" alt={entry.name} />
    {/if}
  </NavItem>
{/if}
