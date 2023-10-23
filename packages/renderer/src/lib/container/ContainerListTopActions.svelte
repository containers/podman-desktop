<script lang="ts">
/*
  This component displays 3 buttons:
  - Prune containers
  - Create a container
  - Play Kube YAML

  The `enginesList` property indicates the engines on which the Prune action will work on

  A `createContainer` event is sent when the "Create a container" button is clicked
*/
import { createEventDispatcher } from 'svelte';
import Prune from '../engine/Prune.svelte';
import KubePlayButton from '../kube/KubePlayButton.svelte';
import Button from '../ui/Button.svelte';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { containersInfos } from '/@/stores/containers';
import type { EngineInfoUI } from '../engine/EngineInfoUI';
import { providerInfos } from '../../stores/providers';

export let enginesList: EngineInfoUI[];

const dispatch = createEventDispatcher();

$: providerPodmanConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  // keep only podman providers as it is not supported by docker
  .filter(providerContainerConnection => providerContainerConnection.type === 'podman')
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

function toggleCreateContainer() {
  dispatch('createContainer');
}
</script>

<div class="space-x-2 flex flex-nowrap">
  <!-- Only show if there are containers-->
  {#if $containersInfos.length > 0}
    <Prune type="containers" engines="{enginesList}" />
  {/if}
  <Button on:click="{() => toggleCreateContainer()}" icon="{faPlusCircle}">Create a container</Button>
  {#if providerPodmanConnections.length > 0}
    <KubePlayButton />
  {/if}
</div>
