<script lang="ts">
import { faFileCode, faPlayCircle, faRocket, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { PodInfoUI } from './PodInfoUI';
import { router } from 'tinro';
import Fa from 'svelte-fa/src/fa.svelte';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import ListItemButtonIconMenu from '../ui/ListItemButtonIconMenu.svelte';

export let pod: PodInfoUI;

async function startPod(podInfoUI: PodInfoUI) {
  await window.startPod(podInfoUI.engineId, podInfoUI.id);
}

async function restartPod(podInfoUI: PodInfoUI) {
  toggleMenu();
  await window.restartPod(podInfoUI.engineId, podInfoUI.id);
}

async function stopPod(podInfoUI: PodInfoUI) {
  await window.stopPod(podInfoUI.engineId, podInfoUI.id);
}

async function removePod(podInfoUI: PodInfoUI): Promise<void> {
  toggleMenu();
  await window.removePod(podInfoUI.engineId, podInfoUI.id);
  router.goto('/pods/');
}

function openGenerateKube(): void {
  router.goto(`/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/kube`);
}

function deployToKubernetes(): void {
  router.goto(`/deploy-to-kube/${pod.id}/${pod.engineId}`);
}

// Toggle the container actions menu by "clicking" the menu button again
async function toggleMenu() {
  document.getElementById(pod.id).click();
}
</script>

<ListItemButtonIcon
  title="Start Pod"
  onClick="{() => startPod(pod)}"
  hidden="{pod.status === 'RUNNING'}"
  icon="{faPlayCircle}" />
<ListItemButtonIcon
  title="Stop Pod"
  onClick="{() => stopPod(pod)}"
  hidden="{!(pod.status === 'RUNNING')}"
  icon="{faStopCircle}" />

<!-- Create a "kebab" menu for additional actions. -->
<div class="relative inline-block text-left">
  <!-- We use a "checkbox" input in order to use the peer:checked functionality of tailwindcss 
    this avoids us having to implement a manual custom.css for menus -->
  <input class="sr-only peer text-red-600" type="checkbox" value="yes" name="answer" id="{pod.id}" />

  <!-- Label it similar to all the other container action icons -->
  <label
    class="mx-1 text-gray-300 hover:text-violet-600 font-medium rounded-lg text-sm inline-flex items-center p-2 text-center "
    for="{pod.id}">
    <Fa class="h-4 w-4 text-xl" icon="{faEllipsisVertical}" />
  </label>

  <!-- Dropdown menu for all other actions -->
  <div
    id="dropdown"
    class="peer-checked:block hidden origin-top-right absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-zinc-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-300 focus:outline-none">
    <ListItemButtonIconMenu title="Generate Kube" onClick="{() => openGenerateKube()}" icon="{faFileCode}" />
    <ListItemButtonIconMenu title="Deploy to Kubernetes" onClick="{() => deployToKubernetes()}" icon="{faRocket}" />
    <ListItemButtonIconMenu title="Restart Pod" onClick="{() => restartPod(pod)}" icon="{faArrowsRotate}" />
    <ListItemButtonIconMenu title="Delete Pod" onClick="{() => removePod(pod)}" icon="{faTrash}" />
  </div>
</div>
