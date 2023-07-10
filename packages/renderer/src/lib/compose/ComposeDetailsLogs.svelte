<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from '../color/color';
import { isMultiplexedLog } from '../stream/stream-utils';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import NoLogIcon from '../ui/NoLogIcon.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';

export let compose: ComposeInfoUI;

// Logging element
let logsXtermDiv: HTMLDivElement;
let refCompose;

// Log initialization
let noLogs = true;
let logsTerminal: Terminal;

$: {
  if (refCompose && refCompose.status !== compose.status) {
    logsTerminal?.clear();
    fetchComposeLogs();
  }
  refCompose = compose;
}

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;
let currentRouterPath: string;

// Router path for the logging
let logsRouterPath = `/compose/${encodeURI(compose.name)}/${encodeURI(compose.engineId)}/logs`;

// An array of readable ANSI escape sequence colours against a black terminal background
// these are the most "readable" colours against a black background
// No colours like grey, normal blue (cyan instead) or red, since they don't appear very well.
const ansi256Colors = [
  '\u001b[36m', // cyan
  '\u001b[33m', // yellow
  '\u001b[32m', // green
  '\u001b[35m', // magenta
  '\u001b[34m', // blue
  '\u001b[36;1m', // bright cyan
  '\u001b[33;1m', // bright yellow
  '\u001b[32;1m', // bright green
  '\u001b[35;1m', // bright magenta
  '\u001b[34;1m', // bright blue
];

// Create a map that will store the ANSI 256 colour for each container name
// if we run out of colours, we'll start from the beginning.
const colourizedContainerName = new Map<string, string>();

// Function that takes the container name and ANSI colour and encapsulates the name in the colour,
// making sure that we reset the colour back to white after the name.
function colourizedANSIContainerName(name: string, colour: string) {
  return `${colour}${name}\u001b[0m`;
}

// Callback for logs which will output the logs to the terminal
function callback(name: string, data: string) {
  if (name === 'first-message') {
    noLogs = false;
  } else if (name === 'data') {
    noLogs = false;
    // 1: STDOUT
    // 2: STDERR
    logsTerminal?.write(data + '\r');
  }
}

// Fetches the logs for each container in the compose group
async function fetchComposeLogs() {
  // Figure out how much spacing to put for the naming of the containers
  let maxNameLength = 0;
  compose.containers.forEach(container => {
    if (container.name.length > maxNameLength) {
      maxNameLength = container.name.length;
    }
  });

  // Go trhrough the array of containers in the compose group
  // and create a custom logsContainer window for each container, we use a custom logsCallback
  // in order to add padding to each output / make it look nice.
  for (let container of compose.containers) {
    // Set a customer callback that will add the container name and padding
    const logsCallback = (name: string, data: string) => {
      const padding = ' '.repeat(maxNameLength - container.name.length);
      const colouredName = colourizedContainerName.get(container.name);

      let content;
      if (isMultiplexedLog(data)) {
        content = data.substring(8);
      } else {
        content = data;
      }

      callback(name, `${colouredName} ${padding} | ${content}`);
    };

    // Get the logs for the container
    await window.logsContainer(container.engineId, container.id, logsCallback);
  }
}

async function refreshTerminal() {
  // missing element, return
  if (!logsXtermDiv) {
    console.log('missing xterm div, exiting...');
    return;
  }
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
  termFit = new FitAddon();
  logsTerminal.loadAddon(termFit);

  logsTerminal.open(logsXtermDiv);

  // disable cursor
  logsTerminal.write('\x1b[?25l');

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    if (currentRouterPath === logsRouterPath) {
      termFit.fit();
    }
  });
  termFit.fit();
}

onMount(async () => {
  compose.containers.forEach((container, index) => {
    const colour = ansi256Colors[index % ansi256Colors.length];
    colourizedContainerName.set(container.name, colourizedANSIContainerName(container.name, colour));
  });

  console.log('colors:', colourizedContainerName);

  // Refresh the terminal on initial load
  await refreshTerminal();
  fetchComposeLogs();

  // Resize the terminal each time we change the div size
  resizeObserver = new ResizeObserver(() => {
    termFit?.fit();
  });

  // Observe the terminal div
  resizeObserver.observe(logsXtermDiv);
});

onDestroy(() => {
  // Cleanup the observer on destroy
  resizeObserver?.unobserve(logsXtermDiv);
});
</script>

<EmptyScreen icon="{NoLogIcon}" title="No Log" message="Log output of {compose.name}" hidden="{noLogs === false}" />

<div
  class="min-w-full flex flex-col"
  class:invisible="{noLogs === true}"
  class:h-0="{noLogs === true}"
  class:h-full="{noLogs === false}"
  bind:this="{logsXtermDiv}">
</div>
