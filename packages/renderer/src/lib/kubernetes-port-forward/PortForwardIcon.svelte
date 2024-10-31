<script lang="ts">
import { faEthernet } from '@fortawesome/free-solid-svg-icons';
import { StatusIcon } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import type { PortForwardRow } from '/@/lib/kubernetes-port-forward/port-forward-row';

interface Props {
  object: PortForwardRow;
}
let { object }: Props = $props();
</script>

{#snippet Ethernet()}
  <Fa class="w-[20px]" scale={1.5} icon={faEthernet} />
{/snippet}

{#if object}
  <StatusIcon status="RUNNING" icon={Ethernet} />
{/if}
