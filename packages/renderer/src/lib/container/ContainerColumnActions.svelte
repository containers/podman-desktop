<script lang="ts">
import { ContainerUtils } from './container-utils';
import ContainerColumnActionsCompose from './ContainerColumnActionsCompose.svelte';
import ContainerColumnActionsContainer from './ContainerColumnActionsContainer.svelte';
import ContainerColumnActionsPod from './ContainerColumnActionsPod.svelte';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;

const containerUtils = new ContainerUtils();
</script>

{#if containerUtils.isContainerGroupInfoUI(object)}
  {#if object.type === ContainerGroupInfoTypeUI.POD}
    <ContainerColumnActionsPod object={object} on:update />
  {:else if object.type === ContainerGroupInfoTypeUI.COMPOSE}
    <ContainerColumnActionsCompose object={object} on:update />
  {/if}
{:else if containerUtils.isContainerInfoUI(object)}
  <ContainerColumnActionsContainer object={object} on:update />
{/if}
