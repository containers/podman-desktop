<script lang="ts">
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { onMount, onDestroy } from 'svelte';
import 'xterm/css/xterm.css';
import { TerminalSettings } from '../../../../preload/src/terminal-settings';

export let logsTerminal;
export let onInit: () => void;
let logsXtermDiv: HTMLDivElement;

let resizeHandler;

function refreshTerminal() {
  // missing element, return
  if (!logsXtermDiv) {
    console.log('missing xterm div, exiting...');
    return;
  }
  // grab font size
  const fontSize = window.getConfigurationValue<number>(TerminalSettings.SectionName + '.' + TerminalSettings.FontSize);
  const lineHeight = window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  logsTerminal = new Terminal({ fontSize, lineHeight, disableStdin: true });
  const fitAddon = new FitAddon();
  logsTerminal.loadAddon(fitAddon);

  logsTerminal.open(logsXtermDiv);
  // disable cursor
  logsTerminal.write('\x1b[?25l');

  logsTerminal.write(`Logs will appear there if any...\n\r`);

  resizeHandler = () => {
    fitAddon.fit();
  };
  // call fit addon each time we resize the window
  window.addEventListener('resize', resizeHandler);
  fitAddon.fit();
}
onMount(async () => {
  refreshTerminal();
  if (onInit) {
    onInit();
  }
});

onDestroy(() => {
  window.removeEventListener('resize', resizeHandler);
});
</script>

<div style="width:100%; height:100%;" bind:this="{logsXtermDiv}"></div>
