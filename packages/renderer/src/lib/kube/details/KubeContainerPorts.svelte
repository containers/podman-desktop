<script lang="ts">
import type { V1ContainerPort } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';

interface Props {
  ports?: V1ContainerPort[];
}

let { ports }: Props = $props();
</script>

{#if ports && ports.length > 0}
  <tr>
    <Cell class="flex">Ports</Cell>
    <Cell>
      <div class="flex gap-y-1 flex-col">
        {#each ports as port (port.containerPort)}
        <span>
          {port.containerPort}/{port.protocol}
        </span>
        {/each}
      </div>
    </Cell>
  </tr>
{/if}

