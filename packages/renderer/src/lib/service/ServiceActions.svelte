<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { ServiceUI } from './ServiceUI';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { createEventDispatcher } from 'svelte';

export let service: ServiceUI;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: ServiceUI }>();

async function deleteService(): Promise<void> {
  service.status = 'DELETING';
  dispatch('update', service);

  await window.kubernetesDeleteService(service.name);
}
</script>

<ListItemButtonIcon
  title="Delete Service"
  confirm="{true}"
  onClick="{() => deleteService()}"
  detailed="{detailed}"
  icon="{faTrash}" />
