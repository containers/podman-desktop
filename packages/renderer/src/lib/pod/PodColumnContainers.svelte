<script lang="ts">
import { router } from 'tinro';

import Dots from '../ui/Dots.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;

function openContainersFromPod(pod: PodInfoUI) {
  router.goto(`/containers/?filter=${pod.shortId}`);
}
</script>

<!-- If this is podman, make the dots clickable as it'll take us to the container menu 
this does not work if you click on a kubernetes type pod -->
{#if object.kind === 'podman'}
  <button class:cursor-pointer={object.containers.length > 0} on:click={() => openContainersFromPod(object)}>
    <Dots containers={object.containers} />
  </button>
{:else}
  <Dots containers={object.containers} />
{/if}
