<script lang="ts">
import NodeIcon from '../images/NodeIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import type { NodeUI } from './NodeUI';

export let object: NodeUI;
</script>

<StatusIcon icon="{NodeIcon}" status="{object.status}" />
