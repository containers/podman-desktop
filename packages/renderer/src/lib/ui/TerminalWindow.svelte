<script lang="ts">
import 'xterm/css/xterm.css';

import { createEventDispatcher, onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';

export let terminal: Terminal;

let logsXtermDiv: HTMLDivElement;
let resizeHandler: () => void;

const dispatch = createEventDispatcher<{ init: any }>();

async function refreshTerminal(): Promise<void> {
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

  terminal = new Terminal({ fontSize, lineHeight, disableStdin: true });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);

  terminal.open(logsXtermDiv);
  // disable cursor
  terminal.write('\x1b[?25l');

  // call fit addon each time we resize the window
  resizeHandler = (): void => {
    fitAddon.fit();
  };
  window.addEventListener('resize', resizeHandler);

  fitAddon.fit();
}

onMount(async () => {
  await refreshTerminal();
  dispatch('init');
});

onDestroy(() => {
  window.removeEventListener('resize', resizeHandler);
});
</script>

<div class={$$props.class} bind:this={logsXtermDiv}></div>
