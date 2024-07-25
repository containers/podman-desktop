<script lang="ts">
import { Link } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import DetailsCell from '../details/DetailsCell.svelte';
import DetailsSubtitle from '../details/DetailsSubtitle.svelte';
import DetailsTable from '../details/DetailsTable.svelte';
import DetailsTitle from '../details/DetailsTitle.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let pod: PodInfoUI | undefined;
let creationTime: Date;
if (pod) {
  creationTime = new Date(pod.created);
}
</script>

<DetailsTable>
  {#if pod}
    <tr>
      <DetailsTitle>Details</DetailsTitle>
    </tr>
    <tr>
      <DetailsCell>Name</DetailsCell>
      <DetailsCell>{pod.name}</DetailsCell>
    </tr>
    <tr>
      <DetailsCell>ID</DetailsCell>
      <DetailsCell>{pod.id}</DetailsCell>
    </tr>
    <tr>
      <DetailsCell>Created</DetailsCell>
      <DetailsCell>{creationTime}</DetailsCell>
    </tr>
    <tr>
      <DetailsCell>Age</DetailsCell>
      <DetailsCell>{pod.age}</DetailsCell>
    </tr>
    <tr>
      <DetailsTitle>Pod Status</DetailsTitle>
    </tr>
    <tr>
      <DetailsCell>Status</DetailsCell>
      <DetailsCell>{pod.status.toLowerCase()}</DetailsCell>
    </tr>
    <tr>
      <DetailsTitle>Containers</DetailsTitle>
    </tr>
    {#if pod.containers.length > 0}
      {#each pod.containers as container}
        <tr>
          <DetailsSubtitle>
            <Link on:click={() => router.goto(`/containers/${container.Id}/logs`)}>
              {container.Names}
            </Link>
          </DetailsSubtitle>
        </tr>
        <tr>
          <DetailsCell>ID</DetailsCell>
          <DetailsCell>{container.Id}</DetailsCell>
        </tr>
        <tr>
          <DetailsCell>Status</DetailsCell>
          <DetailsCell>{container.Status}</DetailsCell>
        </tr>
      {/each}
    {:else}
      <tr>
        <DetailsCell>No containers</DetailsCell>
      </tr>
    {/if}
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</DetailsTable>
