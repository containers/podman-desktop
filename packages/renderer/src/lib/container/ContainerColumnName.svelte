<script lang="ts">
import { ContainerUtils } from './container-utils';
import ContainerColumnNameContainer from './ContainerColumnNameContainer.svelte';
import ContainerColumnNameGroup from './ContainerColumnNameGroup.svelte';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;

const containerUtils = new ContainerUtils();
</script>

{#if containerUtils.isContainerGroupInfoUI(object)}
  <ContainerColumnNameGroup object={object} />
{:else if containerUtils.isContainerInfoUI(object)}
  <ContainerColumnNameContainer object={object} />
{/if}
