<script lang="ts">
import PodActions from '../pod/PodActions.svelte';
import type { ContainerGroupInfoUI } from './ContainerInfoUI';

export let object: ContainerGroupInfoUI;
</script>

{#if object.engineId && object.id && object.shortId && object.status && object.engineName && object.humanCreationDate && object.created}
  <PodActions
    pod={{
      id: object.id,
      shortId: object.shortId,
      status: object.status,
      name: object.name,
      engineId: object.engineId,
      engineName: object.engineName,
      age: object.humanCreationDate,
      created: object.created,
      selected: false,
      containers: object.containers.map(container => ({
        Id: container.id,
        Names: container.name,
        Status: container.state,
      })),
      kind: 'podman',
    }}
    dropdownMenu={true}
    on:update />
{/if}
