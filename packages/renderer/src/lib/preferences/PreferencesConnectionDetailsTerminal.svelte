<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import type { ProviderContainerConnectionInfo, ProviderInfo, ProviderVmConnectionInfo } from '@desktop-framework/api';
import { TerminalSettings } from '@desktop-framework/api/terminal';
import type { ProviderConnectionShellDimensions, ProviderConnectionStatus } from '@desktop-framework/extension-api';
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import { type IDisposable, Terminal } from '@xterm/xterm';
import { onDestroy, onMount } from 'svelte';

import { getTerminalTheme } from '/@/lib/terminal/terminal-theme';
import NoLogIcon from '/@/lib/ui/NoLogIcon.svelte';
import { getExistingTerminal, registerTerminal } from '/@/stores/provider-terminal-store';

interface ProviderDetailsTerminalProps {
  provider: ProviderInfo;
  connectionInfo: ProviderContainerConnectionInfo | ProviderVmConnectionInfo;
  screenReaderMode?: boolean;
}

let { provider, connectionInfo, screenReaderMode = false }: ProviderDetailsTerminalProps = $props();
let terminalXtermDiv: HTMLDivElement;
let shellTerminal: Terminal;
let sendCallbackId: number | undefined;
let terminalContent: string = '';
let serializeAddon: SerializeAddon;
let lastState = $state<ProviderConnectionStatus>('started');
let terminalOnDataListener: IDisposable | undefined = undefined;

$effect(() => {
  const connectionStatus = connectionInfo.status;
  if (connectionStatus === 'started' && connectionStatus !== lastState) {
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

// update terminal when receiving data
function receiveDataCallback(data: string): void {
  shellTerminal.write(data);
}

function receiveEndCallback(): void {
  // need to reopen a new terminal
  if (sendCallbackId) {
    window
      .shellInProviderConnectionClose(sendCallbackId)
      .then(() => {
        window
          .shellInProviderConnection(
            provider.internalId,
            $state.snapshot(connectionInfo),
            receiveDataCallback,
            () => {},
            receiveEndCallback,
          )
          .then(id => {
            sendCallbackId = id;
            terminalOnDataListener?.dispose();
            terminalOnDataListener = shellTerminal?.onData((data: string) => {
              window
                .shellInProviderConnectionSend(id, data)
                .catch((err: unknown) => console.error(`Error sending data to provider ${connectionInfo.name}`, err));
            });
          })
          .catch((err: unknown) => console.log(`Error opening terminal for provider ${connectionInfo.name}`, err));
      })
      .catch((err: unknown) =>
        console.log(`Error closing old shell connection for provider ${connectionInfo.name}`, err),
      );
  }
}

// call exec command
async function executeShellIntoProviderConnection(): Promise<void> {
  if (connectionInfo.status !== 'started') {
    return;
  }

  // closes the old sendCallbackId connection
  if (sendCallbackId) {
    await window.shellInProviderConnectionClose(sendCallbackId);
  }
  // grab logs of the provider
  const callbackId = await window.shellInProviderConnection(
    provider.internalId,
    $state.snapshot(connectionInfo),
    receiveDataCallback,
    () => {},
    receiveEndCallback,
  );

  const dimensions: ProviderConnectionShellDimensions = {
    rows: shellTerminal.rows,
    cols: shellTerminal.cols,
  };

  await window.shellInProviderConnectionResize(callbackId, dimensions);
  // disposes of the old callbackId onData listener
  terminalOnDataListener?.dispose();
  // pass data from xterm to provider
  terminalOnDataListener = shellTerminal?.onData(async (data: string) => {
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

  const scrollback = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.Scrollback,
  );

  // get terminal if any
  const existingTerminal = getExistingTerminal(provider.internalId, connectionInfo.name);
  shellTerminal = new Terminal({
    fontSize,
    lineHeight,
    screenReaderMode,
    theme: getTerminalTheme(),
    scrollback,
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
