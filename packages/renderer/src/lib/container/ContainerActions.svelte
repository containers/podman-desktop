<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;

async function startContainer(containerInfo: ContainerInfoUI) {
  await window.startContainer(containerInfo.engine, containerInfo.id);
  console.log('container started');
}

async function restartContainer(containerInfo: ContainerInfoUI) {
  await window.restartContainer(containerInfo.engine, containerInfo.id);
  console.log('container restarted');
}

async function stopContainer(containerInfo: ContainerInfoUI) {
  await window.stopContainer(containerInfo.engine, containerInfo.id);
  console.log('container stopped');
}
function openBrowser(containerInfo: ContainerInfoUI): void {
  console.log('opening url', containerInfo.openingUrl);
  window.openExternal(containerInfo.openingUrl);
}
</script>

<button
  title="Open Browser"
  on:click="{() => openBrowser(container)}"
  hidden
  class:block="{container.state === 'RUNNING' && container.hasPublicPort}"
  ><Fa class="h-10 w-10 cursor-pointer rounded-full text-3xl text-sky-800" icon="{faExternalLinkSquareAlt}" /></button>
<button
  title="Start Container"
  on:click="{() => startContainer(container)}"
  hidden
  class:block="{container.state !== 'RUNNING'}"
  ><Fa class="h-10 w-10 cursor-pointer rounded-full text-3xl text-sky-800" icon="{faPlayCircle}" /></button>
<button
  title="Stop Container"
  on:click="{() => stopContainer(container)}"
  hidden
  class:block="{container.state === 'RUNNING'}"
  ><Fa class="h-10 w-10 cursor-pointer rounded-full text-3xl text-sky-800" icon="{faStopCircle}" /></button>
<button
  title="Restart Container"
  on:click="{() => restartContainer(container)}"
  class="disabled:opacity-25  cursor-pointer disabled:cursor-default">
  <Fa class="h-10 w-10 rounded-full text-3xl text-sky-800" icon="{faArrowsRotate}" /></button>
