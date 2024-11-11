<svelte:options runes={true} />

<script lang="ts">
import Fa from 'svelte-fa';
import type { TinroRouteMeta } from 'tinro';

import type { NavigationRegistryEntry } from '/@/stores/navigation/navigation-registry';

import NavItem from './NavItem.svelte';

interface NavRegistryEntryProps {
  entry: NavigationRegistryEntry;
  meta: TinroRouteMeta;
  iconWithTitle: boolean;
}

let { entry, meta = $bindable(), iconWithTitle = false }: NavRegistryEntryProps = $props();
</script>

{#if !entry.hidden}
  <NavItem href={entry.link} counter={entry.counter} tooltip={entry.tooltip} ariaLabel={entry.name} bind:meta={meta} iconWithTitle={iconWithTitle}>
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
    {#if iconWithTitle && entry.icon}
      <div class="text-xs text-center max-w-[60px] ml-[2px]" title="Icon title">
        {entry.name}
      </div>
    {/if}
  </NavItem>
{/if}
