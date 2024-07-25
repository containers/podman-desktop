<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { type IDisposable, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { getPanelDetailColor } from '/@/lib/color/color';
import { terminalStates } from '/@/stores/kubernetes-terminal-state-store';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';

export let podName: string;
export let containerName: string;

export let terminalXtermDiv: HTMLElement = document.createElement('div');
let curRouterPath: string;

interface State {
  terminal: Terminal;
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

  if (savedState) {
    shellTerminal = savedState.terminal;
    id = savedState.id;
    removeAllChildren(terminalXtermDiv);
    shellTerminal.open(terminalXtermDiv);
  } else {
    await initializeNewTerminal(terminalXtermDiv);
  }
});

onDestroy(() => {
  saveTerminalState(podName, containerName, { terminal: shellTerminal, id: id } as State);
});

function removeAllChildren(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

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
        window.kubernetesExecSend(id!, data);
      });
    });
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
    theme: {
      background: getPanelDetailColor(),
    },
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
    window.kubernetesExecSend(id!, data);
  });

  const fitAddon = new FitAddon();
  shellTerminal.loadAddon(fitAddon);
  removeAllChildren(container);
  shellTerminal.open(container);
  fitAddon.fit();

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

<div class="h-full w-full" bind:this={terminalXtermDiv}></div>
