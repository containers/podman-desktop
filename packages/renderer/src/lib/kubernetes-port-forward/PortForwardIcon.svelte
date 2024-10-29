<script lang="ts">
import { faEthernet } from '@fortawesome/free-solid-svg-icons';
import { StatusIcon } from '@podman-desktop/ui-svelte';

import type { PortForwardRow } from '/@/lib/kubernetes-port-forward/port-forward-row';

interface Props {
  object: PortForwardRow;
}
let { object }: Props = $props();
</script>

{#if object}
  <StatusIcon status="RUNNING" icon={faEthernet} />
{/if}
