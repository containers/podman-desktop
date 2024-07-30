<svelte:options runes={true} />

<script lang="ts">
<<<<<<< HEAD
import { Tooltip } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import type { TinroRouteMeta } from 'tinro';

=======
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';
import type { TinroRouteMeta } from 'tinro';

import Webviews from '/@/lib/webview/Webviews.svelte';
import { webviews } from '/@/stores/webviews';
import type { ImageInfo } from '/@api/image-info';

>>>>>>> c556038c (chore: use dropdownmenu component for always on buddy widget popup menu)
import AuthActions from './lib/authentication/AuthActions.svelte';
import { CommandRegistry } from './lib/CommandRegistry';
import NewContentOnDashboardBadge from './lib/dashboard/NewContentOnDashboardBadge.svelte';
import AccountIcon from './lib/images/AccountIcon.svelte';
import DashboardIcon from './lib/images/DashboardIcon.svelte';
import SettingsIcon from './lib/images/SettingsIcon.svelte';
import NavItem from './lib/ui/NavItem.svelte';
import NavRegistryEntry from './lib/ui/NavRegistryEntry.svelte';
import NavSection from './lib/ui/NavSection.svelte';
import { navigationRegistry } from './stores/navigation/navigation-registry';

<<<<<<< HEAD
let {
  exitSettingsCallback,
  meta = $bindable(),
}: {
  exitSettingsCallback: () => void;
  meta: TinroRouteMeta;
} = $props();
=======
let podInfoSubscribe: Unsubscriber;
let containerInfoSubscribe: Unsubscriber;
let imageInfoSubscribe: Unsubscriber;
let volumeInfoSubscribe: Unsubscriber;
let contextsSubscribe: Unsubscriber;
let nodesSubscribe: Unsubscriber;
let deploymentsSubscribe: Unsubscriber;
let persistentVolumeClaimsSubscribe: Unsubscriber;
let servicesSubscribe: Unsubscriber;
let ingressesSubscribe: Unsubscriber;
let routesSubscribe: Unsubscriber;
let configmapsSubscribe: Unsubscriber;
let secretsSubscribe: Unsubscriber;
let combinedInstalledExtensionsSubscribe: Unsubscriber;

let podCount = '';
let containerCount = '';
let imageCount = '';
let volumeCount = '';
let configmapsCount = 0;
let secretsCount = 0;
let configmapSecretsCount = '';
let persistentVolumeClaimsCount = '';
let contextCount = 0;
let deploymentCount = '';
let nodeCount = '';
let serviceCount = '';
let ingressesCount = 0;
let routesCount = 0;
let ingressesRoutesCount = '';
let extensionCount = '';
let authActions: AuthActions;
let outsideWindow: HTMLDivElement;

const imageUtils = new ImageUtils();
export let exitSettingsCallback: () => void;
>>>>>>> c556038c (chore: use dropdownmenu component for always on buddy widget popup menu)

const iconSize = '22';

let authActions = $state<AuthActions>();
let outsideWindow = $state<HTMLDivElement>();

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

  <div bind:this={outsideWindow}>
    <NavItem href="/accounts" tooltip="" bind:meta={meta} onClick={event => authActions?.onButtonClick(event)}>
      <Tooltip bottomRight tip="Accounts">
<<<<<<< HEAD
        <AccountIcon size={iconSize} />
=======
        <Fa class="h-6 w-6 fa-light" icon={faCircleUser} size="2x" style="fa-light" />
>>>>>>> c556038c (chore: use dropdownmenu component for always on buddy widget popup menu)
      </Tooltip>
      <AuthActions bind:this={authActions} outsideWindow={outsideWindow} />
    </NavItem>
  </div>

  <NavItem
    href="/preferences"
    tooltip="Settings"
    bind:meta={meta}
    onClick={() => clickSettings(meta.url.startsWith('/preferences'))}>
    <SettingsIcon size={iconSize} />
  </NavItem>
</nav>
