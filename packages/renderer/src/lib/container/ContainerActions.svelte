<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPlayCircle, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import type { ContainerInfoUI } from './ContainerInfoUI';
import { router } from 'tinro';

export let container: ContainerInfoUI;

const buttonStyle = 'flex p-2 mx-2 border border-violet-500 hover:border-violet-600 shadow-md shadow-gray-900 ';
const iconStyle = 'items-center align-middle h-full w-6 cursor-pointer text-2xl text-violet-500 hover:text-violet-600 ';

async function startContainer(containerInfo: ContainerInfoUI) {
  await window.startContainer(containerInfo.engineId, containerInfo.id);
}

async function restartContainer(containerInfo: ContainerInfoUI) {
  await window.restartContainer(containerInfo.engineId, containerInfo.id);
}

async function stopContainer(containerInfo: ContainerInfoUI) {
  await window.stopContainer(containerInfo.engineId, containerInfo.id);
}
function openBrowser(containerInfo: ContainerInfoUI): void {
  window.openExternal(containerInfo.openingUrl);
}

async function deleteContainer(containerInfo: ContainerInfoUI): Promise<void> {
  await window.deleteContainer(containerInfo.engineId, containerInfo.id);
  router.goto('/containers/');
}
function openTerminalContainer(containerInfo: ContainerInfoUI): void {
  router.goto(`/containers/${container.id}/terminal`);
}
</script>

<button
  title="Open Browser"
  on:click="{() => openBrowser(container)}"
  hidden
  class="{buttonStyle}"
  class:block="{container.state === 'RUNNING' && container.hasPublicPort}"
  ><Fa class="{iconStyle}" icon="{faExternalLinkSquareAlt}" /></button>
<button
  title="Open Terminal"
  class="{buttonStyle}"
  on:click="{() => openTerminalContainer(container)}"
  hidden
  class:block="{container.state === 'RUNNING'}"><Fa class="{iconStyle}" icon="{faTerminal}" /></button>
<button
  title="Start Container"
  class="{buttonStyle}"
  on:click="{() => startContainer(container)}"
  hidden
  class:block="{container.state !== 'RUNNING'}"><Fa class="{iconStyle}" icon="{faPlayCircle}" /></button>
<button
  title="Stop Container"
  class="{buttonStyle}"
  on:click="{() => stopContainer(container)}"
  hidden
  class:block="{container.state === 'RUNNING'}"><Fa class="{iconStyle}" icon="{faStopCircle}" /></button>
<button title="Restart Container" class="{buttonStyle}" on:click="{() => restartContainer(container)}">
  <Fa class="{iconStyle}" icon="{faArrowsRotate}" /></button>
<button class="{buttonStyle}" title="Delete Container" on:click="{() => deleteContainer(container)}">
  <Fa class="{iconStyle}" icon="{faTrash}" /></button>
