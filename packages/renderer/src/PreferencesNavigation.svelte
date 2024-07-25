<script lang="ts">
import { SettingsNavItem } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import type { TinroRouteMeta } from 'tinro';

import { CONFIGURATION_DEFAULT_SCOPE } from '../../main/src/plugin/configuration-registry-constants';
import { configurationProperties } from './stores/configurationProperties';

export let meta: TinroRouteMeta;

let configProperties: Map<string, { id: string; title: string }>;

$: configProperties = new Map();
let sectionExpanded: { [key: string]: boolean } = {};
$: sectionExpanded = {};

function sortItems(items: any): any[] {
  return items.sort((a: { title: string }, b: { title: any }) => a.title.localeCompare(b.title));
}

onMount(async () => {
  configurationProperties.subscribe(value => {
    configProperties = value
      .filter(property => property.scope === CONFIGURATION_DEFAULT_SCOPE)
      .filter(property => !property.hidden)
      .reduce((map: any, property) => {
        let [parentLeftId] = property.parentId.split('.');

        if (map[parentLeftId] === undefined) {
          map[parentLeftId] = [];
        }

        let children = map[parentLeftId].find((item: any) => item.id === property.parentId);
        if (children === undefined) {
          map[parentLeftId].push({ id: property.parentId, title: property.title });
        }
        return map;
      }, new Map());
  });
});
</script>

<nav
  class="z-1 w-leftsidebar min-w-leftsidebar shadow flex-col justify-between flex transition-all duration-500 ease-in-out bg-[var(--pd-secondary-nav-bg)]"
  aria-label="PreferencesNavigation">
  <div class="flex items-center">
    <div class="pt-4 px-3 mb-10">
      <p class="text-2xl font-bold text-[color:var(--pd-secondary-nav-header-text)] border-l-[4px] border-transparent">
        Settings
      </p>
    </div>
  </div>
  <div class="h-full overflow-hidden hover:overflow-y-auto" style="margin-bottom:auto">
    {#each [{ title: 'Resources', href: '/preferences/resources' }, { title: 'Proxy', href: '/preferences/proxies' }, { title: 'Registries', href: '/preferences/registries' }, { title: 'Authentication', href: '/preferences/authentication-providers' }, { title: 'CLI Tools', href: '/preferences/cli-tools' }, { title: 'Kubernetes', href: '/preferences/kubernetes-contexts' }] as navItem}
      <SettingsNavItem title={navItem.title} href={navItem.href} selected={meta.url === navItem.href} />
    {/each}

    <!-- Default configuration properties start -->
    {#each Object.entries(configProperties) as [configSection, configItems]}
      <SettingsNavItem
        title={configSection}
        href="/preferences/default/{configSection}"
        section={configItems.length > 0}
        selected={meta.url === `/preferences/default/${configSection}`}
        bind:expanded={sectionExpanded[configSection]} />
      {#if sectionExpanded[configSection]}
        {#each sortItems(configItems) as configItem}
          <SettingsNavItem
            title={configItem.title}
            href="/preferences/default/{configItem.id}"
            child={true}
            selected={meta.url === `/preferences/default/${configItem.id}`} />
        {/each}
      {/if}
    {/each}
    <!-- Default configuration properties end -->
  </div>
</nav>
