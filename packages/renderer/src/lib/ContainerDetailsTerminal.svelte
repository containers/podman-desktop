<script lang="ts">
import type { ContainerInfoUI } from './container/ContainerInfoUI';
import { TerminalSettings } from '../../../preload/src/terminal-settings';
import { router } from 'tinro';
import { onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export let container: ContainerInfoUI;
let terminalXtermDiv: HTMLDivElement;
let shellTerminal: Terminal;
let currentRouterPath: string;

// update current route scheme
router.subscribe(route => {
  currentRouterPath = route.path;
});

// update terminal when receiving data
function receiveCallback(data: Buffer) {
  shellTerminal.write(data.toString());
}

// call exec command
async function executeShellIntoContainer() {
  if (container.state !== 'RUNNING') {
    return;
  }

  // grab logs of the container
  const sendCallback = await window.shellInContainer(container.engineId, container.id, receiveCallback);

  // pass data from xterm to docker
  shellTerminal?.onData(data => {
    sendCallback(data);
  });
}

// refresh
async function refreshTerminal() {
  // missing element, return
  if (!terminalXtermDiv) {
    return;
  }

  // grab font size
  const fontSize = window.getConfigurationValue<number>(TerminalSettings.SectionName + '.' + TerminalSettings.FontSize);
  const lineHeight = window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );
  shellTerminal = new Terminal({ fontSize, lineHeight });
  const fitAddon = new FitAddon();
  shellTerminal.loadAddon(fitAddon);

  shellTerminal.open(terminalXtermDiv);

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/containers/${container.id}/terminal`) {
      fitAddon.fit();
    }
  });
  fitAddon.fit();
}
onMount(async () => {
  refreshTerminal();
  executeShellIntoContainer();
});
</script>

<div bind:this="{terminalXtermDiv}" class:hidden="{container.state !== 'RUNNING'}"></div>

<div class="h-full min-w-full flex flex-col" class:hidden="{container.state === 'RUNNING'}">
  <div class="pf-c-empty-state h-full">
    <div class="pf-c-empty-state__content">
      <i class="fas fa-terminal pf-c-empty-state__icon" aria-hidden="true"></i>

      <h1 class="pf-c-title pf-m-lg">No Terminal</h1>

      <div class="pf-c-empty-state__body">Container is not running</div>
    </div>
  </div>
</div>
