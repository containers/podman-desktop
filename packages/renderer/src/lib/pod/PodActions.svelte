<script lang="ts">
import { faFileCode, faPlay, faRocket } from '@fortawesome/free-solid-svg-icons';
import { faStop } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { PodInfoUI } from './PodInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import DropdownMenu from '../ui/DropdownMenu.svelte';
import FlatMenu from '../ui/FlatMenu.svelte';

export let pod: PodInfoUI;
export let backgroundColor = 'bg-zinc-800';
export let dropdownMenu: boolean = false;

async function startPod(podInfoUI: PodInfoUI) {
  await window.startPod(podInfoUI.engineId, podInfoUI.id);
}

async function restartPod(podInfoUI: PodInfoUI) {
  await window.restartPod(podInfoUI.engineId, podInfoUI.id);
}

async function stopPod(podInfoUI: PodInfoUI) {
  await window.stopPod(podInfoUI.engineId, podInfoUI.id);
}

async function removePod(podInfoUI: PodInfoUI): Promise<void> {
  await window.removePod(podInfoUI.engineId, podInfoUI.id);
  router.goto('/pods/');
}

function openGenerateKube(): void {
  router.goto(`/pods/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/kube`);
}

function deployToKubernetes(): void {
  router.goto(`/deploy-to-kube/${pod.id}/${pod.engineId}`);
}
// If dropdownMenu = true, we'll change style to the imported dropdownMenu style
// otherwise, leave blank.
let actionsStyle;
if (dropdownMenu) {
  actionsStyle = DropdownMenu;
} else {
  actionsStyle = FlatMenu;
}
</script>

<ListItemButtonIcon
  title="Start Pod"
  onClick="{() => startPod(pod)}"
  hidden="{pod.status === 'RUNNING'}"
  backgroundColor="{backgroundColor}"
  icon="{faPlay}" />
<ListItemButtonIcon
  title="Stop Pod"
  onClick="{() => stopPod(pod)}"
  hidden="{!(pod.status === 'RUNNING')}"
  backgroundColor="{backgroundColor}"
  icon="{faStop}" />
<ListItemButtonIcon
  title="Delete Pod"
  onClick="{() => removePod(pod)}"
  backgroundColor="{backgroundColor}"
  icon="{faTrash}" />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this="{actionsStyle}" backgroundColor="{backgroundColor}">
  <ListItemButtonIcon
    title="Generate Kube"
    onClick="{() => openGenerateKube()}"
    menu="{dropdownMenu}"
    backgroundColor="{backgroundColor}"
    icon="{faFileCode}" />
  <ListItemButtonIcon
    title="Deploy to Kubernetes"
    onClick="{() => deployToKubernetes()}"
    menu="{dropdownMenu}"
    backgroundColor="{backgroundColor}"
    icon="{faRocket}" />
  <ListItemButtonIcon
    title="Restart Pod"
    onClick="{() => restartPod(pod)}"
    menu="{dropdownMenu}"
    backgroundColor="{backgroundColor}"
    icon="{faArrowsRotate}" />
</svelte:component>
