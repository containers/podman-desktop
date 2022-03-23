<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';

export let containers: Array<unknown>;

function copyRunInstructionToClipboard() {
  const text = copyText?.innerText;
  navigator.clipboard.writeText(text);
}

let copyText;

onMount(async () => {
  copyText = document.getElementById('noContainerCommandLine') as HTMLElement;
});
</script>

<div class="h-full min-w-full flex flex-col" class:hidden="{containers.length > 0}">
  <div class="pf-c-empty-state h-full">
    <div class="pf-c-empty-state__content">
      <i class="fas fa-cubes pf-c-empty-state__icon" aria-hidden="true"></i>
      <h1 class="pf-c-title pf-m-lg">No containers</h1>
      <div class="pf-c-empty-state__body">Run a first container using the following command line:</div>
      <div class="flex flex-row bg-gray-800 w-full items-center p-2 mt-2">
        <div id="noContainerCommandLine">podman run redhat/ubi8-micro echo hello world</div>
        <button title="Copy To Clipboard" class="mr-5" on:click="{() => copyRunInstructionToClipboard()}"
          ><Fa class="ml-3 h-5 w-5 cursor-pointer rounded-full text-3xl text-sky-800" icon="{faPaste}" /></button>
      </div>
    </div>
  </div>
</div>
