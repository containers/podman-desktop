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
import DetailsTab from '../ui/DetailsTab.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';

export let containerID: string;

let container: ContainerInfoUI;
onMount(() => {
  const containerUtils = new ContainerUtils();
  // loading container info
  containersInfos.subscribe(containers => {
    const matchingContainer = containers.find(c => c.Id === containerID);
    if (matchingContainer) {
      container = containerUtils.getContainerInfoUI(matchingContainer);
    }
  });
});

function inProgressCallback(inProgress: boolean, state: string): void {
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
  <DetailsPage
    name="Container Details"
    title="{container.name}"
    subtitle="{container.shortImage}"
    parentName="Containers"
    parentURL="/containers">
    <StatusIcon slot="icon" icon="{ContainerIcon}" status="{container.state}" />
    <div slot="actions" class="flex justify-end">
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
    </div>
    <div slot="detail" class="flex py-2 w-full justify-end">
      <ContainerStatistics container="{container}" />
    </div>
    <div slot="tabs" class="pf-c-tabs__list">
      <DetailsTab title="Summary" url="summary" />
      <DetailsTab title="Logs" url="logs" />
      <DetailsTab title="Inspect" url="inspect" />

      {#if container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE}
        <DetailsTab title="Kube" url="kube" />
      {/if}
      <DetailsTab title="Terminal" url="terminal" />
    </div>
    <span slot="content">
      <Route path="/summary" breadcrumb="Summary">
        <ContainerDetailsSummary container="{container}" />
      </Route>
      <Route path="/logs" breadcrumb="Logs">
        <ContainerDetailsLogs container="{container}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect">
        <ContainerDetailsInspect container="{container}" />
      </Route>
      <Route path="/kube" breadcrumb="Kube">
        <ContainerDetailsKube container="{container}" />
      </Route>
      <Route path="/terminal" breadcrumb="Terminal">
        <ContainerDetailsTerminal container="{container}" />
      </Route>
    </span>
  </DetailsPage>
{/if}
