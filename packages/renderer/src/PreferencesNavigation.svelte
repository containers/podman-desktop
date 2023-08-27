<script lang="ts">
import { onMount } from 'svelte';
import { extensionInfos } from './stores/extensions';
import { configurationProperties } from './stores/configurationProperties';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../main/src/plugin/configuration-registry-constants';
import SettingsNavItem from './lib/preferences/SettingsNavItem.svelte';

export let meta;

let configProperties: Map<string, { id: string; title: string }>;

$: configProperties = new Map();
$: sectionExpanded = {};

onMount(async () => {
  configurationProperties.subscribe(value => {
    configProperties = value.reduce((map, property) => {
      if (property.scope !== CONFIGURATION_DEFAULT_SCOPE || ('boolean' === typeof property.hidden && !property.hidden))
        return map;

      let [parentLeftId] = property.parentId.split('.');

      if (map[parentLeftId] === undefined) {
        map[parentLeftId] = [];
      }

      let children = map[parentLeftId].find(item => item.id === property.parentId);
      if (children === undefined) {
        map[parentLeftId].push({ id: property.parentId, title: property.title });
      }
      return map;
    }, new Map());
  });
});
</script>

<nav
  class="z-1 w-[225px] min-w-[225px] shadow flex-col justify-between flex transition-all duration-500 ease-in-out bg-charcoal-700"
  aria-label="PreferencesNavigation">
  <div class="flex items-center">
    <div class="pt-4 px-5 mb-10">
      <p class="text-xl first-letter:uppercase">Settings</p>
    </div>
  </div>
  <div class="h-full overflow-hidden hover:overflow-y-auto" style="margin-bottom:auto">
    <SettingsNavItem title="Resources" href="/preferences/resources" bind:meta="{meta}" />

    <SettingsNavItem title="Proxy" href="/preferences/proxies" bind:meta="{meta}" />

    <SettingsNavItem title="Registries" href="/preferences/registries" bind:meta="{meta}" />

    <SettingsNavItem title="Authentication" href="/preferences/authentication-providers" bind:meta="{meta}" />

    <SettingsNavItem
      title="Extensions"
      href="/preferences/extensions"
      section="{true}"
      bind:meta="{meta}"
      bind:expanded="{sectionExpanded['extensionsCatalog']}" />
    {#if sectionExpanded['extensionsCatalog']}
      {#each $extensionInfos as extension}
        <SettingsNavItem
          title="{extension.displayName}"
          href="/preferences/extension/{extension.id}"
          child="{true}"
          bind:meta="{meta}" />
      {/each}
    {/if}

    <SettingsNavItem title="Desktop Extensions" href="/preferences/ddExtensions" bind:meta="{meta}" />

    <!-- Default configuration properties start -->
    {#each Object.entries(configProperties) as [configSection, configItems]}
      <SettingsNavItem
        title="{configSection}"
        href="/preferences/default/{configSection}"
        section="{configItems.length > 0}"
        bind:meta="{meta}"
        bind:expanded="{sectionExpanded[configSection]}" />
      {#if sectionExpanded[configSection]}
        {#each configItems.sort((a, b) => a.title.localeCompare(b.title)) as configItem}
          <SettingsNavItem
            title="{configItem.title}"
            href="/preferences/default/{configItem.id}"
            child="{true}"
            bind:meta="{meta}" />
        {/each}
      {/if}
    {/each}
    <!-- Default configuration properties end -->
  </div>
</nav>
