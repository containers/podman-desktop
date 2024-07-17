<script lang="ts">
import 'xterm/css/xterm.css';

import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from '../color/color';
import NoLogIcon from '../ui/NoLogIcon.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;
export let screenReaderMode = false;
let terminalXtermDiv: HTMLDivElement;
let attachContainerTerminal: Terminal;
let currentRouterPath: string;
let closed = false;

// update current route scheme
router.subscribe(route => {
  currentRouterPath = route.path;
});

// update terminal when receiving data
function receiveDataCallback(data: Buffer) {
  attachContainerTerminal.write(data.toString());
}

function receiveEndCallback() {
  closed = true;
}

// call exec command
async function attachToContainer() {
  if (container.state !== 'RUNNING') {
    return;
  }

  // attach to the container
  const callbackId = await window.attachContainer(
    container.engineId,
    container.id,
    receiveDataCallback,
    () => {},
    receiveEndCallback,
  );

  // pass data from xterm to container
  attachContainerTerminal?.onData(data => {
    window.attachContainerSend(callbackId, data);
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

  attachContainerTerminal = new Terminal({
    fontSize,
    lineHeight,
    screenReaderMode,
    theme: {
      background: getPanelDetailColor(),
    },
  });

  const fitAddon = new FitAddon();
  attachContainerTerminal.loadAddon(fitAddon);

  attachContainerTerminal.open(terminalXtermDiv);

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/containers/${container.id}/tty-terminal`) {
      fitAddon.fit();
    }
  });
  fitAddon.fit();
}
onMount(async () => {
  await refreshTerminal();
  await attachToContainer();
});

onDestroy(() => {});
</script>

<div class="h-full" bind:this={terminalXtermDiv} class:hidden={container.state !== 'RUNNING'}></div>

<EmptyScreen
  hidden={!closed && container.state !== 'RUNNING'}
  icon={NoLogIcon}
  title="No TTY"
  message="Tty has stopped" />

<EmptyScreen
  hidden={container.state === 'RUNNING'}
  icon={NoLogIcon}
  title="No TTY"
  message="Container is not running" />
