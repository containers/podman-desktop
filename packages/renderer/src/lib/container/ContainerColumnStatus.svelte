<script lang="ts">
import PodIcon from '../images/PodIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;
</script>

{#if 'type' in object}
  <StatusIcon icon="{PodIcon}" status="{object.status}" />
{:else if 'state' in object}
  <StatusIcon icon="{object.icon}" status="{object.state}" />
{/if}
