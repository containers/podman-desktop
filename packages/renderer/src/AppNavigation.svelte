<svelte:options runes={true} />

<script lang="ts">
import { onMount } from 'svelte';
import type { TinroRouteMeta } from 'tinro';

import { CommandRegistry } from './lib/CommandRegistry';
import NewContentOnDashboardBadge from './lib/dashboard/NewContentOnDashboardBadge.svelte';
import AccountIcon from './lib/images/AccountIcon.svelte';
import DashboardIcon from './lib/images/DashboardIcon.svelte';
import SettingsIcon from './lib/images/SettingsIcon.svelte';
import NavItem from './lib/ui/NavItem.svelte';
import NavRegistryEntry from './lib/ui/NavRegistryEntry.svelte';
import NavSection from './lib/ui/NavSection.svelte';
import { navigationRegistry } from './stores/navigation/navigation-registry';

let { exitSettingsCallback, meta = $bindable() }: { exitSettingsCallback: () => void; meta: TinroRouteMeta } = $props();

const iconSize = '22';

onMount(async () => {
  const commandRegistry = new CommandRegistry();
  commandRegistry.init();
});

function clickSettings(b: boolean) {
  if (b) {
    exitSettingsCallback();
  } else {
    window.location.href = '#/preferences/resources';
  }
}
</script>

<svelte:window />
<nav
  class="group w-leftnavbar min-w-leftnavbar flex flex-col hover:overflow-y-none bg-[var(--pd-global-nav-bg)] border-[var(--pd-global-nav-bg-border)] border-r-[1px]"
  aria-label="AppNavigation">
  <NavItem href="/" tooltip="Dashboard" bind:meta={meta}>
    <div class="relative w-full">
      <div class="flex items-center w-full h-full">
        <DashboardIcon size={iconSize} />
      </div>
      <NewContentOnDashboardBadge />
    </div>
  </NavItem>
  {#each $navigationRegistry as navigationRegistryItem}
    <!-- This is a section -->
    {#if navigationRegistryItem.type === 'section' && navigationRegistryItem.enabled}
      {@const allItemsHidden = (navigationRegistryItem.items ?? []).every(item => item.hidden)}
      {#if !allItemsHidden}
        <NavSection tooltip={navigationRegistryItem.name}>
          <!-- svelte-ignore svelte_component_deprecated -->
          <svelte:component this={navigationRegistryItem.icon.iconComponent} size={iconSize} slot="icon" />

          {#if navigationRegistryItem.items}
            {#each navigationRegistryItem.items as item}
              <NavRegistryEntry entry={item} bind:meta={meta} />
            {/each}
          {/if}
        </NavSection>
      {/if}
    {:else if navigationRegistryItem.items && navigationRegistryItem.type === 'group'}
      <!-- This is a group, list all items from the entry -->
      {#each navigationRegistryItem.items as item}
        <NavRegistryEntry entry={item} bind:meta={meta} />
      {/each}
    {:else if navigationRegistryItem.type === 'entry'}
      <NavRegistryEntry entry={navigationRegistryItem} bind:meta={meta} />
    {/if}
  {/each}

  <div class="grow"></div>

  <NavItem
    href="/accounts"
    tooltip="Accounts"
    bind:meta={meta}
    onClick={event => window.showAccountsMenu(event.x, event.y)}>
    <AccountIcon size={iconSize} />
  </NavItem>

  <NavItem
    href="/preferences"
    tooltip="Settings"
    bind:meta={meta}
    onClick={() => clickSettings(meta.url.startsWith('/preferences'))}>
    <SettingsIcon size={iconSize} />
  </NavItem>
</nav>
