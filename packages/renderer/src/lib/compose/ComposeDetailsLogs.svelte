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
import type { ComposeInfoUI } from './ComposeInfoUI';

export let compose: ComposeInfoUI;

// Logging element
let logsXtermDiv: HTMLDivElement;
let refCompose: ComposeInfoUI;

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
let logsRouterPath = `/compose/details/${encodeURI(compose.name)}/${encodeURI(compose.engineId)}/logs`;

// Create a map that will store the ANSI 256 colour for each container name
// if we run out of colours, we'll start from the beginning.
const colourizedContainerName = new Map<string, string>();

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
async function fetchComposeLogs(): Promise<void> {
  // Figure out how much spacing to put for the naming of the containers
  let maxNameLength = 0;
  compose.containers.forEach(container => {
    if (container.name.length > maxNameLength) {
      maxNameLength = container.name.length;
    }
  });

  // Go through the array of containers in the compose group
  // and create a custom logsContainer window for each container, we use a custom logsCallback
  // in order to add padding to each output / make it look nice.
  const promises = compose.containers.map(container => {
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

    // Wrap the logsContainer function in a Promise
    return new Promise((resolve, reject) => {
      window.logsContainer(container.engineId, container.id, (name, data) => {
        try {
          logsCallback(name, data);
          resolve(undefined);
        } catch (error) {
          // Catch any errors that occur during logsCallback and reject the Promise
          reject(error);
        }
      });
    }).catch((error: unknown) => {
      // If there's an error, just output it to console instead of throwing an error
      // in case there's one container that errors, but the others don't.
      console.log(error);
    });
  });

  // Wait for all promises to settle (success or error)
  await Promise.all(promises);
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
    const colour = ansi256Colours[index % ansi256Colours.length];
    colourizedContainerName.set(container.name, colourizedANSIContainerName(container.name, colour));
  });

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

<EmptyScreen icon={NoLogIcon} title="No Log" message="Log output of {compose.name}" hidden={noLogs === false} />

<div
  class="min-w-full flex flex-col"
  class:invisible={noLogs === true}
  class:h-0={noLogs === true}
  class:h-full={noLogs === false}
  bind:this={logsXtermDiv}>
</div>
