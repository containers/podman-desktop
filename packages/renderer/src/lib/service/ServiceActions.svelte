<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';

import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import type { ServiceUI } from './ServiceUI';

export let service: ServiceUI;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: ServiceUI }>();

export let onUpdate: (service: ServiceUI) => void = service => {
  dispatch('update', service);
};

async function deleteService(): Promise<void> {
  service.status = 'DELETING';
  onUpdate(service);

  await window.kubernetesDeleteService(service.name);
}
</script>

<ListItemButtonIcon
  title="Delete Service"
  onClick={() => withConfirmation(deleteService, `delete service ${service.name}`)}
  detailed={detailed}
  icon={faTrash} />
