<svelte:options runes={true} />

<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { TinroRouteMeta } from 'tinro';

import { NavigationPage } from '/@api/navigation-page';

import { AppearanceSettings } from '../../main/src/plugin/appearance-settings';
import AuthActions from './lib/authentication/AuthActions.svelte';
import { CommandRegistry } from './lib/CommandRegistry';
import NewContentOnDashboardBadge from './lib/dashboard/NewContentOnDashboardBadge.svelte';
import AccountIcon from './lib/images/AccountIcon.svelte';
import DashboardIcon from './lib/images/DashboardIcon.svelte';
import SettingsIcon from './lib/images/SettingsIcon.svelte';
import NavItem from './lib/ui/NavItem.svelte';
import NavRegistryEntry from './lib/ui/NavRegistryEntry.svelte';
import { handleNavigation } from './navigation';
import { onDidChangeConfiguration } from './stores/configurationProperties';
import { navigationRegistry } from './stores/navigation/navigation-registry';

let { exitSettingsCallback, meta = $bindable() }: { exitSettingsCallback: () => void; meta: TinroRouteMeta } = $props();

let authActions = $state<AuthActions>();
let outsideWindow = $state<HTMLDivElement>();
let iconWithTitle = $state(false);

const iconSize = '22';
const NAV_BAR_LAYOUT = `${AppearanceSettings.SectionName}.${AppearanceSettings.NavigationAppearance}`;

onDidChangeConfiguration.addEventListener(NAV_BAR_LAYOUT, onDidChangeConfigurationCallback);

let minNavbarWidth = $state('min-w-leftnavbar');

$effect(() => {
  minNavbarWidth = iconWithTitle ? 'min-w-fit' : 'min-w-leftnavbar';
});

onMount(async () => {
  const commandRegistry = new CommandRegistry();
  commandRegistry.init();
  iconWithTitle = (await window.getConfigurationValue(NAV_BAR_LAYOUT)) === 'icon + title';
});

onDestroy(() => {
  onDidChangeConfiguration.removeEventListener(NAV_BAR_LAYOUT, onDidChangeConfigurationCallback);
});

function handleClick(): void {
  if (meta.url.startsWith('/preferences')) {
    exitSettingsCallback();
  } else {
    handleNavigation({ page: NavigationPage.RESOURCES });
  }
}

function onDidChangeConfigurationCallback(e: Event): void {
  if ('detail' in e) {
    const detail = e.detail as { key: string; value: string };
    if (NAV_BAR_LAYOUT === detail?.key) {
      iconWithTitle = detail.value === 'icon + title';
    }
  }
}
</script>

<svelte:window />
<nav
  class="group w-leftnavbar {minNavbarWidth} flex flex-col hover:overflow-y-none bg-[var(--pd-global-nav-bg)] border-[var(--pd-global-nav-bg-border)] border-r-[1px]"
  aria-label="AppNavigation">
  <NavItem href="/" tooltip="Dashboard" bind:meta={meta} iconWithTitle={iconWithTitle}>
    <div class="relative w-full">
      <div class="flex flex-col items-center w-full h-full">
        <div class="flex items-center w-fit h-full relative">
          <DashboardIcon size={iconSize} />
          <NewContentOnDashboardBadge />
        </div>
        {#if iconWithTitle}
          <div class="text-xs text-center ml-[2px]">
            Dashboard
          </div>
        {/if}
      </div>
    </div>
  </NavItem>
  {#each $navigationRegistry as navigationRegistryItem}
    {#if navigationRegistryItem.items && navigationRegistryItem.type === 'group'}
      <!-- This is a group, list all items from the entry -->
      {#each navigationRegistryItem.items as item}
        <NavRegistryEntry entry={item} bind:meta={meta} iconWithTitle={iconWithTitle} />
      {/each}
    {:else if navigationRegistryItem.type === 'entry' || navigationRegistryItem.type === 'submenu'}
      <NavRegistryEntry entry={navigationRegistryItem} bind:meta={meta} iconWithTitle={iconWithTitle} />
    {/if}
  {/each}

  <div class="grow"></div>

  <div bind:this={outsideWindow}>
    <NavItem href="/accounts" tooltip="" bind:meta={meta} onClick={event => authActions?.onButtonClick(event)}>
      <Tooltip bottomRight tip="Accounts">
        <div class="flex flex-col items-center w-full h-full">
          <AccountIcon size={iconSize} />
          {#if iconWithTitle}
            <div class="text-xs text-center ml-[2px]">
              Accounts
            </div>
          {/if}
        </div>
      </Tooltip>
      <AuthActions bind:this={authActions} outsideWindow={outsideWindow} />
    </NavItem>
  </div>

  <NavItem href="/preferences" tooltip="Settings" bind:meta={meta} onClick={handleClick}>
    <SettingsIcon size={iconSize} />
    {#if iconWithTitle}
      <div class="text-xs text-center ml-[2px]">
        Settings
      </div>
    {/if}
  </NavItem>
</nav>
