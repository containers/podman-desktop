<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { getPanelDetailColor } from '../color/color';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import NoLogIcon from '../ui/NoLogIcon.svelte';

export let providerInternalId: string = undefined;
export let connection: string = undefined;
export let logsTerminal: Terminal;
export let setNoLogs: () => void;
export let noLog: boolean;

$: noLogs = !!noLog;

logsTerminal.onLineFeed(() => {
  setNoLogs();
  noLogs = false;
});

// Log
let logsXtermDiv: HTMLDivElement;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;

// need to refresh logs when container is switched or state changes
let currentRouterPath: string;

async function refreshTerminal() {
  // missing element, return
  if (!logsXtermDiv) {
    console.log('missing xterm div, exiting...');
    return;
  }

  termFit = new FitAddon();
  logsTerminal.loadAddon(termFit);

  logsTerminal.open(logsXtermDiv);

  // disable cursor
  logsTerminal.write('\x1b[?25l');

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/container-connection/${providerInternalId}/${connection}/logs`) {
      termFit.fit();
    }
  });
  termFit.fit();
}

onMount(async () => {
  // Refresh the terminal on initial load
  await refreshTerminal();
  // Resize the terminal each time we change the div size
  resizeObserver = new ResizeObserver(entries => {
    termFit?.fit();
  });

  // Observe the terminal div
  resizeObserver.observe(logsXtermDiv);
});

onDestroy(() => {
  // Cleanup the observer on destroy
  resizeObserver?.unobserve(logsXtermDiv);
});
</script>

<EmptyScreen
  icon="{NoLogIcon}"
  title="No Log"
  message="Log output"
  hidden="{noLogs === false}"
  style="background-color: {getPanelDetailColor()}" />

<div
  aria-label="terminal"
  class="min-w-full flex flex-col"
  class:invisible="{noLogs === true}"
  class:h-0="{noLogs === true}"
  class:h-full="{noLogs === false}"
  style="background-color: {getPanelDetailColor()}"
  bind:this="{logsXtermDiv}">
</div>
