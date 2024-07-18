<script lang="ts">
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import DetailsCell from '../details/DetailsCell.svelte';
import DetailsTable from '../details/DetailsTable.svelte';
import DetailsTitle from '../details/DetailsTitle.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;
let labelsDropdownOpen: boolean = false;
let startedTime: Date = new Date(container.startedAt);
let createdTime: Date | undefined;
if (container.groupInfo.created) {
  createdTime = new Date(container.groupInfo.created);
}
</script>

<DetailsTable>
  <tr>
    <DetailsTitle>Details</DetailsTitle>
  </tr>
  <tr>
    <DetailsCell>Name</DetailsCell>
    <DetailsCell>{container.name}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>ID</DetailsCell>
    <DetailsCell>{container.id}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine type</DetailsCell>
    <DetailsCell>{container.engineType}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Engine ID</DetailsCell>
    <DetailsCell>{container.engineId}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Image</DetailsCell>
    <DetailsCell>
      <Link on:click={() => router.goto(container.imageHref ?? $router.path)}>{container.image}</Link>
    </DetailsCell>
  </tr>
  {#if container.command}
    <tr>
      <DetailsCell>Command</DetailsCell>
      <DetailsCell>{container.command}</DetailsCell>
    </tr>
  {/if}
  <tr>
    <DetailsCell>Ports</DetailsCell>
    {#if container.hasPublicPort}
      <DetailsCell>{container.portsAsString}</DetailsCell>
    {:else}
      <DetailsCell>N/A</DetailsCell>
    {/if}
  </tr>
  <tr>
    <DetailsCell>State</DetailsCell>
    <DetailsCell>{container.state.toLowerCase()}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Uptime</DetailsCell>
    <DetailsCell>{container.uptime === '' ? 'N/A' : container.uptime}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Started at</DetailsCell>
    <DetailsCell>{startedTime}</DetailsCell>
  </tr>
  {#if Object.entries(container.labels).length > 0}
    <tr>
      <DetailsCell style="cursor-pointer flex items-center" onClick={() => (labelsDropdownOpen = !labelsDropdownOpen)}>
        Labels
        <Fa class="ml-1" size="0.9x" icon={labelsDropdownOpen ? faChevronDown : faChevronRight} />
      </DetailsCell>
      <DetailsCell>
        {#if labelsDropdownOpen}
          {#each Object.entries(container.labels) as [key, value]}
            {key}: {value}
            <br />
          {/each}
        {:else}
          ...
        {/if}
      </DetailsCell>
    </tr>
  {/if}
  <tr>
    <DetailsTitle>Group</DetailsTitle>
  </tr>
  <tr>
    <DetailsCell>Name</DetailsCell>
    <DetailsCell>{container.groupInfo.name}</DetailsCell>
  </tr>
  <tr>
    <DetailsCell>Type</DetailsCell>
    <DetailsCell>{container.groupInfo.type}</DetailsCell>
  </tr>
  {#if container.groupInfo.id}
    <tr>
      <DetailsCell>Id</DetailsCell>
      <DetailsCell>{container.groupInfo.id}</DetailsCell>
    </tr>
  {/if}
  {#if container.groupInfo.engineName}
    <tr>
      <DetailsCell>Engine name</DetailsCell>
      <DetailsCell>{container.groupInfo.engineName}</DetailsCell>
    </tr>
  {/if}
  {#if container.groupInfo.engineType}
    <tr>
      <DetailsCell>Engine type</DetailsCell>
      <DetailsCell>{container.groupInfo.engineType}</DetailsCell>
    </tr>
  {/if}
  {#if container.groupInfo.engineId}
    <tr>
      <DetailsCell>Engine Id</DetailsCell>
      <DetailsCell>{container.groupInfo.engineId}</DetailsCell>
    </tr>
  {/if}
  {#if container.groupInfo.status}
    <tr>
      <DetailsCell>status</DetailsCell>
      <DetailsCell>{container.groupInfo.status.toLowerCase()}</DetailsCell>
    </tr>
  {/if}
  {#if createdTime}
    <tr>
      <DetailsCell>Created</DetailsCell>
      <DetailsCell>{createdTime}</DetailsCell>
    </tr>
  {/if}
</DetailsTable>
