<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import { TerminalSettings } from '@desktop-framework/api/terminal';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { createEventDispatcher, onDestroy, onMount } from 'svelte';

import { getTerminalTheme } from '/@/lib/terminal/terminal-theme';
import TerminalSearchControls from '/@/lib/ui/TerminalSearchControls.svelte';

interface Props {
  terminal?: Terminal;
  convertEol?: boolean;
  disableStdIn?: boolean;
  screenReaderMode?: boolean;
  showCursor?: boolean;
  search?: boolean;
  class?: string;
}

let {
  terminal = $bindable(),
  convertEol,
  disableStdIn = true,
  screenReaderMode,
  showCursor = false,
  search = false,
  class: className,
}: Props = $props();

let logsXtermDiv: HTMLDivElement | undefined;
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

  const scrollback = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.Scrollback,
  );

  terminal = new Terminal({
    fontSize,
    lineHeight,
    disableStdin: disableStdIn,
    theme: getTerminalTheme(),
    convertEol: convertEol,
    screenReaderMode: screenReaderMode,
    scrollback,
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

{#if search && terminal}
  <TerminalSearchControls {terminal} />
{/if}

<div class="{className} overflow-hidden p-[5px] pr-0 bg-[var(--pd-terminal-background)]" role="term" bind:this={logsXtermDiv}></div>
