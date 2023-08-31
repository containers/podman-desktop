<script lang="ts">
import type { ContainerInfoUI } from './ContainerInfoUI';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { router } from 'tinro';
import { onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { getPanelDetailColor } from '../color/color';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import NoLogIcon from '../ui/NoLogIcon.svelte';

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
  const sendCallbackId = await window.shellInContainer(
    container.engineId,
    container.id,
    receiveCallback,
    () => {},
    () => {},
  );

  // pass data from xterm to container
  shellTerminal?.onData(data => {
    window.shellInContainerSend(sendCallbackId, data);
  });
}

// refresh
async function refreshTerminal() {
  // missing element, return
  if (!terminalXtermDiv) {
    return;
  }

  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );
  shellTerminal = new Terminal({
    fontSize,
    lineHeight,
    theme: {
      background: getPanelDetailColor(),
    },
  });
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

<div class="h-full" bind:this="{terminalXtermDiv}" class:hidden="{container.state !== 'RUNNING'}"></div>

<EmptyScreen
  hidden="{container.state === 'RUNNING'}"
  icon="{NoLogIcon}"
  title="No Terminal"
  message="Container is not running" />
