<script lang="ts">
import type { ContainerInfoUI } from './container/ContainerInfoUI';
import { router } from 'tinro';
import { onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { TerminalSettings } from '../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from './color/color';

import { isMultiplexedLog } from './stream/stream-utils';

export let container: ContainerInfoUI;

// Log
let logsXtermDiv: HTMLDivElement;
let logsContainer;
// logs has been initialized
let logsReady = false;
let noLogs = true;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;

// need to refresh logs when container is switched
$: {
  if (logsContainer?.id !== container.id || logsContainer?.state != container.state) {
    logsTerminal?.clear();
  }
  logsContainer = container;
}

let currentRouterPath: string;

let logsTerminal;

function callback(name: string, data: string) {
  if (name === 'first-message') {
    noLogs = false;
    // clear on the first message
    logsTerminal?.clear();
  } else if (name === 'data') {
    noLogs = false;

    if (isMultiplexedLog(data)) {
      logsTerminal?.write(data.substring(8) + '\r');
    } else {
      logsTerminal?.write(data + '\r');
    }
  }
}

async function fetchContainerLogs() {
  // grab logs of the container
  await window.logsContainer(container.engineId, container.id, callback);
  logsReady = true;
}

router.subscribe(async route => {
  currentRouterPath = route.path;
  if (route.path.endsWith('/logs')) {
    await refreshTerminal();
    fetchContainerLogs();
  }
});

async function refreshTerminal() {
  // missing element, return
  if (!logsXtermDiv) {
    console.log('missing xterm div, exiting...');
    return;
  }
  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  logsTerminal = new Terminal({
    fontSize,
    lineHeight,
    disableStdin: true,
    theme: {
      background: getPanelDetailColor(),
    },
    convertEol: true,
  });
  termFit = new FitAddon();
  logsTerminal.loadAddon(termFit);

  logsTerminal.open(logsXtermDiv);
  // disable cursor
  logsTerminal.write('\x1b[?25l');

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/containers/${container.id}/logs`) {
      termFit.fit();
    }
  });
  termFit.fit();
}

onMount(async () => {
  // Refresh the terminal on initial load
  refreshTerminal();

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

{#if logsReady}
  <div
    class="h-full min-w-full flex flex-col"
    class:hidden="{noLogs === false}"
    style="background-color: {getPanelDetailColor()}">
    <div class="pf-c-empty-state h-full">
      <div class="pf-c-empty-state__content">
        <i class="fas fa-terminal pf-c-empty-state__icon" aria-hidden="true"></i>

        <h1 class="pf-c-title pf-m-lg">No Log</h1>

        <div class="pf-c-empty-state__body">Log output of {container.name}</div>
      </div>
    </div>
  </div>
{/if}

<div
  class="flex flex-col"
  style="background-color: {getPanelDetailColor()}"
  class:h-full="{noLogs === false}"
  class:min-w-full="{noLogs === false}"
  bind:this="{logsXtermDiv}">
</div>
