<script lang="ts">
import { afterUpdate, onMount } from 'svelte';
import { contributions } from '../../stores/contribs';

export let name: string;
let source;

let preloadPath: string;
$: currentContrib = $contributions.find(contrib => contrib.name === name);

afterUpdate(() => {
  console.log('contribution', currentContrib);
  source = currentContrib?.uiUri;
});

onMount(async () => {
  preloadPath = await window.getDDPreloadPath();
  source = currentContrib?.uiUri;
});
</script>

{#if source && preloadPath}
  <webview
    id="my-webview-{name}"
    src="{source}?extensionName={currentContrib.extensionId}"
    preload="{preloadPath}"
    style="height: 100%; width: 100%"></webview>
{/if}
