<script lang="ts">
import { SettingsNavItem } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import type { TinroRouteMeta } from 'tinro';

import { CONFIGURATION_DEFAULT_SCOPE } from '/@api/configuration/constants.js';
import { ExperimentalSettings } from '/@api/docker-compatibility-info';

import { configurationProperties } from './stores/configurationProperties';

interface Props {
  meta: TinroRouteMeta;
}

interface NavItem {
  id: string;
  title: string;
}

let { meta }: Props = $props();

let dockerCompatibilityEnabled = $state(false);
let configProperties: Map<string, NavItem[]> = $state(new Map<string, NavItem[]>());
let sectionExpanded: { [key: string]: boolean } = $state({});

function updateDockerCompatibility(): void {
  window
    .getConfigurationValue<boolean>(`${ExperimentalSettings.SectionName}.${ExperimentalSettings.Enabled}`)
    .then(result => {
      if (result !== undefined) {
        dockerCompatibilityEnabled = result;
      }
    })
    .catch((err: unknown) =>
      console.error(
        `Error getting configuration value ${ExperimentalSettings.SectionName}.${ExperimentalSettings.Enabled}`,
        err,
      ),
    );
}

function sortItems(items: NavItem[]): NavItem[] {
  return items.toSorted((a, b) => a.title.localeCompare(b.title));
}

onMount(() => {
  return configurationProperties.subscribe(value => {
    // update compatibility
    updateDockerCompatibility();

    // update config properties
    configProperties = value.reduce((map, current) => {
      // filter on default scope
      if (current.scope !== CONFIGURATION_DEFAULT_SCOPE) return map;

      // do not include hidden property
      if (current.hidden) return map;

      let [parentLeftId] = current.parentId.split('.');
      const array: NavItem[] = map.get(parentLeftId) ?? [];

      let children = array.find((item: NavItem) => item.id === current.parentId);
      if (children === undefined) {
        map.set(parentLeftId, [...array, { id: current.parentId, title: current.title }]);
      }
      return map;
    }, new Map<string, NavItem[]>());
  });
});
</script>

<nav
  class="z-1 w-leftsidebar min-w-leftsidebar flex-col justify-between flex transition-all duration-500 ease-in-out bg-[var(--pd-secondary-nav-bg)] border-[var(--pd-global-nav-bg-border)] border-r-[1px]"
  aria-label="PreferencesNavigation">
  <div class="flex items-center">
    <div class="pt-4 px-3 mb-5">
      <p
        class="text-xl font-semibold text-[color:var(--pd-secondary-nav-header-text)] border-l-[4px] border-transparent">
        Settings
      </p>
    </div>
  </div>
  <div class="h-full overflow-hidden hover:overflow-y-auto" style="margin-bottom:auto">
    {#each [{ title: 'Resources', href: '/preferences/resources', visible: true }, { title: 'Proxy', href: '/preferences/proxies', visible: true }, { title: 'Docker Compatibility', href: '/preferences/docker-compatibility', visible: dockerCompatibilityEnabled }, { title: 'Registries', href: '/preferences/registries', visible: true }, { title: 'Authentication', href: '/preferences/authentication-providers', visible: true }, { title: 'CLI Tools', href: '/preferences/cli-tools', visible: true }, { title: 'Kubernetes', href: '/preferences/kubernetes-contexts', visible: true }] as navItem}
      {#if navItem.visible}
        <SettingsNavItem title={navItem.title} href={navItem.href} selected={meta.url === navItem.href} />
      {/if}
    {/each}

    <!-- Default configuration properties start -->
    {#each configProperties as [configSection, configItems] (configSection)}
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
