<script lang="ts">
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import type { DockerSocketMappingStatusInfo } from '/@api/docker-compatibility-info';

import Label from '../../ui/Label.svelte';
import ProviderInfoCircle from '../../ui/ProviderInfoCircle.svelte';
import RefreshButton from '../../ui/RefreshButton.svelte';

let isMac = $state(false);
let isWindows = $state(false);
let isLinux = $state(false);

let dockerSocketMappingStatusInfo: DockerSocketMappingStatusInfo | undefined = $state(undefined);

let engineType: 'kubernetes' | 'podman' | 'docker' | undefined = $state(undefined);

async function refreshSocketMappingStatus(): Promise<void> {
  dockerSocketMappingStatusInfo = await window.getSystemDockerSocketMappingStatus();

  if (dockerSocketMappingStatusInfo?.serverInfo?.type === 'podman') {
    engineType = 'podman';
  } else if (dockerSocketMappingStatusInfo?.serverInfo?.type === 'docker') {
    engineType = 'docker';
  } else {
    engineType = undefined;
  }
}

onMount(async () => {
  const platform = await window.getOsPlatform();

  isMac = platform === 'darwin';
  isLinux = platform === 'linux';
  isWindows = platform === 'win32';

  // ask once to get the result
  await refreshSocketMappingStatus();
});
</script>

<div
  class="bg-[var(--pd-invert-content-card-bg)] rounded-md m-2 divide-x divide-[var(--pd-content-divider)] flex flex-col lg:flex-row">
  <div class="flex flex-row grow px-2 py-2 justify-between text-[color:var(--pd-invert-content-card-text)]">
    <div class="flex flex-col">
      <div class="flex flex-row items-center text-[color:var(--pd-invert-content-card-text)]">
        System socket status

        <div class="mx-2">
          <RefreshButton label="Refresh the status" onclick={refreshSocketMappingStatus} />
        </div>
        {#if dockerSocketMappingStatusInfo?.status === 'running' && dockerSocketMappingStatusInfo?.serverInfo}
          <Label name="{dockerSocketMappingStatusInfo.serverInfo.type} is listening">
            <ProviderInfoCircle type={engineType} />
          </Label>
        {:else if dockerSocketMappingStatusInfo?.status === 'unreachable'}
          <Label name="socket not reachable">
            <ProviderInfoCircle type={undefined} />
          </Label>
        {/if}
      </div>
      <div class="mt-2">
        Status of the system {isLinux || isMac ? '/var/run/docker.sock socket' : ''}{isWindows
          ? '//./pipe/docker_engine'
          : ''}.
      </div>
      {#if dockerSocketMappingStatusInfo?.serverInfo?.type === 'podman'}
        <div>Any docker commands using this socket are redirected to the Podman Engine instead</div>
      {/if}
    </div>
  </div>

  {#if dockerSocketMappingStatusInfo?.connectionInfo}
    {@const connectionInfo = dockerSocketMappingStatusInfo.connectionInfo}
    <div class="flex flex-row grow divide-[var(--pd-content-divider)] m-2 p-2 max-w-64">
      <div class="flex flex-col grow">
        <div>Provided by {connectionInfo.provider.name}</div>
        <div class="font-thin text-xs">{connectionInfo.displayName}</div>
      </div>

      <Tooltip class="m-2" bottom tip="{connectionInfo.provider.name} details">
        <button
          aria-label="{connectionInfo.provider.name} details"
          type="button"
          onclick={() => router.goto(connectionInfo.link)}>
          <Fa icon={faArrowUpRightFromSquare} />
        </button>
      </Tooltip>
    </div>
  {:else if dockerSocketMappingStatusInfo?.serverInfo}
    <div class="flex flex-row divide-[var(--pd-content-divider)] px-2 m-2 font-thin">
      <div class="grid grid-cols-2 gap-x-1.5 gap-y-0.5">
        {#each Array.from(Object.entries(dockerSocketMappingStatusInfo.serverInfo)) as entry}
          <div class="capitalize">{entry[0]}:</div>
          <div>{entry[1]}</div>
        {/each}
      </div>
    </div>
  {/if}
</div>
