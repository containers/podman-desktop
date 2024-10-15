<script lang="ts">
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import Label from '/@/lib/ui/Label.svelte';
import ProviderInfoCircle from '/@/lib/ui/ProviderInfoCircle.svelte';
import RefreshButton from '/@/lib/ui/RefreshButton.svelte';
import type { DockerSocketMappingStatusInfo } from '/@api/docker-compatibility-info';

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
      <div class="flex flex-col mt-2 text-sm" role="status" aria-label="description of the status">
        Status of the system {isLinux || isMac ? '/var/run/docker.sock socket' : ''}{isWindows
          ? '//./pipe/docker_engine'
          : ''}.
        {#if dockerSocketMappingStatusInfo?.serverInfo?.type === 'podman'}
          <div>Any docker commands using this socket are redirected to the Podman Engine instead</div>
        {/if}
      </div>
    </div>
  </div>

  {#if dockerSocketMappingStatusInfo?.connectionInfo}
    {@const connectionInfo = dockerSocketMappingStatusInfo.connectionInfo}
    <div
      class="flex flex-row grow divide-[var(--pd-content-divider)] m-2 p-2 max-w-64"
      role="status"
      aria-label="Connection information">
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
    <div
      class="flex flex-row divide-[var(--pd-content-divider)] px-2 m-2 pl-8 justify-center"
      role="status"
      aria-label="Server information">
      <div class="grid grid-cols-2 gap-x-8 gap-y-2">
        <div>Server:</div>
        <div>{dockerSocketMappingStatusInfo.serverInfo.type}</div>

        <div>Version:</div>
        <div>{dockerSocketMappingStatusInfo.serverInfo.serverVersion}</div>

        <div>Operating System:</div>
        <div>{dockerSocketMappingStatusInfo.serverInfo.operatingSystem}</div>

        <div>OS/Arch:</div>
        <div>
          {dockerSocketMappingStatusInfo.serverInfo.osType}/{dockerSocketMappingStatusInfo.serverInfo.architecture}
        </div>
      </div>
    </div>
  {/if}
</div>
