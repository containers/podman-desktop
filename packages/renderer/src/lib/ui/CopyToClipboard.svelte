<script lang="ts">
import Fa from 'svelte-fa';
import Tooltip from './Tooltip.svelte';
import { faPaste } from '@fortawesome/free-solid-svg-icons';

export let clipboardData: string;
export let title: string;

function copyTextToClipboard() {
  window.clipboardWriteText(clipboardData);
}
</script>

<div class="float-right">
  <Tooltip tip="Copy to Clipboard" bottom>
    <button
      title="Copy To Clipboard"
      class="ml-5 {$$props.class || ''}"
      aria-label="Copy To Clipboard"
      on:click="{() => copyTextToClipboard()}">
      <Fa icon="{faPaste}" />
    </button>
  </Tooltip>
</div>
<div class="mt-1 my-auto text-xs truncate {$$props.class || ''}" aria-label="{title} copy to clipboard" title="{title}">
  {title}
</div>
