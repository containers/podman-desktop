<script lang="ts">
import PVCActions from './PVCActions.svelte';
import type { PVCUI } from './PVCUI';

export let object: PVCUI;
</script>

<PVCActions pvc={object} on:update />
