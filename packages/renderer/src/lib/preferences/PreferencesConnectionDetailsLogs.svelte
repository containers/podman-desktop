<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import type { ProviderContainerConnectionInfo, ProviderKubernetesConnectionInfo } from '@desktop-framework/api';
import { TerminalSettings } from '@desktop-framework/api/terminal';
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { onDestroy, onMount } from 'svelte';

import { getTerminalTheme } from '/@/lib/terminal/terminal-theme';
import NoLogIcon from '/@/lib/ui/NoLogIcon.svelte';

import { writeToTerminal } from './Util';

interface Props {
  providerInternalId?: string;
  connectionInfo?: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo;
  setNoLogs: () => void;
  noLog: boolean;
}
let { providerInternalId, connectionInfo, setNoLogs, noLog }: Props = $props();
let logsTerminal: Terminal;

$effect(() => {
  noLog = !!noLog;
});
let noLogs = $state(!!noLog);

// Log
let logsXtermDiv: HTMLDivElement;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;

async function refreshTerminal(): Promise<void> {
  // missing element, return
  if (!logsXtermDiv) {
    console.log('missing xterm div, exiting...');
    return;
  }

  termFit = new FitAddon();
  logsTerminal.loadAddon(termFit);

  logsTerminal.open(logsXtermDiv);

  // disable cursor
  logsTerminal.write('\x1b[?25l');

  termFit.fit();
}

onMount(async () => {
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
  logsTerminal = new Terminal({
    fontSize,
    lineHeight,
    disableStdin: true,
    theme: getTerminalTheme(),
    convertEol: true,
    scrollback,
  });
  // Refresh the terminal on initial load
  await refreshTerminal();

  logsTerminal.onLineFeed(() => {
    setNoLogs();
    noLogs = false;
  });
  // Resize the terminal each time we change the div size
  resizeObserver = new ResizeObserver(() => {
    termFit?.fit();
  });

  // Observe the terminal div
  resizeObserver.observe(logsXtermDiv);
  const logHandler = (newContent: unknown[], colorPrefix: string): void => {
    writeToTerminal(logsTerminal, newContent, colorPrefix);
  };
  if (providerInternalId) {
    await window.startReceiveLogs(
      providerInternalId,
      (data: unknown[]) => logHandler(data, ''),
      (data: unknown[]) => logHandler(data, ''),
      (data: unknown[]) => logHandler(data, ''),
      $state.snapshot(connectionInfo),
    );
  }
});

onDestroy(() => {
  // Cleanup the observer on destroy
  resizeObserver?.disconnect();
});
</script>

<EmptyScreen
  icon={NoLogIcon}
  title="No Log"
  message="Log output"
  hidden={noLogs === false}
  class="bg-[var(--pd-details-bg)]" />

<div
  aria-label="terminal"
  class="min-w-full flex flex-col bg-[var(--pd-terminal-background)] p-[5px] pr-0"
  class:invisible={noLogs === true}
  class:h-0={noLogs === true}
  class:h-full={noLogs === false}
  bind:this={logsXtermDiv}>
</div>
