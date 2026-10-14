<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';
import { Link } from '@podman-desktop/ui-svelte';

import DetailsCell from '/@/lib/details/DetailsCell.svelte';
import DetailsTable from '/@/lib/details/DetailsTable.svelte';
import DetailsTitle from '/@/lib/details/DetailsTitle.svelte';
import { handleNavigation } from '/@/navigation';

import type { NetworkInfoUI } from './NetworkInfoUI';

interface Props {
  network: NetworkInfoUI;
}

let { network }: Props = $props();

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
    <DetailsCell>{network.name}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Id</DetailsCell>
    <DetailsCell>{network.id}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Status</DetailsCell>
    <DetailsCell>{network.status.toLowerCase()}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Driver</DetailsCell>
    <DetailsCell>{network.driver}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>IPV6 enabled</DetailsCell>
    <DetailsCell>{network.ipv6_enabled}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine ID</DetailsCell>
    <DetailsCell>{network.engineId}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine Name</DetailsCell>
    <DetailsCell>{network.engineName}</DetailsCell>
  </tr>
  {#if network.containers.length > 0}
    <tr>
      <DetailsTitle>Container Usage</DetailsTitle>
    </tr>
    {#each network.containers as container (container.id)}
      <tr>
        <DetailsCell>
          <Link on:click={(): void => openContainer(container.id)}
            >{container.name}</Link>
        </DetailsCell>
        <DetailsCell>{container.id}</DetailsCell>
      </tr>
    {/each}
  {/if}
</DetailsTable>
