<script lang="ts">
import { SettingsNavItem } from '@podman-desktop/ui-svelte';
import type { TinroRouteMeta } from 'tinro';

import type { NavigationRegistryEntry } from './stores/navigation/navigation-registry';

export let title: string;
export let items: NavigationRegistryEntry[] | undefined;
export let meta: TinroRouteMeta;
</script>

<nav
  class="z-1 w-leftsidebar min-w-leftsidebar flex-col justify-between flex transition-all duration-500 ease-in-out bg-[var(--pd-secondary-nav-bg)] border-[var(--pd-global-nav-bg-border)] border-r-[1px]"
  aria-label={title + ' Navigation Bar'}>
  <div class="flex items-center">
    <div class="pt-4 px-3 mb-10">
      <p
        class="text-2xl font-semibold text-[color:var(--pd-secondary-nav-header-text)] border-l-[4px] border-transparent">
        {title}
      </p>
    </div>
  </div>
  <div class="h-full overflow-hidden hover:overflow-y-auto" style="margin-bottom:auto">
    {#each items ?? [] as item}
      <SettingsNavItem title={item.tooltip} href={item.link} selected={meta.url.startsWith(item.link)}
      ></SettingsNavItem>
    {/each}
  </div>
</nav>
