<script lang="ts">
import { Link } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import DetailsCell from '../details/DetailsCell.svelte';
import DetailsTable from '../details/DetailsTable.svelte';
import DetailsTitle from '../details/DetailsTitle.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

export let volume: VolumeInfoUI;
const createdTime: Date = new Date(volume.created);

function openContainer(containerID: string) {
  router.goto(`/containers/${containerID}/logs`);
}
</script>

<DetailsTable>
  <tr>
    <DetailsTitle>Details</DetailsTitle>
  </tr>
  <tr>
    <DetailsCell>Name</DetailsCell>
    <DetailsCell>{volume.name}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Size</DetailsCell>
    <DetailsCell>{volume.humanSize}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Age</DetailsCell>
    <DetailsCell>{volume.age}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Created</DetailsCell>
    <DetailsCell>{createdTime}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Status</DetailsCell>
    <DetailsCell>{volume.status.toLowerCase()}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Mount Point</DetailsCell>
    <DetailsCell>{volume.mountPoint}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Scope</DetailsCell>
    <DetailsCell>{volume.scope}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Driver</DetailsCell>
    <DetailsCell>{volume.driver}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine ID</DetailsCell>
    <DetailsCell>{volume.engineId}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine Name</DetailsCell>
    <DetailsCell>{volume.engineName}</DetailsCell>
  </tr>
  {#if volume.containersUsage.length > 0}
    <tr>
      <DetailsTitle>Container Usage</DetailsTitle>
    </tr>
    {#each volume.containersUsage as container}
      <tr>
        <DetailsCell>
          <Link on:click={() => openContainer(container.id)}
            >{container.names.map(name => (name.startsWith('/') ? name.slice(1) : name)).join(' ')}</Link>
        </DetailsCell>
        <DetailsCell>{container.id}</DetailsCell>
      </tr>
    {/each}
  {/if}
</DetailsTable>
