<script lang="ts">
import Route from '../../Route.svelte';
import ComposeIcon from '../images/PodIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import ComposeActions from './ComposeActions.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import DetailsTab from '../ui/DetailsTab.svelte';
import type { Unsubscriber } from 'svelte/store';
import { onDestroy, onMount } from 'svelte';
import { containersInfos } from '/@/stores/containers';
import type { ComposeInfoUI } from './ComposeInfoUI';
import { ContainerUtils } from '../container/container-utils';
import ComposeDetailsLogs from './ComposeDetailsLogs.svelte';
import type { ContainerInfoUI } from '../container/ContainerInfoUI';

export let composeName: string;
export let engineId: string;

const containerUtils = new ContainerUtils();
let composeUnsubscribe: Unsubscriber;

let compose: ComposeInfoUI;

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

    // Make sure we update the compose object with the name, status, engineID, containers, etc.
    // or else logging will not appear correctly when loading (it'll see empty containers..)
    compose = {
      name: composeName,
      engineId: engineId,
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
  <DetailsPage title="{composeName}" subtitle="">
    <StatusIcon slot="icon" icon="{ComposeIcon}" status="{compose.status}" />
    <div slot="actions" class="flex justify-end">
      <div class="flex items-center w-5">
        <div>&nbsp;</div>
      </div>
      <ComposeActions compose="{compose}" dropdownMenu="{true}" />
    </div>
    <div slot="tabs" class="pf-c-tabs__list">
      <DetailsTab title="Logs" url="logs" />
    </div>
    <span slot="content">
      <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
        <ComposeDetailsLogs compose="{compose}" />
      </Route>
    </span>
  </DetailsPage>
{/if}
