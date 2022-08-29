<script lang="ts">
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { PodInfoUI } from './PodInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';

export let pod: PodInfoUI;
export let backgroundColor = 'bg-zinc-800';

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
</script>

<ListItemButtonIcon
  title="Start Pod"
  onClick="{() => startPod(pod)}"
  hidden="{pod.status === 'RUNNING'}"
  backgroundColor="{backgroundColor}"
  icon="{faPlayCircle}" />
<ListItemButtonIcon
  title="Stop Pod"
  onClick="{() => stopPod(pod)}"
  hidden="{!(pod.status === 'RUNNING')}"
  backgroundColor="{backgroundColor}"
  icon="{faStopCircle}" />
<ListItemButtonIcon
  title="Restart Pod"
  onClick="{() => restartPod(pod)}"
  backgroundColor="{backgroundColor}"
  icon="{faArrowsRotate}" />
<ListItemButtonIcon
  title="Delete Pod"
  onClick="{() => removePod(pod)}"
  backgroundColor="{backgroundColor}"
  icon="{faTrash}" />
