<script lang="ts">
import { Link } from '@podman-desktop/ui-svelte';

import { handleNavigation } from '/@/navigation';
import { NavigationPage } from '/@api/navigation-page';

import DetailsCell from '../details/DetailsCell.svelte';
import DetailsTable from '../details/DetailsTable.svelte';
import DetailsTitle from '../details/DetailsTitle.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';

export let compose: ComposeInfoUI;

function openContainer(containerID: string) {
  handleNavigation({
    page: NavigationPage.CONTAINER_LOGS,
    parameters: {
      id: containerID,
    },
  });
}
</script>

<DetailsTable>
  <tr>
    <DetailsTitle>Details</DetailsTitle>
  </tr>
  <tr>
    <DetailsCell>Name</DetailsCell>
    <DetailsCell>{compose.name}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine ID</DetailsCell>
    <DetailsCell>{compose.engineId}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine type</DetailsCell>
    <DetailsCell>{compose.engineType}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Status</DetailsCell>
    <DetailsCell>{compose.status}</DetailsCell>
  </tr>
  {#if compose.containers.length > 0}
    <tr>
      <DetailsTitle>Containers in compose group</DetailsTitle>
    </tr>
    {#each compose.containers as container}
      <tr>
        <DetailsCell>
          <Link on:click={() => openContainer(container.id)}>{container.name}</Link>
        </DetailsCell>
        <DetailsCell>{container.id}</DetailsCell>
      </tr>
    {/each}
  {/if}
</DetailsTable>
