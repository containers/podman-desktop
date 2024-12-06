<script lang="ts">
import { FitAddon } from '@xterm/addon-fit';
import { SerializeAddon } from '@xterm/addon-serialize';
import { type IDisposable, Terminal } from '@xterm/xterm';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';

import { terminalStates } from '/@/stores/kubernetes-terminal-state-store';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getTerminalTheme } from '../../../../main/src/plugin/terminal-theme';

export let podName: string;
export let containerName: string;

// On load, we collect the the original pod and container name,
// and we will use these to correctly save the terminal state when the component is destroyed.
// Due to the way Svelte works, we need to store the original pod and container name in a separate / safe manner so that
// the original values are not written over when the component is re-rendered.
let originalPodName = podName;
let originalContainerName = containerName;
let terminalContent: string = '';
let serializeAddon: SerializeAddon;

export let terminalXtermDiv: HTMLElement = document.createElement('div');
let curRouterPath: string;

interface State {
  terminal: string;
  id: number;
}

let shellTerminal: Terminal;
let screenReaderMode = true;

let id: number | undefined;
let onDataDisposable: IDisposable | undefined;

router.subscribe(route => {
  curRouterPath = route.path;
});

onMount(async () => {
  const savedState = getSavedTerminalState(podName, containerName);
  await initializeNewTerminal(terminalXtermDiv);

  // If there is a saved state with information in the terminal, we will write it to the terminal (it was serialized into a string before using the SerializeAddon)
  // and then add a \r\n to the end of the terminal to ensure the cursor is on a new line.
  if (savedState?.terminal) {
    shellTerminal.write(savedState.terminal);
    shellTerminal.focus();
  }
});

onDestroy(() => {
  terminalContent = serializeAddon.serialize();
  saveTerminalState(originalPodName, originalContainerName, { terminal: terminalContent, id: id } as State);
  serializeAddon.dispose();
  shellTerminal.dispose();
});

function reconnect() {
  window
    .kubernetesExec(
      podName,
      containerName,
      (data: Buffer) => {
        shellTerminal.write(data);
      },
      (data: Buffer) => {
        shellTerminal.write(data);
      },
      reconnect,
    )
    .then(execId => {
      id = execId;

      shellTerminal.clear();
      onDataDisposable?.dispose();
      onDataDisposable = shellTerminal.onData(data => {
        window.kubernetesExecSend(id!, data).catch((err: unknown) => console.error('Error sending data', err));
      });
    })
    .catch((err: unknown) => console.error(`Error executing pod ${podName} container ${containerName}`, err));
}

async function initializeNewTerminal(container: HTMLElement) {
  if (!terminalXtermDiv) {
    return;
  }

  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  shellTerminal = new Terminal({
    fontSize,
    lineHeight,
    screenReaderMode,
    theme: getTerminalTheme(),
  });

  id = await window.kubernetesExec(
    podName,
    containerName,
    (data: Buffer) => {
      shellTerminal.write(data);
    },
    (data: Buffer) => {
      shellTerminal.write(data);
    },
    reconnect,
  );

  onDataDisposable?.dispose();
  onDataDisposable = shellTerminal.onData(data => {
    window.kubernetesExecSend(id!, data).catch((err: unknown) => console.error('Error sending data', err));
  });

  const fitAddon = new FitAddon();
  serializeAddon = new SerializeAddon();
  shellTerminal.loadAddon(fitAddon);
  shellTerminal.loadAddon(serializeAddon);
  shellTerminal.open(container);

  window.addEventListener('resize', () => {
    const resizeAsync = async () => {
      //resize all opened terminals
      if (curRouterPath.endsWith('/k8s-terminal')) {
        fitAddon.fit();
        if (id) {
          await window.kubernetesExecResize(id, shellTerminal.cols, shellTerminal.rows);
        }
      }
    };
    resizeAsync().catch(console.error);
  });
  fitAddon.fit();

  await window.kubernetesExecResize(id, shellTerminal.cols, shellTerminal.rows);
}

function getSavedTerminalState(podName: string, containerName: string): State | undefined {
  let state;
  terminalStates.subscribe(states => {
    state = states.get(`${podName}-${containerName}`);
  })();
  return state ? (state as unknown as State) : undefined;
}

function saveTerminalState(podName: string, containerName: string, state: State) {
  terminalStates.update(states => {
    states.set(`${podName}-${containerName}`, state);
    return states;
  });
}
</script>

<div class="h-full w-full p-[5px] pr-0 bg-[var(--pd-terminal-background)]" bind:this={terminalXtermDiv}></div>
