<script lang="ts">
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import ComposeActions from '../compose/ComposeActions.svelte';
import PodActions from '../pod/PodActions.svelte';
import ContainerActions from './ContainerActions.svelte';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;
</script>

{#if object.type === ContainerGroupInfoTypeUI.POD && object.engineId && object.id && object.shortId && object.status && object.engineName && object.humanCreationDate && object.created}
  <PodActions
    pod="{{
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
    }}"
    dropdownMenu="{true}"
    on:update />
{/if}
{#if object.type === ContainerGroupInfoTypeUI.COMPOSE && object.status && object.engineId && object.engineType}
  <ComposeActions
    compose="{{
      status: object.status,
      name: object.name,
      engineId: object.engineId,
      engineType: object.engineType,
      containers: object.containers,
    }}"
    dropdownMenu="{true}"
    on:update />
{/if}
{#if object.state}
  {#if object.actionError}
    <ErrorMessage error="{object.actionError}" icon />
  {/if}
  <ContainerActions container="{object}" dropdownMenu="{true}" on:update />
{/if}
