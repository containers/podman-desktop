<script lang="ts">
import SettingsNavItem from './lib/preferences/SettingsNavItem.svelte';
import type { TinroRouteMeta } from 'tinro';
import { currentPage } from './stores/breadcrumb';
import { onMount } from 'svelte';

export let meta: TinroRouteMeta;

let configProperties: Map<string, { id: string; title: string }>;

$: configProperties = new Map();
let sectionExpanded: { [key: string]: boolean } = {};
$: sectionExpanded = {};

// Create a list of objects for components that has displayName and id for pods, deployments and replicasets.
let components = [
  { displayName: 'Pods', id: 'pods' },
  { displayName: 'Deployments', id: 'deployments' },
  { displayName: 'Replica Sets', id: 'replicasets' },
];

onMount(() => {
  // Take the current page and make sure that it's expanded.
  // get the current page from window.location.href
  let current = window.location.href.split('/');
  let section = current[current.length - 2];
  console.log(section);
  if (currentPage) {
    sectionExpanded[section] = true;
  }

  sectionExpanded['components'] = true;
});
</script>

<nav
  class="z-1 w-[225px] min-w-[225px] shadow flex-col justify-between flex transition-all duration-500 ease-in-out bg-charcoal-700"
  aria-label="PreferencesNavigation">
  <div class="flex items-center">
    <div class="pt-4 px-5 mb-10">
      <p class="text-xl first-letter:uppercase">Kubernetes</p>
    </div>
  </div>
  <div class="h-full overflow-hidden hover:overflow-y-auto" style="margin-bottom:auto">
    <SettingsNavItem
      title="Components"
      href="/kubernetes/components/pods"
      section="{true}"
      bind:meta="{meta}"
      bind:expanded="{sectionExpanded['components']}" />
    {#if sectionExpanded['components']}
      {#each components as component}
        <SettingsNavItem
          title="{component.displayName}"
          href="/kubernetes/components/{component.id}"
          child="{true}"
          bind:meta="{meta}" />
      {/each}
    {/if}
  </div>
</nav>
