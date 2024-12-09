<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import type { ProviderConnectionShellDimensions, ProviderConnectionStatus } from '@podman-desktop/api';
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import { Terminal } from '@xterm/xterm';
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
let lastState = $state<ProviderConnectionStatus>('started');

$effect(() => {
  const connectionStatus = connectionInfo.status;
  if (lastState === 'stopped' && connectionStatus === 'started') {
    restartTerminal().catch((err: unknown) =>
      console.error(`Error restarting terminal for provider ${connectionInfo.name}`, err),
    );
  }
  lastState = connectionStatus;
});

async function restartTerminal(): Promise<void> {
  await executeShellIntoProviderConnection();
  window.dispatchEvent(new Event('resize'));
}

// update current route scheme
router.subscribe(route => {
  currentRouterPath = route.path;
});

// update terminal when receiving data
function receiveDataCallback(data: string): void {
  shellTerminal.write(data);
}

function receiveEndCallback(): void {
  // need to reopen a new terminal
  if (sendCallbackId) {
    window
      .shellInProviderConnection(provider.internalId, connectionInfo, receiveDataCallback, () => {}, receiveEndCallback)
      .then(id => {
        sendCallbackId = id;
        shellTerminal?.onData((data: string) => {
          window
            .shellInProviderConnectionSend(id, data)
            .catch((err: unknown) => console.error(`Error sending data to provider ${connectionInfo.name}`, err));
        });
      })
      .catch((err: unknown) => console.log(`Error opening terminal for provider ${connectionInfo.name}`, err));
  }
}

// call exec command
async function executeShellIntoProviderConnection(): Promise<void> {
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

  const dimensions: ProviderConnectionShellDimensions = {
    rows: shellTerminal.rows,
    cols: shellTerminal.cols,
  };

  await window.shellInProviderConnectionResize(callbackId, dimensions);
  // pass data from xterm to provider
  shellTerminal?.onData(async (data: string) => {
    await window.shellInProviderConnectionSend(callbackId, data);
  });
  // store it
  sendCallbackId = callbackId;
}

// refresh
async function refreshTerminal(): Promise<void> {
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
    shellTerminal.write(existingTerminal.terminal);
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
        const dimensions: ProviderConnectionShellDimensions = {
          rows: shellTerminal?.rows,
          cols: shellTerminal?.cols,
        };
        window
          .shellInProviderConnectionResize(sendCallbackId, dimensions)
          .catch((err: unknown) => console.error(`Error resizing terminal for provider ${connectionInfo.name}`, err));
      }
    }
  });
  fitAddon.fit();
}

onMount(async () => {
  await refreshTerminal();
  await executeShellIntoProviderConnection();
});

onDestroy(async () => {
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
  shellTerminal?.dispose();
  // Closes session
  if (sendCallbackId) {
    await window.shellInProviderConnectionClose(sendCallbackId);
    sendCallbackId = undefined;
  }
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
