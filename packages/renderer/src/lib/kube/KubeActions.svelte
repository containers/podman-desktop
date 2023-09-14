<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import type { PodUIInfo } from '../../../../main/src/plugin/api/kubernetes-info';

export let pod: PodUIInfo;
export let detailed = false;

export let inProgressCallback: (inProgress: boolean, state?: string) => void = () => {};
export let errorCallback: (erroMessage: string) => void = () => {};

async function deletePod(podInfoUI: PodUIInfo): Promise<void> {
  inProgressCallback(true, 'DELETING');
  try {
    await window.kubernetesDeletePod(podInfoUI.name);
  } catch (error) {
    errorCallback(String(error));
  } finally {
    inProgressCallback(false);
  }
}
</script>

<ListItemButtonIcon title="Delete Pod" onClick="{() => deletePod(pod)}" icon="{faTrash}" detailed="{detailed}" />
