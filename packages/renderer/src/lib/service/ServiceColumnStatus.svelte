<script lang="ts">
import ServiceIcon from '../images/ServiceIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import type { ServiceUI } from './ServiceUI';

export let object: ServiceUI;
</script>

<StatusIcon icon="{ServiceIcon}" status="{object.status}" />
