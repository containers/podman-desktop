<script lang="ts">
import IngressRouteActions from './IngressRouteActions.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;
</script>

<IngressRouteActions ingressRoute={object} on:update />
