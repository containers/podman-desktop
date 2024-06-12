<script lang="ts">
import { Link } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import DetailsCell from '../details/DetailsCell.svelte';
import DetailsSubtitle from '../details/DetailsSubtitle.svelte';
import DetailsTable from '../details/DetailsTable.svelte';
import DetailsTitle from '../details/DetailsTitle.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let pod: PodInfoUI;
let creationTime: Date = new Date(pod.created);
</script>

<div class="flex px-5 py-4 flex-col items-start h-full overflow-auto">
  {#if pod}
    <DetailsTable>
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
      {#if pod}
        <tr>
          <DetailsTitle>Pod Status</DetailsTitle>
        </tr>
        <tr>
          <DetailsCell>Status</DetailsCell>
          <DetailsCell>{pod.status.toLowerCase()}</DetailsCell>
        </tr>
        {#if pod.containers.some(containerStatus => containerStatus.Status)}
          <tr>
            <DetailsTitle>Containers</DetailsTitle>
          </tr>
          {#each pod.containers as containerStatus}
            {#if containerStatus.Status}
              <tr>
                <DetailsSubtitle>
                  <Link on:click="{() => router.goto(`/containers/${containerStatus.Id}/logs`)}">
                    {containerStatus.Names}
                  </Link>
                </DetailsSubtitle>
              </tr>
              <tr>
                <DetailsCell>ID</DetailsCell>
                <DetailsCell>{containerStatus.Id}</DetailsCell>
              </tr>
              <tr>
                <DetailsCell>Status</DetailsCell>
                <DetailsCell>{containerStatus.Status}</DetailsCell>
              </tr>
            {/if}
          {/each}
        {/if}
      {/if}
    </DetailsTable>
  {:else}
    <p class="text-purple-500 font-medium">Loading ...</p>
  {/if}
</div>
