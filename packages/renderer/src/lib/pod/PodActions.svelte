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
export let dropdownMenu: boolean = false;
export let detailed: boolean = false;

export let inProgressCallback: (inProgress: boolean, state?: string) => void = () => {};
export let errorCallback: (erroMessage: string) => void = () => {};

async function startPod(podInfoUI: PodInfoUI) {
  inProgressCallback(true, 'STARTING');
  try {
    await window.startPod(podInfoUI.engineId, podInfoUI.id);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
}

async function restartPod(podInfoUI: PodInfoUI) {
  inProgressCallback(true, 'RESTARTING');
  try {
    await window.restartPod(podInfoUI.engineId, podInfoUI.id);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
}

async function stopPod(podInfoUI: PodInfoUI) {
  inProgressCallback(true);
  try {
    await window.stopPod(podInfoUI.engineId, podInfoUI.id);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
}

async function removePod(podInfoUI: PodInfoUI): Promise<void> {
  inProgressCallback(true, 'REMOVING');
  try {
    if (pod.kind === 'podman') {
      await window.removePod(podInfoUI.engineId, podInfoUI.id);
    } else {
      await window.kubernetesDeletePod(podInfoUI.name);
    }
    router.goto('/pods/');
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
}

function openGenerateKube(): void {
  router.goto(`/pods/${encodeURI(pod.kind)}/${encodeURI(pod.name)}/${encodeURI(pod.engineId)}/kube`);
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

{#if pod.kind === 'podman'}
  <ListItemButtonIcon
    title="Start Pod"
    onClick="{() => startPod(pod)}"
    hidden="{pod.status === 'RUNNING'}"
    detailed="{detailed}"
    icon="{faPlay}" />
  <ListItemButtonIcon
    title="Stop Pod"
    onClick="{() => stopPod(pod)}"
    hidden="{!(pod.status === 'RUNNING')}"
    detailed="{detailed}"
    icon="{faStop}" />
{/if}
<ListItemButtonIcon title="Delete Pod" onClick="{() => removePod(pod)}" icon="{faTrash}" detailed="{detailed}" />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this="{actionsStyle}">
  {#if pod.kind === 'podman'}
    {#if !detailed}
      <ListItemButtonIcon
        title="Generate Kube"
        onClick="{() => openGenerateKube()}"
        menu="{dropdownMenu}"
        detailed="{detailed}"
        icon="{faFileCode}" />
    {/if}
    <ListItemButtonIcon
      title="Deploy to Kubernetes"
      onClick="{() => deployToKubernetes()}"
      menu="{dropdownMenu}"
      detailed="{detailed}"
      icon="{faRocket}" />
  {/if}
  <ListItemButtonIcon
    title="Restart Pod"
    onClick="{() => restartPod(pod)}"
    menu="{dropdownMenu}"
    detailed="{detailed}"
    icon="{faArrowsRotate}" />
</svelte:component>
