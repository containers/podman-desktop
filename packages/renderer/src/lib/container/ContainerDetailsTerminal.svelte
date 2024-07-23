<script lang="ts">
import 'xterm/css/xterm.css';

import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { getExistingTerminal, registerTerminal } from '/@/stores/container-terminal-store';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from '../color/color';
import NoLogIcon from '../ui/NoLogIcon.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;
export let screenReaderMode = false;
let terminalXtermDiv: HTMLDivElement;
let shellTerminal: Terminal;
let currentRouterPath: string;
let sendCallbackId: number | undefined;

// update current route scheme
router.subscribe(route => {
  currentRouterPath = route.path;
});

// update terminal when receiving data
function receiveDataCallback(data: Buffer) {
  shellTerminal.write(data.toString());
}

function receiveEndCallback() {
  // need to reopen a new terminal
  window
    .shellInContainer(container.engineId, container.id, receiveDataCallback, () => {}, receiveEndCallback)
    .then(id => {
      sendCallbackId = id;

      shellTerminal?.onData(data => {
        window.shellInContainerSend(id, data);
      });
    });
}

// call exec command
async function executeShellIntoContainer() {
  if (container.state !== 'RUNNING') {
    return;
  }

  if (!sendCallbackId) {
    // grab logs of the container
    const callbackId = await window.shellInContainer(
      container.engineId,
      container.id,
      receiveDataCallback,
      () => {},
      receiveEndCallback,
    );
    await window.shellInContainerResize(callbackId, shellTerminal.cols, shellTerminal.rows);
    // pass data from xterm to container
    shellTerminal?.onData(data => {
      window.shellInContainerSend(callbackId, data);
    });

    // store it
    sendCallbackId = callbackId;
  }
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

  // get terminal if any
  const existingTerminal = getExistingTerminal(container.engineId, container.id);

  if (existingTerminal) {
    sendCallbackId = existingTerminal.callbackId;
    shellTerminal = existingTerminal.terminal;
    shellTerminal.options = {
      fontSize,
      lineHeight,
    };
  } else {
    shellTerminal = new Terminal({
      fontSize,
      lineHeight,
      screenReaderMode,
      theme: {
        background: getPanelDetailColor(),
      },
    });
  }

  const fitAddon = new FitAddon();
  shellTerminal.loadAddon(fitAddon);

  shellTerminal.open(terminalXtermDiv);

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/containers/${container.id}/terminal`) {
      fitAddon.fit();
      if (sendCallbackId) {
        window.shellInContainerResize(sendCallbackId, shellTerminal.cols, shellTerminal.rows);
      }
    }
  });
  fitAddon.fit();
}
onMount(async () => {
  await refreshTerminal();
  await executeShellIntoContainer();
});

onDestroy(() => {
  // register terminal for reusing it
  registerTerminal({
    engineId: container.engineId,
    containerId: container.id,
    terminal: shellTerminal,
    callbackId: sendCallbackId,
  });
});
</script>

<div class="h-full" bind:this={terminalXtermDiv} class:hidden={container.state !== 'RUNNING'}></div>

<EmptyScreen
  hidden={container.state === 'RUNNING'}
  icon={NoLogIcon}
  title="No Terminal"
  message="Container is not running" />
