<script lang="ts">
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { SearchAddon } from '@xterm/addon-search';
import type { Terminal } from '@xterm/xterm';
import { onDestroy, onMount } from 'svelte';

interface Props {
  terminal: Terminal;
}

let { terminal }: Props = $props();

let searchAddon: SearchAddon | undefined;
let searchTerm: string = $state('');

let input: HTMLInputElement | undefined = $state();

onMount(() => {
  searchAddon = new SearchAddon();
  searchAddon.activate(terminal);
});

onDestroy(() => {
  searchAddon?.dispose();
});

function onKeyPressed(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    onSearchNext(true);
  }
}

function onSearchNext(incremental = false): void {
  searchAddon?.findNext(searchTerm, {
    incremental: incremental,
  });
}

function onSearchPrevious(incremental = false): void {
  searchAddon?.findPrevious(searchTerm, {
    incremental: incremental,
  });
}

function onSearch(event: Event): void {
  searchTerm = (event.target as HTMLInputElement).value;
  onSearchNext();
}

function onKeyUp(e: KeyboardEvent): void {
  if (e.ctrlKey && e.key === 'f') {
    input?.focus();
  }
}
</script>

<svelte:window
  on:keyup|preventDefault={onKeyUp}
/>
<div class="flex flex-row py-2 h-[40px] items-center">
  <div
    class="w-200px mx-4">
    <Input
      bind:element={input}
      placeholder="Find"
      aria-label="Find"
      onkeypress={onKeyPressed}
      oninput={onSearch}
      value={searchTerm}
    />
  </div>
  <div class="space-x-1">
    <button aria-label="Previous Match" class="p-2 rounded-sm hover:bg-[var(--pd-button-detailed-bg)]" onclick={(): void => onSearchPrevious(true)}>
      <Icon icon={faArrowUp}/>
    </button>
    <button aria-label="Next Match" class="p-2 rounded-sm hover:bg-[var(--pd-button-detailed-bg)]" onclick={(): void => onSearchNext(true)}>
      <Icon icon={faArrowDown}/>
    </button>
  </div>
</div>
