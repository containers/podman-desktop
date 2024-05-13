<script lang="ts">
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

export let clipboardData: string;
export let title: string;

function copyTextToClipboard() {
  window.clipboardWriteText(clipboardData);
}
</script>

<div class="float-right">
  <Tooltip bottom>
    <svelte:fragment slot="item">
      <button
        title="Copy To Clipboard"
        class="ml-5 {$$props.class || ''}"
        aria-label="Copy To Clipboard"
        on:click="{() => copyTextToClipboard()}">
        <Fa icon="{faPaste}" />
      </button>
    </svelte:fragment>
    <svelte:fragment slot="tip">
      <div class="inline-block py-2 px-4 rounded-md bg-charcoal-800 text-xs text-white" aria-label="tooltip">
        Copy to Clipboard
      </div>
    </svelte:fragment>
  </Tooltip>
</div>
<div class="mt-1 my-auto text-xs truncate {$$props.class || ''}" aria-label="{title} copy to clipboard" title="{title}">
  {title}
</div>
