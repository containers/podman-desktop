<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';
import { Link } from '@podman-desktop/ui-svelte';

import DetailsCell from '/@/lib/details/DetailsCell.svelte';
import DetailsTable from '/@/lib/details/DetailsTable.svelte';
import DetailsTitle from '/@/lib/details/DetailsTitle.svelte';
import { handleNavigation } from '/@/navigation';

import type { ComposeInfoUI } from './ComposeInfoUI';

interface Props {
  compose: ComposeInfoUI;
}

let { compose }: Props = $props();

function openContainer(containerID: string): void {
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
    {#each compose.containers as container (container.id)}
      <tr>
        <DetailsCell>
          <Link onclick={openContainer.bind(undefined, container.id)}>{container.name}</Link>
        </DetailsCell>
        <DetailsCell>{container.id}</DetailsCell>
      </tr>
    {/each}
  {/if}
</DetailsTable>
