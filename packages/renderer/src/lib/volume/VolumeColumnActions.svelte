<script lang="ts">
import VolumeActions from './VolumeActions.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

export let object: VolumeInfoUI;
</script>

<VolumeActions volume={object} on:update />
