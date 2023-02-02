<script lang="ts">
import { router } from 'tinro';
import { onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from '../color/color';
import type { PodInfoUI } from './PodInfoUI';
import { isMultiplexedLog } from '../stream/stream-utils';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import NoLogIcon from '../ui/NoLogIcon.svelte';

export let pod: PodInfoUI;

// Log
let logsXtermDiv: HTMLDivElement;

// Logs has been initialized
let noLogs = true;
let logsTerminal: Terminal;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;
let currentRouterPath: string;
let logsRouterPath: string = `/pods/${encodeURI(pod.kind)}/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/logs`;

// An array of readable ANSI escape sequence colours against a black terminal background
// these are the most "readable" colours against a black background
// No colours like grey, normal blue (cyan instead) or red, since they don't appear very well.
const ansi256Colors = [
  `\u001b[36m`, // cyan
  `\u001b[33m`, // yellow
  `\u001b[32m`, // green
  `\u001b[35m`, // magenta
  `\u001b[34m`, // blue
  `\u001b[36;1m`, // bright cyan
  `\u001b[33;1m`, // bright yellow
  `\u001b[32;1m`, // bright green
  `\u001b[35;1m`, // bright magenta
  `\u001b[34;1m`, // bright blue
];

// Create a map that will store the ANSI 256 colour for each container name
// if we run out of colours, we'll start from the beginning.
const colourizedContainerName = new Map<string, string>();
pod.containers.forEach((container, index) => {
  const colour = ansi256Colors[index % ansi256Colors.length];
  colourizedContainerName.set(container.Names, colourizedANSIContainerName(container.Names, colour));
});

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

// Fetches the logs for each container in the pod and outputs to the terminal
async function fetchPodLogs() {
  // Go through each name of pod.containers array and determine
  // how much spacing is required for each name to be printed.
  let maxNameLength = 0;
  pod.containers.forEach(container => {
    if (container.Names.length > maxNameLength) {
      maxNameLength = container.Names.length;
    }
  });

  // Go through the array of containers from pod.containers and
  // call window.logsContainer for each container with a logs callback.
  // We use a custom logsCallback since we are adding the container name and padding
  // before each log output.
  //
  // NOTE: Podman API returns 'Names' despite being a singular name for the container.
  pod.containers.forEach(async container => {
    // Set a customer callback that will add the container name and padding
    const logsCallback = (name: string, data: string) => {
      const padding = ' '.repeat(maxNameLength - container.Names.length);
      const colouredName = colourizedContainerName.get(container.Names);

      let content;
      if (isMultiplexedLog(data)) {
        content = data.substring(8);
      } else {
        content = data;
      }

      callback(name, `${colouredName} ${padding} | ${content}`);
    };

    // Get the logs for the container
    if (pod.kind === 'podman') {
      await window.logsContainer(pod.engineId, container.Id, logsCallback);
    } else {
      await window.kubernetesReadPodLog(pod.name, container.Names, logsCallback);
    }
  });
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
  // Refresh the terminal on initial load
  await refreshTerminal();
  fetchPodLogs();

  // Resize the terminal each time we change the div size
  resizeObserver = new ResizeObserver(entries => {
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

<EmptyScreen
  icon="{NoLogIcon}"
  title="No Log"
  message="Log output of Pod {pod.name}"
  hidden="{noLogs === false}"
  style="background-color: {getPanelDetailColor()}" />

<div
  class="min-w-full flex flex-col"
  class:invisible="{noLogs === true}"
  class:h-0="{noLogs === true}"
  class:h-full="{noLogs === false}"
  style="background-color: {getPanelDetailColor()}"
  bind:this="{logsXtermDiv}">
</div>
