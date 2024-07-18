<script lang="ts">
import 'xterm/css/xterm.css';

import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from '../color/color';
import { ansi256Colours, colourizedANSIContainerName } from '../editor/editor-utils';
import { isMultiplexedLog } from '../stream/stream-utils';
import NoLogIcon from '../ui/NoLogIcon.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let pod: PodInfoUI;

// Log
let logsXtermDiv: HTMLDivElement;
let refPod: PodInfoUI;
// Logs has been initialized
let noLogs = true;
let logsTerminal: Terminal;

// need to refresh logs when pod is switched or state changes
$: {
  if (refPod && (refPod.id !== pod.id || (refPod.status !== pod.status && pod.status !== 'EXITED'))) {
    logsTerminal?.clear();
    fetchPodLogs();
  }
  refPod = pod;
}

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;
let currentRouterPath: string;
let logsRouterPath = `/pods/${encodeURI(pod.kind)}/${encodeURI(pod.name)}/${encodeURIComponent(pod.engineId)}/logs`;

// Create a map that will store the ANSI 256 colour for each container name
// if we run out of colours, we'll start from the beginning.
const colourizedContainerName = new Map<string, string>();
pod.containers.forEach((container, index) => {
  const colour = ansi256Colours[index % ansi256Colours.length];
  colourizedContainerName.set(container.Names, colourizedANSIContainerName(container.Names, colour));
});

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
  for (let container of pod.containers) {
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
  // Refresh the terminal on initial load
  await refreshTerminal();
  fetchPodLogs();

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

<EmptyScreen icon={NoLogIcon} title="No Log" message="Log output of Pod {pod.name}" hidden={noLogs === false} />

<div
  class="min-w-full flex flex-col"
  class:invisible={noLogs === true}
  class:h-0={noLogs === true}
  class:h-full={noLogs === false}
  bind:this={logsXtermDiv}>
</div>
