<script lang="ts">
import { StatusIcon } from '@podman-desktop/ui-svelte';

import PodIcon from '../images/PodIcon.svelte';
import { ContainerUtils } from './container-utils';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;

const containerUtils = new ContainerUtils();
</script>

{#if containerUtils.isContainerGroupInfoUI(object)}
  <StatusIcon icon={PodIcon} status={object.status} />
{:else if containerUtils.isContainerInfoUI(object)}
  <StatusIcon icon={object.icon} status={object.state} />
{/if}
