<script lang="ts">
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

export let object: IngressUI | RouteUI;
</script>

<div class="text-sm text-gray-300">{object.name}</div>
