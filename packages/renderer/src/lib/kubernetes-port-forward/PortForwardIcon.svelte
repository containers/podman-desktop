<script lang="ts">
import { faEthernet } from '@fortawesome/free-solid-svg-icons';
import { StatusIcon } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import type { ForwardConfig } from '/@api/kubernetes-port-forward-model';

interface Props {
  object: ForwardConfig;
}
let { object }: Props = $props();
</script>

{#snippet Ethernet()}
  <Fa class="w-[20px]" scale={1.5} icon={faEthernet} />
{/snippet}

{#if object}
  <StatusIcon status="RUNNING" icon={Ethernet} />
{/if}
