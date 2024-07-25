<script lang="ts">
import { StatusIcon } from '@podman-desktop/ui-svelte';

import NodeIcon from '../images/NodeIcon.svelte';
import type { NodeUI } from './NodeUI';

export let object: NodeUI;
</script>

<StatusIcon icon={NodeIcon} status={object.status} />
