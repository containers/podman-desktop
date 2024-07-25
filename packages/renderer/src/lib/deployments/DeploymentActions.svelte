<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';

import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import type { DeploymentUI } from './DeploymentUI';

export let deployment: DeploymentUI;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: DeploymentUI }>();
export let onUpdate: (update: DeploymentUI) => void = update => {
  dispatch('update', update);
};
async function deleteDeployment(): Promise<void> {
  deployment.status = 'DELETING';
  onUpdate(deployment);

  await window.kubernetesDeleteDeployment(deployment.name);
}
</script>

<ListItemButtonIcon
  title="Delete Deployment"
  onClick={() => withConfirmation(deleteDeployment, `delete deployment ${deployment.name}`)}
  detailed={detailed}
  icon={faTrash} />
