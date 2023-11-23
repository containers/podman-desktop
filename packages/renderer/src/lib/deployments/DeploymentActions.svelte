<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { DeploymentUI } from './DeploymentUI';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';

export let deployment: DeploymentUI;
export let detailed = false;

async function deleteDeployment(): Promise<void> {
  await window.kubernetesDeleteDeployment(deployment.name);
}
</script>

<ListItemButtonIcon
  title="Delete Deployment"
  onClick="{() => deleteDeployment()}"
  detailed="{detailed}"
  icon="{faTrash}" />
