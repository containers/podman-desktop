<script lang="ts">
import type { ContainerInfoUI } from './container/ContainerInfoUI';
import { router } from 'tinro';
import { onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { TerminalSettings } from '../../../preload/src/terminal-settings';

export let container: ContainerInfoUI;

let logsXtermDiv: HTMLDivElement;

let logsContainer;

// need to refresh logs when container is switched
$: {
  if (logsContainer?.id !== container.id || logsContainer?.state != container.state) {
    logsTerminal?.clear();
    fetchContainerLogs();
  }

  logsContainer = container;
}

let currentRouterPath: string;

let logsTerminal;
function callback(name: string, data: string) {
  if (name === 'first-message') {
    // clear on the first message
    logsTerminal?.clear();
  } else if (name === 'data') {
    const printHelp = data.charCodeAt(0);
    // 1: STDOUT
    // 2: STDERR
    logsTerminal.write(data.substring(8) + '\r');
  }
}

async function fetchContainerLogs() {
  // grab logs of the container
  await window.logsContainer(container.engineId, container.id, callback);
}

router.subscribe(async route => {
  currentRouterPath = route.path;
});

function refreshTerminal() {
  // missing element, return
  if (!logsXtermDiv) {
    console.log('missing xterm div, exiting...');
    return;
  }
  // grab font size
  const fontSize = window.getConfigurationValue<number>(TerminalSettings.SectionName + '.' + TerminalSettings.FontSize);
  const lineHeight = window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  logsTerminal = new Terminal({ fontSize, lineHeight, disableStdin: true });
  const fitAddon = new FitAddon();
  logsTerminal.loadAddon(fitAddon);

  logsTerminal.open(logsXtermDiv);
  // disable cursor
  logsTerminal.write('\x1b[?25l');

  logsTerminal.write(`Logs of ${container.name} will appear there if any...\n\r`);

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

<div bind:this="{logsXtermDiv}"></div>
