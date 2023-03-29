<script lang="ts">
import { ContainerGroupInfoTypeUI, ContainerInfoUI } from './container/ContainerInfoUI';
import { Route } from 'tinro';
import ContainerIcon from './images/ContainerIcon.svelte';
import StatusIcon from './images/StatusIcon.svelte';

import 'xterm/css/xterm.css';
import ContainerDetailsTerminal from './ContainerDetailsTerminal.svelte';
import ContainerDetailsLogs from './ContainerDetailsLogs.svelte';
import ContainerActions from './container/ContainerActions.svelte';
import { onMount } from 'svelte';
import { containersInfos } from '../stores/containers';
import { ContainerUtils } from './container/container-utils';
import ContainerDetailsSummary from './ContainerDetailsSummary.svelte';
import ContainerDetailsInspect from './ContainerDetailsInspect.svelte';
import ContainerDetailsKube from './ContainerDetailsKube.svelte';
import ContainerStatistics from './container/ContainerStatistics.svelte';
import DetailsTab from './ui/DetailsTab.svelte';
import ErrorMessage from './ui/ErrorMessage.svelte';

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
              <div class="text-xl mx-2 text-gray-400">></div>
              <div class="text-sm font-extralight text-gray-400">Container Details</div>
            </div>
            <div class="text-lg flex flex-row items-start pt-1">
              <div class="pr-3 pt-1">
                <StatusIcon icon="{ContainerIcon}" status="{container.state}" />
              </div>
              <div class="text-lg flex flex-col">
                <div class="mr-2">{container.name}</div>
                <div class="mr-2 pb-4 text-small text-gray-500">{container.image}</div>
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
          <div class="flex flex-col w-full px-5 pt-5">
            <div class="flex justify-end">
              <div class="flex items-center w-5">
                {#if container.actionInProgress}
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                {:else if container.actionError}
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
          <a href="/containers" title="Close Details" class="mt-2 mr-2 text-gray-500"
            ><i class="fas fa-times" aria-hidden="true"></i></a>
        </div>
        <Route path="/summary">
          <ContainerDetailsSummary container="{container}" />
        </Route>
        <Route path="/logs">
          <ContainerDetailsLogs container="{container}" />
        </Route>
        <Route path="/inspect">
          <ContainerDetailsInspect container="{container}" />
        </Route>
        <Route path="/kube">
          <ContainerDetailsKube container="{container}" />
        </Route>
        <Route path="/terminal">
          <ContainerDetailsTerminal container="{container}" />
        </Route>
      </div>
    </div>
  </Route>
{/if}
