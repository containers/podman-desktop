<script lang="ts">
import { afterUpdate, onMount } from 'svelte';

import Route from '../../Route.svelte';
import { contributions } from '../../stores/contribs';

export let name: string;
let source: string | undefined;
let arch: string;
let hostname: string;
let platform: string;

let preloadPath: string;
$: currentContrib = $contributions.find(contrib => contrib.name === name);

$: webviewId = name.replaceAll(' ', '-');

afterUpdate(() => {
  console.log('contribution', currentContrib);
  source = currentContrib?.uiUri;
});

onMount(async () => {
  // grab hostname, arch and platform
  arch = await window.getOsArch();
  hostname = await window.getOsHostname();
  platform = await window.getOsPlatform();
  preloadPath = await window.getDDPreloadPath();
  source = currentContrib?.uiUri;
});

window.events?.receive('dev-tools:open-extension', (extensionId: any) => {
  const extensionElement = document.getElementById(`dd-webview-${extensionId}`);

  if (extensionElement) {
    (extensionElement as any).openDevTools();
  }
});
</script>

{#if source && preloadPath}
  <Route path="/*" breadcrumb={name}>
    <webview
      id="dd-webview-{webviewId}"
      src="{source}?extensionName={currentContrib?.extensionId}&arch={arch}&hostname={hostname}&platform={platform}&vmServicePort={currentContrib?.vmServicePort}"
      preload={preloadPath}
      style="height: 100%; width: 100%"></webview>
  </Route>
{/if}
