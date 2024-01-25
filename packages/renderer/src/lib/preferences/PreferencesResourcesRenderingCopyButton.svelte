<script lang="ts">
import { onMount } from 'svelte';
import Fa from 'svelte-fa';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../ui/Tooltip.svelte';

let url: string | undefined;

export let path: string;

onMount(async () => {
  try {
    const platform = await window.getOsPlatform();

    let prefix = '';
    if (platform === 'win32') {
      prefix = 'npipe';
    } else {
      prefix = 'unix';
    }

    url = `${prefix}://${path}`;
  } catch (e) {
    console.error('unable to create a socket url from socketPath.', e);
    url = undefined;
  }
});

function copyResourceSocketAddrToClipboard() {
  window.clipboardWriteText(url!);
}
</script>

{#if url}
  <Tooltip tip="Copy to Clipboard" bottom>
    <button
      title="Copy To Clipboard"
      class="ml-5"
      aria-label="Copy To Clipboard"
      on:click="{() => copyResourceSocketAddrToClipboard()}">
      <Fa icon="{faPaste}" />
    </button>
  </Tooltip>
{/if}
