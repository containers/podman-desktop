<script lang="ts">
import PodIcon from '../images/PodIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;
</script>

{#if 'type' in object && object.type === ContainerGroupInfoTypeUI.POD}
  <StatusIcon icon="{PodIcon}" status="{object.status}" />
{:else if 'type' in object && object.type === ContainerGroupInfoTypeUI.COMPOSE}
  <StatusIcon icon="{PodIcon}" status="{object.status}" />
{:else if 'state' in object}
  <StatusIcon icon="{object.icon}" status="{object.state}" />
{/if}
