<script lang="ts">
import type { SecretInfo } from '@desktop-framework/api';

import DetailsCell from '/@/lib/details/DetailsCell.svelte';
import DetailsTable from '/@/lib/details/DetailsTable.svelte';
import DetailsTitle from '/@/lib/details/DetailsTitle.svelte';

interface Props {
  secret: SecretInfo;
}

let { secret }: Props = $props();
let labels = $derived(secret?.Labels ? Object.entries(secret.Labels) : []);
</script>

<DetailsTable>
  <tr>
    <DetailsTitle>Details</DetailsTitle>
  </tr>
  <tr>
    <DetailsCell>Name</DetailsCell>
    <DetailsCell>{secret.Name}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>ID</DetailsCell>
    <DetailsCell>{secret.Id}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Created</DetailsCell>
    <DetailsCell>{secret.CreatedAt ?? 'N/A'}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Updated</DetailsCell>
    <DetailsCell>{secret.UpdatedAt ?? 'N/A'}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine Name</DetailsCell>
    <DetailsCell>{secret.engineName}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine ID</DetailsCell>
    <DetailsCell>{secret.engineId}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine Type</DetailsCell>
    <DetailsCell>{secret.engineType}</DetailsCell>
  </tr>
  <tr>
    <DetailsTitle>Labels</DetailsTitle>
  </tr>
  {#if labels.length === 0}
    <tr>
      <DetailsCell>No labels</DetailsCell>
    </tr>
  {:else}
    {#each labels as [key, value] (key)}
      <tr>
        <DetailsCell>{key}</DetailsCell>
        <DetailsCell>{value}</DetailsCell>
      </tr>
    {/each}
  {/if}
</DetailsTable>
