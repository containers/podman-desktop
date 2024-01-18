<script lang="ts">
import IngressRouteIcon from '../images/IngressRouteIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;
</script>

<StatusIcon icon="{IngressRouteIcon}" status="{object.status}" />
