<script lang="ts">
import { afterUpdate, onMount } from 'svelte';
import { subviews } from '../../stores/subviews';
import Route from '../../Route.svelte';

export let id: string;
let source: string | undefined;
let arch: string;
let hostname: string;
let platform: string;

let preloadPath: string;
$: currentSubview = $subviews.find(subview => subview.id === id);

$: webviewId = id.replaceAll(' ', '-');

afterUpdate(() => {
  console.log('contribution', currentSubview);
  source = currentSubview?.source;
});

onMount(async () => {
  // grab hostname, arch and platform
  arch = await window.getOsArch();
  hostname = await window.getOsHostname();
  platform = await window.getOsPlatform();
  preloadPath = await window.getDDPreloadPath();
  source = currentSubview?.source;
});

window.events?.receive('dev-tools:open-extension', (extensionId: any) => {
  const extensionElement = document.getElementById(`dd-webview-${extensionId}`);

  if (extensionElement) {
    (extensionElement as any).openDevTools();
  }
});
</script>

{#if source && preloadPath}
  <Route path="/*" breadcrumb="{id}">
    <webview
      id="dd-webview-{webviewId}"
      src="{source}?extensionName={currentSubview?.extensionId}&arch={arch}&hostname={hostname}&platform={platform}&vmServicePort={currentSubview?.vmServicePort}"
      preload="{preloadPath}"
      style="height: 100%; width: 100%"></webview>
  </Route>
{/if}
