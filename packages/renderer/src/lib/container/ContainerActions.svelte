<script lang="ts">
import { faEllipsisVertical, faFileCode, faPlayCircle, faRocket, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { ContainerGroupInfoTypeUI, ContainerInfoUI } from './ContainerInfoUI';
import Fa from 'svelte-fa/src/fa.svelte';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import ListItemButtonIconMenu from '../ui/ListItemButtonIconMenu.svelte';

export let container: ContainerInfoUI;

async function startContainer(containerInfo: ContainerInfoUI) {
  await window.startContainer(containerInfo.engineId, containerInfo.id);
}

async function restartContainer(containerInfo: ContainerInfoUI) {
  toggleMenu();
  await window.restartContainer(containerInfo.engineId, containerInfo.id);
}

async function stopContainer(containerInfo: ContainerInfoUI) {
  await window.stopContainer(containerInfo.engineId, containerInfo.id);
}
function openBrowser(containerInfo: ContainerInfoUI): void {
  toggleMenu();
  window.openExternal(containerInfo.openingUrl);
}

async function deleteContainer(containerInfo: ContainerInfoUI): Promise<void> {
  toggleMenu();
  await window.deleteContainer(containerInfo.engineId, containerInfo.id);
  router.goto('/containers/');
}
function openTerminalContainer(containerInfo: ContainerInfoUI): void {
  toggleMenu();
  router.goto(`/containers/${container.id}/terminal`);
}

function openGenerateKube(): void {
  toggleMenu();
  router.goto(`/containers/${container.id}/kube`);
}

function deployToKubernetes(): void {
  toggleMenu();
  router.goto(`/deploy-to-kube/${container.id}/${container.engineId}`);
}

// Toggle the container actions menu by "clicking" the menu button again
async function toggleMenu() {
  document.getElementById(container.id).click();
}
</script>

<ListItemButtonIcon
  title="Start Container"
  onClick="{() => startContainer(container)}"
  hidden="{container.state === 'RUNNING'}"
  icon="{faPlayCircle}" />

<ListItemButtonIcon
  title="Stop Container"
  onClick="{() => stopContainer(container)}"
  hidden="{!(container.state === 'RUNNING')}"
  icon="{faStopCircle}" />

<!-- Create a "kebab" menu for additional actions. -->
<div class="relative inline-block text-left">
  <!-- We use a "checkbox" input in order to use the peer:checked functionality of tailwindcss 
    this avoids us having to implement a manual custom.css for menus -->
  <input class="sr-only peer text-red-600" type="checkbox" value="yes" name="answer" id="{container.id}" />

  <!-- Label it similar to all the other container action icons -->
  <label
    class="mx-1 text-gray-300 hover:text-violet-600 font-medium rounded-lg text-sm inline-flex items-center p-2 text-center "
    for="{container.id}">
    <Fa class="h-4 w-4 text-xl" icon="{faEllipsisVertical}" />
  </label>

  <!-- Dropdown menu for all other actions -->
  <div
    id="dropdown"
    class="peer-checked:block hidden origin-top-right absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-zinc-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-300 focus:outline-none">
    <ListItemButtonIconMenu
      title="Generate Kube"
      onClick="{() => openGenerateKube()}"
      hidden="{!(
        container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE
      )}"
      icon="{faFileCode}" />
    <ListItemButtonIconMenu
      title="Deploy to Kubernetes"
      onClick="{() => deployToKubernetes()}"
      hidden="{!(
        container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE
      )}"
      icon="{faRocket}" />
    <ListItemButtonIconMenu
      title="Open Browser"
      onClick="{() => openBrowser(container)}"
      hidden="{!(container.state === 'RUNNING' && container.hasPublicPort)}"
      icon="{faExternalLinkSquareAlt}" />
    <ListItemButtonIconMenu
      title="Open Terminal"
      onClick="{() => openTerminalContainer(container)}"
      hidden="{!(container.state === 'RUNNING')}"
      icon="{faTerminal}" />
    <ListItemButtonIconMenu
      title="Restart Container"
      onClick="{() => restartContainer(container)}"
      icon="{faArrowsRotate}" />
    <ListItemButtonIconMenu title="Delete Container" onClick="{() => deleteContainer(container)}" icon="{faTrash}" />
  </div>
</div>
