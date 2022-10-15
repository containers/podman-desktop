<script lang="ts">
import type { ContainerInfoUI } from './container/ContainerInfoUI';
import { router } from 'tinro';
import { onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { TerminalSettings } from '../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from './color/color';

export let container: ContainerInfoUI;

let logsXtermDiv: HTMLDivElement;

let logsContainer;

// logs has been initialized
let logsReady = false;
let noLogs = true;

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
    const printHelp = data.charCodeAt(0);
    // 1: STDOUT
    // 2: STDERR
    logsTerminal?.write(data.substring(8) + '\r');
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
  const fitAddon = new FitAddon();
  logsTerminal.loadAddon(fitAddon);

  logsTerminal.open(logsXtermDiv);
  // disable cursor
  logsTerminal.write('\x1b[?25l');

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/containers/${container.id}/logs`) {
      fitAddon.fit();
    }
  });
  fitAddon.fit();
}
onMount(async () => {
  refreshTerminal();
});
</script>

<div
  class="flex flex-col h-full"
  style="background-color: {getPanelDetailColor()}"
  class:hidden="{noLogs === true}"
  bind:this="{logsXtermDiv}">
</div>
<div
  class="h-full min-w-full flex flex-col"
  class:hidden="{logsReady && noLogs === false}"
  style="background-color: {getPanelDetailColor()}">
  <div class="pf-c-empty-state h-full">
    <div class="pf-c-empty-state__content">
      <i class="fas fa-terminal pf-c-empty-state__icon" aria-hidden="true"></i>

      <h1 class="pf-c-title pf-m-lg">No Log</h1>

      <div class="pf-c-empty-state__body">Log output of {container.name}</div>
    </div>
  </div>
</div>
