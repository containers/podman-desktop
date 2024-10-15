<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import type { ProviderConnectionStatus, ShellDimensions } from '@podman-desktop/api';
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import { type IDisposable, Terminal } from '@xterm/xterm';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';

import { getExistingTerminal, registerTerminal } from '/@/stores/provider-terminal-store';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getTerminalTheme } from '../../../../main/src/plugin/terminal-theme';
import NoLogIcon from '../ui/NoLogIcon.svelte';

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
let lastState = $state<ProviderConnectionStatus>('stopped');
let onDataDisposible: IDisposable;

$effect(() => {
  const connectionStatus = connectionInfo.status;
  if (lastState === 'stopped' && connectionStatus === 'started') {
    restartTerminal();
  }
  lastState = connectionStatus;
});

async function restartTerminal() {
  await executeShellIntoProviderConnection();
  window.dispatchEvent(new Event('setWindow'));
}

// update current route scheme
router.subscribe(route => {
  currentRouterPath = route.path;
});

// update terminal when receiving data
function receiveDataCallback(data: string) {
  shellTerminal.write(data);
}

function receiveEndCallback() {
  // need to reopen a new terminal
  window
    .shellInProviderConnection(provider.internalId, connectionInfo, receiveDataCallback, () => {}, receiveEndCallback)
    .then(id => {
      sendCallbackId = id;
      onDataDisposible?.dispose();
      onDataDisposible = shellTerminal?.onData((data: string) => {
        window.shellInProviderConnectionSend(id, data);
      });
    });
}

// call exec command
async function executeShellIntoProviderConnection() {
  if (connectionInfo.status !== 'started') {
    return;
  }

  // grab logs of the provider
  const callbackId = await window.shellInProviderConnection(
    provider.internalId,
    connectionInfo,
    receiveDataCallback,
    () => {},
    receiveEndCallback,
  );

  const dimensions: ShellDimensions = {
    rows: shellTerminal.rows,
    cols: shellTerminal.cols,
  };

  await window.shellInProviderConnectionSetWindow(callbackId, dimensions);
  // pass data from xterm to provider
  onDataDisposible?.dispose();
  onDataDisposible = shellTerminal?.onData((data: string) => {
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
  const existingTerminal = getExistingTerminal(connectionInfo.name, connectionInfo.endpoint.socketPath);
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
    // \r\n for starting new terminal on next line
    shellTerminal.write(existingTerminal.terminal + '\r\n');
  }

  const fitAddon = new FitAddon();
  serializeAddon = new SerializeAddon();
  shellTerminal.loadAddon(fitAddon);
  shellTerminal.loadAddon(serializeAddon);

  shellTerminal.open(terminalXtermDiv);

  // call fit addon each time we resize the window
  window.addEventListener('setWindow', () => {
    if (currentRouterPath === `/providers/${provider.id}/terminal`) {
      fitAddon.fit();
      if (sendCallbackId) {
        const dimensions: ShellDimensions = {
          rows: shellTerminal?.rows,
          cols: shellTerminal?.cols,
        };
        window.shellInProviderConnectionSetWindow(sendCallbackId, dimensions);
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
  // register terminal for reusing it
  registerTerminal({
    providerInternalId: provider.internalId,
    connectionSocket: connectionInfo.endpoint.socketPath,
    connectionName: connectionInfo.name,
    callbackId: sendCallbackId,
    terminal: terminalContent,
  });
  serializeAddon?.dispose();
  onDataDisposible?.dispose();
  shellTerminal?.dispose();
});
</script>

<div
  class="h-full p-[5px] pr-0 bg-[var(--pd-terminal-background)]"
  bind:this={terminalXtermDiv}
  class:hidden={connectionInfo.status !== 'started'}>
</div>

<EmptyScreen
  hidden={connectionInfo.status === 'started'}
  icon={NoLogIcon}
  title="No Terminal"
  message="Provider engine is not running" />
