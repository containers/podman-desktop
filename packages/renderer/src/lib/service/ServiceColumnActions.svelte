<script lang="ts">
import ServiceActions from './ServiceActions.svelte';
import type { ServiceUI } from './ServiceUI';

export let object: ServiceUI;
</script>

<ServiceActions service={object} on:update />
