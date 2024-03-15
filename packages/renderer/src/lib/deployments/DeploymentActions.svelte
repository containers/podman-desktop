<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';

import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import type { DeploymentUI } from './DeploymentUI';

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
