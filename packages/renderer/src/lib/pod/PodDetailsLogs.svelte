<script lang="ts">
import { router } from 'tinro';
import { onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from '../color/color';
import type { PodInfoUI } from './PodInfoUI';

export let pod: PodInfoUI;

// Log
let logsXtermDiv: HTMLDivElement;

// Logs has been initialized
let logsReady = false;
let noLogs = true;
let logsTerminal;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;
let currentRouterPath: string;
let logsRouterPath: string = `/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/logs`;

// Create a map that will store the ANSI 256 colour for each container name
// Go through each container.name and create a map of the ANSI 256 colour based on the name
const colourizedContainerName = new Map<string, string>();
pod.containers.forEach(container => {
  colourizedContainerName.set(container.Names, colourizeString(container.Names));
});

// Function that inputs a string and returns an ANSI 256 coloured string based on the string name
// must use a colour that looks good against a black terminal background
function colourizeString(str: string): string {
  const hash = str.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const color = hash % 256;
  return `\u001b[38;5;${color}m${str}\u001b[0m`;
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
      callback(name, `${colouredName} ${padding} | ${data.substring(8)}`);
    };

    // Get the logs for the container and set logsReady as true
    await window.logsContainer(pod.engineId, container.Id, logsCallback);
    logsReady = true;
  });
}

router.subscribe(async route => {
  currentRouterPath = route.path;
  if (route.path.endsWith('/logs')) {
    await refreshTerminal();
    fetchPodLogs();
  }
});

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
  refreshTerminal();

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

{#if logsReady}
  <div
    class="h-full min-w-full flex flex-col"
    class:hidden="{noLogs === false}"
    style="background-color: {getPanelDetailColor()}">
    <div class="pf-c-empty-state h-full">
      <div class="pf-c-empty-state__content">
        <i class="fas fa-terminal pf-c-empty-state__icon" aria-hidden="true"></i>

        <h1 class="pf-c-title pf-m-lg">No Log</h1>

        <div class="pf-c-empty-state__body">Log output of Pod {pod.name}</div>
      </div>
    </div>
  </div>
{/if}

<div
  class="flex flex-col"
  style="background-color: {getPanelDetailColor()}"
  class:h-full="{noLogs === false}"
  class:min-w-full="{noLogs === false}"
  bind:this="{logsXtermDiv}">
</div>
