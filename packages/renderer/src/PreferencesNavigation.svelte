<script lang="ts">
import { onMount } from 'svelte';
import { Buffer } from 'buffer';
import { extensionInfos } from './stores/extensions';
import { configurationProperties } from './stores/configurationProperties';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../main/src/plugin/configuration-registry-constants';
import type { ProviderInfo } from '../../main/src/plugin/api/provider-info';
import { providerInfos } from './stores/providers';

export let exitSettingsCallback: () => void;
export let meta;

let extensions, configProperties: Map<string, { id: string; title: string }>;

$: extensions = [];
$: configProperties = new Map();
$: sectionExpanded = {};

function toggleSection(provider: string) {
  sectionExpanded[provider] = sectionExpanded[provider] === undefined ? true : !sectionExpanded[provider];
}

onMount(async () => {
  extensionInfos.subscribe(value => {
    extensions = value;
  });
  configurationProperties.subscribe(value => {
    configProperties = value
      .filter(property => property.scope === CONFIGURATION_DEFAULT_SCOPE)
      .filter(property => !property.hidden)
      .reduce((map, property) => {
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

$: isCurrentPage = (pathParam: string): boolean => meta.url === pathParam;
$: addExpandedClass = (section: string): string => (sectionExpanded[section] ? 'pf-m-expanded' : '');
$: addCurrentClass = (pathParam: string): string =>
  isCurrentPage(pathParam) ? 'dark:text-white pf-m-current' : 'dark:text-gray-400';
$: isAriaExpanded = (section: string): boolean => (sectionExpanded[section] ? true : false);
$: addSectionHiddenClass = (section: string): string => (sectionExpanded[section] ? '' : 'hidden');
$: addExpandableClass = (provider: ProviderInfo): string =>
  provider.containerConnections.length > 0 || provider.kubernetesConnections.length > 0 ? 'pf-m-expandable' : '';
$: addHiddenClass = (provider: ProviderInfo): string =>
  provider.containerConnections.length > 0 || provider.kubernetesConnections.length > 0 ? '' : 'hidden';
</script>

<nav
  class="pf-c-nav z-0 group w-52 shadow flex-col justify-between flex transition-all duration-500 ease-in-out"
  style="background-color: rgb(39 39 42 / var(--tw-bg-opacity))"
  aria-label="Global">
  <div class="flex items-center">
    <div class="pt-5 px-5 mb-10">
      <p class="text-xl first-letter:uppercase">Settings</p>
    </div>
  </div>
  <ul class="pf-c-nav__list h-full overflow-auto">
    <!-- Resources configuration start -->
    <li
      class="pf-c-nav__item flex w-full justify-between {addCurrentClass(
        '/preferences/resources',
      )} hover:text-gray-300 cursor-pointer items-center">
      <a href="/preferences/resources" id="configuration-section-resources" class="pf-c-nav__link">
        <div class="flex items-center">
          <span class="hidden md:block group-hover:block">Resources</span>
        </div>
      </a>
    </li>
    <!-- Resources configuration end -->

    <!-- Proxies configuration start -->
    <li
      class="pf-c-nav__item flex w-full justify-between {addCurrentClass(
        '/preferences/proxies',
      )} hover:text-gray-300 cursor-pointer items-center">
      <a href="/preferences/proxies" id="configuration-section-proxy" class="pf-c-nav__link">
        <div class="flex items-center">
          <span class="hidden md:block group-hover:block">Proxy</span>
        </div>
      </a>
    </li>
    <!-- Proxies configuration end -->

    <!-- Registries configuration start -->
    <li
      class="pf-c-nav__item flex w-full justify-between {addCurrentClass(
        '/preferences/registries',
      )} hover:text-gray-300 cursor-pointer items-center">
      <a href="/preferences/registries" id="configuration-section-registries" class="pf-c-nav__link">
        <div class="flex items-center">
          <span class="hidden md:block group-hover:block">Registries</span>
        </div>
      </a>
    </li>
    <!-- Registries configuration end -->

    <!-- Extensions catalog configuration start -->
    <li
      class="pf-c-nav__item pf-m-expandable {addExpandedClass('extensionsCatalog')} {addCurrentClass(
        '/preferences/extensions',
      )} hover:text-gray-300 cursor-pointer items-center">
      <a
        href="/preferences/extensions"
        class="pf-c-nav__link text-left"
        id="configuration-section-extensions-catalog"
        aria-expanded="{isAriaExpanded('extensionsCatalog')}"
        on:click="{() => toggleSection('extensionsCatalog')}">
        Extensions
        <span class="pf-c-nav__toggle">
          <span class="pf-c-nav__toggle-icon">
            <i class="fas fa-angle-right" aria-hidden="true"></i>
          </span>
        </span>
      </a>
      <section class="pf-c-nav__subnav {addSectionHiddenClass('extensionsCatalog')}">
        <ul class="pf-c-nav__list">
          {#each extensions as extension}
            <li class="pf-c-nav__item {addCurrentClass(`/preferences/extension/${extension.name}`)} ">
              <a
                href="/preferences/extension/{extension.name}"
                id="configuration-section-extensions-catalog-{extension.name.toLowerCase()}"
                class="pf-c-nav__link">{extension.displayName}</a>
            </li>
          {/each}
        </ul>
      </section>
    </li>
    <!-- Extensions catalog configuration end -->

    <!-- Docker desktop extensions configuration start -->
    <li
      class="pf-c-nav__item flex w-full justify-between {addCurrentClass(
        '/preferences/ddExtensions',
      )} hover:text-gray-300 cursor-pointer items-center">
      <a href="/preferences/ddExtensions" id="configuration-section-docker-desktop-extensions" class="pf-c-nav__link">
        <div class="flex items-center">
          <span class="hidden md:block group-hover:block">Desktop Extensions</span>
        </div>
      </a>
    </li>
    <!-- Docker desktop extensions configuration start -->

    <!-- Default configuration properties start -->
    {#each Object.entries(configProperties) as [configSection, configItems]}
      <li
        class="pf-c-nav__item pf-m-expandable {addExpandedClass(configSection)} {addCurrentClass(
          `/preferences/default/${configSection}`,
        )} hover:text-gray-300 cursor-pointer items-center">
        <a
          class="pf-c-nav__link"
          id="configuration-section-{configSection.toLowerCase()}"
          aria-expanded="{isAriaExpanded(configSection)}"
          href="/preferences/default/{configSection}">
          <span class="hidden md:block group-hover:block mr-5 capitalize">{configSection}</span>
          {#if configItems.length > 0}
            <span class="pf-c-nav__toggle">
              <span class="pf-c-nav__toggle-icon" on:click="{() => toggleSection(configSection)}">
                <i class="fas fa-angle-right" aria-hidden="true"></i>
              </span>
            </span>
          {/if}
        </a>
        <section class="pf-c-nav__subnav {addSectionHiddenClass(configSection)}">
          <ul class="pf-c-nav__list">
            {#each configItems as configItem}
              <li class="pf-c-nav__item {addCurrentClass(`/preferences/default/${configItem.id}`)}">
                <a
                  href="/preferences/default/{configItem.id}"
                  id="configuration-section-{configSection.toLowerCase()}-{configItem.title.toLowerCase()}"
                  class="pf-c-nav__link">{configItem.title}</a>
              </li>
            {/each}
          </ul>
        </section>
      </li>
    {/each}
    <!-- Default configuration properties end -->
  </ul>

  <ul class="pf-c-nav__list">
    <li
      class="pf-c-nav__item pf-c-nav__link flex w-full justify-between dark:text-gray-400 hover:text-gray-300 cursor-pointer items-center"
      on:click="{exitSettingsCallback}">
      <div class="flex items-center">
        <i class="fa fa-angle-left"></i>
        <span class="hidden md:block group-hover:block mx-2">Exit settings</span>
      </div>
    </li>
  </ul>
</nav>
