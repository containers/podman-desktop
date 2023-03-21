<script lang="ts">
import { afterUpdate, onMount } from 'svelte';
import { contributions } from '../../stores/contribs';

export let name: string;
let source;
let arch;
let hostname;
let platform;

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

window.events?.receive('dev-tools:open-extension', extensionId => {
  const extensionElement = document.getElementById(`dd-webview-${extensionId}`);

  if (extensionElement) {
    (extensionElement as any).openDevTools();
  }
});
</script>

{#if source && preloadPath}
  <webview
    id="dd-webview-{webviewId}"
    src="https://developers.redhat.com/"
    preload="{preloadPath}"
    style="height: 100%; width: 100%"></webview>
{/if}
