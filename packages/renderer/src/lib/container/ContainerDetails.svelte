<script lang="ts">
import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from './ContainerInfoUI';
import Route from '../../Route.svelte';
import ContainerIcon from '../images/ContainerIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';

import 'xterm/css/xterm.css';
import ContainerDetailsTerminal from './ContainerDetailsTerminal.svelte';
import ContainerDetailsLogs from './ContainerDetailsLogs.svelte';
import ContainerActions from './ContainerActions.svelte';
import { onMount } from 'svelte';
import { containersInfos } from '../../stores/containers';
import { ContainerUtils } from './container-utils';
import ContainerDetailsSummary from './ContainerDetailsSummary.svelte';
import ContainerDetailsInspect from './ContainerDetailsInspect.svelte';
import ContainerDetailsKube from './ContainerDetailsKube.svelte';
import ContainerStatistics from './ContainerStatistics.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import Tab from '../ui/Tab.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';

export let containerID: string;

let container: ContainerInfoUI;
let detailsPage: DetailsPage;

onMount(() => {
  const containerUtils = new ContainerUtils();
  // loading container info
  return containersInfos.subscribe(containers => {
    const matchingContainer = containers.find(c => c.Id === containerID);
    if (matchingContainer) {
      container = containerUtils.getContainerInfoUI(matchingContainer);
    } else if (detailsPage) {
      // the container has been deleted
      detailsPage.close();
    }
  });
});

function inProgressCallback(inProgress: boolean, state: string | undefined): void {
  container.actionInProgress = inProgress;
  if (state && inProgress) {
    container.state = 'STARTING';
  }
}

function errorCallback(errorMessage: string): void {
  container.actionError = errorMessage;
  container.state = 'ERROR';
}
</script>

{#if container}
  <DetailsPage title="{container.name}" subtitle="{container.shortImage}" bind:this="{detailsPage}">
    <StatusIcon slot="icon" icon="{ContainerIcon}" status="{container.state}" />
    <svelte:fragment slot="actions">
      <div class="flex items-center w-5">
        {#if container.actionError}
          <ErrorMessage error="{container.actionError}" icon />
        {:else}
          <div>&nbsp;</div>
        {/if}
      </div>
      <ContainerActions
        inProgressCallback="{(flag, state) => inProgressCallback(flag, state)}"
        errorCallback="{error => errorCallback(error)}"
        container="{container}"
        detailed="{true}" />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end">
      <ContainerStatistics container="{container}" />
    </div>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" url="summary" />
      <Tab title="Logs" url="logs" />
      <Tab title="Inspect" url="inspect" />

      {#if container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE}
        <Tab title="Kube" url="kube" />
      {/if}
      <Tab title="Terminal" url="terminal" />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ContainerDetailsSummary container="{container}" />
      </Route>
      <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
        <ContainerDetailsLogs container="{container}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <ContainerDetailsInspect container="{container}" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <ContainerDetailsKube container="{container}" />
      </Route>
      <Route path="/terminal" breadcrumb="Terminal" navigationHint="tab">
        <ContainerDetailsTerminal container="{container}" />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
