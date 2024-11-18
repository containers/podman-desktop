<script lang="ts">
import { faEraser } from '@fortawesome/free-solid-svg-icons';
import type { Terminal } from '@xterm/xterm';
import Fa from 'svelte-fa';

const { terminal }: { terminal: Terminal } = $props();

function clear(): void {
  terminal.clear();
}
</script>

<div class="absolute top-0 right-2 px-1 z-50 m-1 opacity-50 space-x-1">
  <button title="Clear logs" onclick={clear} class="">
    <Fa
      class="cursor-pointer rounded-full bg-[var(--pd-button-disabled)] min-h-8 w-8 p-1.5 hover:bg-[var(--pd-button-primary-hover-bg)]"
      icon={faEraser}
    />
  </button>
</div>
