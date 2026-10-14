<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';
import { Link } from '@podman-desktop/ui-svelte';

import DetailsCell from '/@/lib/details/DetailsCell.svelte';
import DetailsSubtitle from '/@/lib/details/DetailsSubtitle.svelte';
import DetailsTable from '/@/lib/details/DetailsTable.svelte';
import DetailsTitle from '/@/lib/details/DetailsTitle.svelte';
import { handleNavigation } from '/@/navigation';

import type { PodInfoContainerUI, PodInfoUI } from './PodInfoUI';

interface Props {
  pod: PodInfoUI;
}

let { pod }: Props = $props();

let creationTime: Date = $derived(new Date(pod.created));

function navigateToLogs(container: PodInfoContainerUI): void {
  return handleNavigation({ page: NavigationPage.CONTAINER_LOGS, parameters: { id: container.Id } });
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
      {#each pod.containers as container (container.Id)}
        <tr>
          <DetailsSubtitle>
            <Link on:click={(): void => navigateToLogs(container)}>
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
    <p class="text-[var(--pd-state-info)] font-medium">Loading...</p>
  {/if}
</DetailsTable>
