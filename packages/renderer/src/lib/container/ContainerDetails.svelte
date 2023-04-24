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
  <Route path="/*">
    <div class="w-full h-full">
      <div class="flex h-full flex-col">
        <div class="flex w-full flex-row">
          <div class="w-full px-5 pt-5">
            <div class="flex flew-row items-center">
              <a
                class="text-violet-400 text-base hover:no-underline"
                href="/containers"
                title="Go back to containers list">Containers</a>
              <div class="text-xl mx-2 text-gray-700">></div>
              <div class="text-sm font-extralight text-gray-700">Container Details</div>
            </div>
            <div class="text-lg flex flex-row items-start pt-1">
              <div class="pr-3 pt-1">
                <StatusIcon icon="{ContainerIcon}" status="{container.state}" />
              </div>
              <div class="text-lg flex flex-col">
                <div class="mr-2">{container.name}</div>
                <div class="mr-2 pb-4 text-small text-gray-900" title="{container.image}">{container.shortImage}</div>
              </div>
            </div>
            <section class="pf-c-page__main-tabs pf-m-limit-width">
              <div class="pf-c-page__main-body">
                <div class="pf-c-tabs pf-m-page-insets" id="open-tabs-example-tabs-list">
                  <ul class="pf-c-tabs__list">
                    <DetailsTab title="Summary" url="summary" />
                    <DetailsTab title="Logs" url="logs" />
                    <DetailsTab title="Inspect" url="inspect" />

                    {#if container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE}
                      <DetailsTab title="Kube" url="kube" />
                    {/if}
                    <DetailsTab title="Terminal" url="terminal" />
                  </ul>
                </div>
              </div>
            </section>
          </div>
          <div class="flex flex-col px-5 pt-5">
            <div class="flex justify-end">
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
            <div class="flex my-2 w-full justify-end">
              <ContainerStatistics container="{container}" />
            </div>
          </div>
          <a href="/containers" title="Close Details" class="mt-2 mr-2 text-gray-900"
            ><i class="fas fa-times" aria-hidden="true"></i></a>
        </div>
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
      </div>
    </div>
  </Route>
{/if}
