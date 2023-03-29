<style>
:global(#logger-component .xterm) {
  padding-left: 8px;
  padding-right: 8px;
}
</style>

<script lang="ts">
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { onMount, onDestroy } from 'svelte';
import 'xterm/css/xterm.css';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';

export let logsTerminal;
export let onInit: () => void;
let logsXtermDiv: HTMLDivElement;

let resizeHandler;

async function refreshTerminal() {
  // missing element, return
  if (!logsXtermDiv) {
    return;
  }
  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  logsTerminal = new Terminal({ fontSize, lineHeight, disableStdin: true });
  const fitAddon = new FitAddon();
  logsTerminal.loadAddon(fitAddon);

  logsTerminal.open(logsXtermDiv);
  // disable cursor
  logsTerminal.write('\x1b[?25l');

  logsTerminal.write('\n\r');

  resizeHandler = () => {
    fitAddon.fit();
  };
  // call fit addon each time we resize the window
  window.addEventListener('resize', resizeHandler);
  fitAddon.fit();
}
onMount(async () => {
  await refreshTerminal();
  if (onInit) {
    onInit();
  }
});

onDestroy(() => {
  window.removeEventListener('resize', resizeHandler);
});
</script>

<div id="logger-component" style="width:100%; height:100%;" bind:this="{logsXtermDiv}"></div>
