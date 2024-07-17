<script lang="ts">
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import { containersInfos } from '/@/stores/containers';

import Route from '../../Route.svelte';
import { ContainerUtils } from '../container/container-utils';
import type { ContainerInfoUI } from '../container/ContainerInfoUI';
import ComposeIcon from '../images/PodIcon.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import ComposeActions from './ComposeActions.svelte';
import ComposeDetailsInspect from './ComposeDetailsInspect.svelte';
import ComposeDetailsKube from './ComposeDetailsKube.svelte';
import ComposeDetailsLogs from './ComposeDetailsLogs.svelte';
import ComposeDetailsSummary from './ComposeDetailsSummary.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';

export let composeName: string;
export let engineId: string;

const containerUtils = new ContainerUtils();
let composeUnsubscribe: Unsubscriber;

let compose: ComposeInfoUI;

// Assume that the engine type is podman until we find a compose group that is docker
let engineType: 'docker' | 'podman' = 'podman';

onMount(() => {
  // We will use the containersInfos store to get every container that matches
  // the label com.docker.compose.project={composeName}
  // We only care about the status. Check each containersMatchingProject status and if every container is RUNNING, set status to RUNNING,
  // else let status be 'STOPPED'
  composeUnsubscribe = containersInfos.subscribe(containers => {
    let convertedContainers: ContainerInfoUI[];
    let status: string;

    // Get all containers that match the composeName we are looking at
    const containersMatchingProject = containers.filter(container => {
      return container?.Labels['com.docker.compose.project'] === composeName;
    });

    // Update our current status
    if (containersMatchingProject.length === 0) {
      status = 'STOPPED';
    } else {
      const allRunning = containersMatchingProject.every(container => {
        return container?.State === 'running';
      });
      if (allRunning) {
        status = 'RUNNING';
      } else {
        status = 'STOPPED';
      }
    }

    // Convert each matching container to the ComposeInfoContainerUI type and add it to compose.containers
    convertedContainers = containersMatchingProject.map(container => {
      return containerUtils.getContainerInfoUI(container);
    });

    // Get the engine type from the first container in the list (if it exists)
    if (convertedContainers.length > 0) {
      engineType = convertedContainers[0].engineType;
    }

    // Make sure we update the compose object with the name, status, engineID, containers, etc.
    // or else logging will not appear correctly when loading (it'll see empty containers..)
    compose = {
      name: composeName,
      engineId: engineId,
      engineType: engineType,
      status: status,
      containers: convertedContainers,
    };
  });
});

onDestroy(() => {
  if (composeUnsubscribe) {
    composeUnsubscribe();
  }
});
</script>

{#if compose}
  <DetailsPage title={composeName} subtitle="">
    <StatusIcon slot="icon" icon={ComposeIcon} size={24} status={compose.status} />
    <svelte:fragment slot="actions">
      <div class="flex items-center w-5">
        <div>&nbsp;</div>
      </div>
      <ComposeActions compose={compose} detailed={true} on:update={() => (compose = compose)} />
    </svelte:fragment>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Logs" selected={isTabSelected($router.path, 'logs')} url={getTabUrl($router.path, 'logs')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ComposeDetailsSummary compose={compose} />
      </Route>
      <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
        <ComposeDetailsLogs compose={compose} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <ComposeDetailsInspect compose={compose} />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <ComposeDetailsKube compose={compose} />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
