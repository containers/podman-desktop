<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import { EmptyScreen } from '@podman-desktop/ui-svelte';
import type { Terminal } from '@xterm/xterm';
import { onMount } from 'svelte';

import NoLogIcon from '../ui/NoLogIcon.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;
export let screenReaderMode = false;
let attachContainerTerminal: Terminal;
let closed = false;

// update terminal when receiving data
function receiveDataCallback(data: Buffer) {
  attachContainerTerminal.write(data.toString());
}

function receiveEndCallback() {
  closed = true;
}

// call exec command
async function attachToContainer() {
  if (container.state !== 'RUNNING') {
    return;
  }

  // attach to the container
  const callbackId = await window.attachContainer(
    container.engineId,
    container.id,
    receiveDataCallback,
    () => {},
    receiveEndCallback,
  );

  // pass data from xterm to container
  attachContainerTerminal?.onData(data => {
    window.attachContainerSend(callbackId, data);
  });
}

onMount(async () => {
  await attachToContainer();
});
</script>

<div class="h-full" class:hidden={container.state !== 'RUNNING'}>
  <TerminalWindow class="h-full" bind:terminal={attachContainerTerminal} screenReaderMode={screenReaderMode} />
</div>

<EmptyScreen
  hidden={!closed && container.state !== 'RUNNING'}
  icon={NoLogIcon}
  title="No TTY"
  message="Tty has stopped" />

<EmptyScreen
  hidden={container.state === 'RUNNING'}
  icon={NoLogIcon}
  title="No TTY"
  message="Container is not running" />
