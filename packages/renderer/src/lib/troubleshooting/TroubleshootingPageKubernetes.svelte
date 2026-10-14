<script lang="ts">
import type { KubernetesTroubleshootingInformation } from '@desktop-framework/api';
import { faDatabase, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onMount } from 'svelte';

let info = $state<KubernetesTroubleshootingInformation>();

onMount(async () => {
  await refresh();
});

async function refresh(): Promise<void> {
  info = await window.kubernetesGetTroubleshootingInformation();
}
</script>

<div class="flex flex-col w-full m-4 p-4 rounded-lg bg-[var(--pd-content-card-bg)]">
  <div class="flex flex-row align-middle items-center w-full mb-4">
    <Icon size="1.875x" class="pr-3" icon={faDatabase} />
    <div role="status" aria-label="stores" class="text-xl">Kubernetes monitoring</div>
    <div class="flex flex-1 justify-end">
      <Button title="Refresh" class="ml-5" on:click={refresh} type="link"
        ><Icon class="h-5 w-5 cursor-pointer text-xl text-(--pd-action-button-primary-text)" icon={faRefresh} /></Button>
    </div>
  </div>

  <div class="h-full overflow-auto p-2 bg-[var(--pd-invert-content-card-bg)]">
    <h2 class="mt-2">Health Checks</h2>
    <div class="flex flex-col space-y-4">
    {#each info?.healthCheckers ?? [] as healthchecker, index (index)}
      <ul>
        <li><b>{healthchecker.contextName}</b></li>
        <li>checking: {healthchecker.checking}</li>
        <li>reachable: {healthchecker.reachable}</li>
      </ul>
    {/each}
    </div>

    <h2 class="mt-2">Permission Checks</h2>
    <div class="flex flex-col space-y-4">
      {#each info?.permissionCheckers ?? [] as permissionChecker, index (index)}
        <ul>
          <li><b>{permissionChecker.contextName} / {permissionChecker.resourceName}</b></li>
          <li>permitted: {permissionChecker.permitted}</li>
          <li>reason: {permissionChecker.reason}</li>
        </ul>
      {/each}
    </div>

    <h2 class="mt-2">Informers</h2>
    <div class="flex flex-col space-y-4">
    {#each info?.informers ?? [] as informer, index (index)}
      <ul>
        <li><b>{informer.contextName} / {informer.resourceName}</b></li>
        <li>is offline: {informer.isOffline}</li>
        <li># objects: {informer.objectsCount ?? 'unknown'}</li>
      </ul>
    {/each}
    </div>
  </div>
</div>
