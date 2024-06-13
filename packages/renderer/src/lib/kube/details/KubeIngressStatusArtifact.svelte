<script lang="ts">
import type { V1IngressStatus } from '@kubernetes/client-node';

import Cell from '/@/lib/details/DetailsCell.svelte';
import Title from '/@/lib/details/DetailsTitle.svelte';

export let artifact: V1IngressStatus | undefined;
</script>

<!-- This artifact is a bit weird as it only contains one object
    so do not bother showing unless we have both loadBalancer AND loadBalancer.ingress -->
{#if artifact?.loadBalancer?.ingress}
  <tr>
    <Title>Status</Title>
  </tr>
  <tr>
    <Cell>Load Balancer</Cell>
    <Cell>
      {#each artifact.loadBalancer?.ingress as ingress}
        <div>{ingress.ip ?? ingress.hostname}</div>
      {/each}
    </Cell>
  </tr>
{/if}
