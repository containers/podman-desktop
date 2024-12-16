<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { createEventDispatcher, onDestroy, onMount } from 'svelte';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getTerminalTheme } from '../../../../main/src/plugin/terminal-theme';

export let terminal: Terminal;
export let convertEol: boolean | undefined = undefined;
export let disableStdIn: boolean = true;
export let screenReaderMode: boolean | undefined = undefined;
export let showCursor: boolean = false;

let logsXtermDiv: HTMLDivElement;
let resizeHandler: () => void;

const dispatch = createEventDispatcher();

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

  terminal = new Terminal({
    fontSize,
    lineHeight,
    disableStdin: disableStdIn,
    theme: getTerminalTheme(),
    convertEol: convertEol,
    screenReaderMode: screenReaderMode,
  });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);

  terminal.open(logsXtermDiv);
  if (!showCursor) {
    // disable cursor
    terminal.write('\x1b[?25l');
  }

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
  terminal?.dispose();
});
</script>

<div class="{$$props.class} p-[5px] pr-0 bg-[var(--pd-terminal-background)]" bind:this={logsXtermDiv}></div>
