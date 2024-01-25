<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { DeploymentUI } from './DeploymentUI';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { createEventDispatcher } from 'svelte';

export let deployment: DeploymentUI;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: DeploymentUI }>();

async function deleteDeployment(): Promise<void> {
  deployment.status = 'DELETING';
  dispatch('update', deployment);

  await window.kubernetesDeleteDeployment(deployment.name);
}
</script>

<ListItemButtonIcon
  title="Delete Deployment"
  confirm="{true}"
  onClick="{() => deleteDeployment()}"
  detailed="{detailed}"
  icon="{faTrash}" />
