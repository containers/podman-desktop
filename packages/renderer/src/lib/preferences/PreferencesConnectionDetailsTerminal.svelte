<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { Terminal } from '@xterm/xterm';

import NoLogIcon from '../ui/NoLogIcon.svelte';
import { SerializeAddon } from '@xterm/addon-serialize';
import { getExistingTerminal, registerTerminal } from '/@/stores/provider-terminal-store';
import { onDestroy, onMount } from 'svelte';
import { FitAddon } from '@xterm/addon-fit';
import { getTerminalTheme } from '../../../../main/src/plugin/terminal-theme';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { router } from 'tinro';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

interface ProviderDetailsTerminalProps {
  provider: ProviderInfo;
  connectionInfo: ProviderContainerConnectionInfo;
  screenReaderMode?: boolean;
}

let { provider, connectionInfo, screenReaderMode = false }: ProviderDetailsTerminalProps = $props();
let terminalXtermDiv: HTMLDivElement;
let shellTerminal: Terminal;
let currentRouterPath: string;
let sendCallbackId: number | undefined;
let terminalContent: string = '';
let serializeAddon: SerializeAddon;
let lastState = $state<string>('');
let providerState = $state(provider);

$effect(() => {
  providerState = provider;
  if (lastState === 'starting' && providerState.status === 'started') {
    restartTerminal();
  }
  lastState = provider.status;
});

async function restartTerminal() {
  await executeShellIntoProviderConnection();
  window.dispatchEvent(new Event('resize'));
}

// update current route scheme
router.subscribe(route => {
  currentRouterPath = route.path;
});

// update terminal when receiving data
function receiveDataCallback(data: string) {
  shellTerminal.write(data);
  console.error("Frontend: " + data)
}

function receiveEndCallback() {
  // need to reopen a new terminal
  window
    .shellInProviderConnection(provider.internalId, connectionInfo, receiveDataCallback, () => {}, receiveEndCallback, {w: 200, h:100})
    .then(id => {
      sendCallbackId = id;

      shellTerminal?.onData(data => {
        window.shellInProviderConnectionSend(id, data);
      });
    });
}

// call exec command
async function executeShellIntoProviderConnection() {
  // grab logs of the provider
  const callbackId = await window.shellInProviderConnection(provider.internalId, connectionInfo, receiveDataCallback, () => {}, receiveEndCallback, {w: 200, h:100});
  await window.shellInProviderConnectionSetWindow(callbackId, shellTerminal.cols, shellTerminal.rows);
  // pass data from xterm to provider
  shellTerminal?.onData(data => {
    window.shellInProviderConnectionSend(callbackId, data);
  });

  // store it
  sendCallbackId = callbackId;
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
  const existingTerminal = getExistingTerminal(provider);

  shellTerminal = new Terminal({
    fontSize,
    lineHeight,
    screenReaderMode,
    theme: getTerminalTheme(),
  });
  if (existingTerminal) {
    shellTerminal.options = {
      fontSize,
      lineHeight,
    };
    shellTerminal.write(existingTerminal.name);
  }

  const fitAddon = new FitAddon();
  serializeAddon = new SerializeAddon();
  shellTerminal.loadAddon(fitAddon);
  shellTerminal.loadAddon(serializeAddon);

  shellTerminal.open(terminalXtermDiv);

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/providers/${provider.id}/terminal`) {
      fitAddon.fit();
      if (sendCallbackId) {
        window.shellInProviderConnectionSetWindow(sendCallbackId, shellTerminal.cols, shellTerminal.rows);
      }
    }
  });
  fitAddon.fit();
}
onMount(async () => {
  await refreshTerminal();
  await executeShellIntoProviderConnection();
});

onDestroy(() => {
  terminalContent = serializeAddon.serialize();
  if (!provider) return;
  // register terminal for reusing it
  registerTerminal(connectionInfo);
  serializeAddon?.dispose();
  shellTerminal?.dispose();
});
</script>

<div class="h-full" bind:this={terminalXtermDiv} class:hidden={provider.status !== 'started'}></div>

<EmptyScreen
  hidden={provider.status === 'started'}
  icon={NoLogIcon}
  title="No Terminal"
  message="Provider is not running" />
