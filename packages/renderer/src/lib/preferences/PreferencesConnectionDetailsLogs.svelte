<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { getPanelDetailColor } from '../color/color';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import NoLogIcon from '../ui/NoLogIcon.svelte';
import { writeToTerminal } from './Util';
import type {
  ProviderContainerConnectionInfo,
  ProviderKubernetesConnectionInfo,
} from '../../../../main/src/plugin/api/provider-info';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';

export let providerInternalId: string = undefined;
export let connection: string = undefined;
export let connectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo = undefined;
export let setNoLogs: () => void;
export let noLog: boolean;
let logsTerminal: Terminal;

$: noLogs = !!noLog;

// Log
let logsXtermDiv: HTMLDivElement;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;

// need to refresh logs when container is switched or state changes
let currentRouterPath: string;

async function refreshTerminal() {
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

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === `/container-connection/${providerInternalId}/${connection}/logs`) {
      termFit.fit();
    }
  });
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
  logsTerminal = new Terminal({
    fontSize,
    lineHeight,
    disableStdin: true,
    theme: {
      background: getPanelDetailColor(),
    },
    convertEol: true,
  });
  // Refresh the terminal on initial load
  await refreshTerminal();

  logsTerminal.onLineFeed(() => {
    setNoLogs();
    noLogs = false;
  });
  // Resize the terminal each time we change the div size
  resizeObserver = new ResizeObserver(entries => {
    termFit?.fit();
  });

  // Observe the terminal div
  resizeObserver.observe(logsXtermDiv);
  const logHandler = (newContent: any[], colorPrefix: string) => {
    writeToTerminal(logsTerminal, newContent, colorPrefix);
  };
  window.startReceiveLogs(
    providerInternalId,
    data => logHandler(data, '\x1b[37m'),
    data => logHandler(data, '\x1b[37m'),
    data => logHandler(data, '\x1b[37m'),
    connectionInfo,
  );
});

onDestroy(() => {
  // Cleanup the observer on destroy
  resizeObserver?.unobserve(logsXtermDiv);
});
</script>

<EmptyScreen
  icon="{NoLogIcon}"
  title="No Log"
  message="Log output"
  hidden="{noLogs === false}"
  style="background-color: {getPanelDetailColor()}" />

<div
  aria-label="terminal"
  class="min-w-full flex flex-col"
  class:invisible="{noLogs === true}"
  class:h-0="{noLogs === true}"
  class:h-full="{noLogs === false}"
  style="background-color: {getPanelDetailColor()}"
  bind:this="{logsXtermDiv}">
</div>
