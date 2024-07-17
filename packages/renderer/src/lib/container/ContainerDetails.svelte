<script lang="ts">
import 'xterm/css/xterm.css';

import { ErrorMessage, Link, StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';
import { onMount } from 'svelte';
import { router } from 'tinro';

import Route from '../../Route.svelte';
import { containersInfos } from '../../stores/containers';
import DetailsPage from '../ui/DetailsPage.svelte';
import StateChange from '../ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import { ContainerUtils } from './container-utils';
import ContainerActions from './ContainerActions.svelte';
import ContainerDetailsInspect from './ContainerDetailsInspect.svelte';
import ContainerDetailsKube from './ContainerDetailsKube.svelte';
import ContainerDetailsLogs from './ContainerDetailsLogs.svelte';
import ContainerDetailsSummary from './ContainerDetailsSummary.svelte';
import ContainerDetailsTerminal from './ContainerDetailsTerminal.svelte';
import ContainerDetailsTtyTerminal from './ContainerDetailsTtyTerminal.svelte';
import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from './ContainerInfoUI';
import ContainerStatistics from './ContainerStatistics.svelte';

export let containerID: string;

let container: ContainerInfoUI;

let detailsPage: DetailsPage;

let displayTty = false;
// update current route scheme
let currentRouterPath: string;

onMount(() => {
  const containerUtils = new ContainerUtils();

  router.subscribe(route => {
    currentRouterPath = route.path;
  });

  // loading container info
  return containersInfos.subscribe(containers => {
    const matchingContainer = containers.find(c => c.Id === containerID);
    if (matchingContainer) {
      container = containerUtils.getContainerInfoUI(matchingContainer);
      // look if tty is supported by this container
      window.getContainerInspect(container.engineId, container.id).then(inspect => {
        displayTty = (inspect.Config.Tty || false) && (inspect.Config.OpenStdin || false);
        // if we comes with a / redirect to /logs or to /tty if tty is supported
        if (currentRouterPath.endsWith('/')) {
          if (displayTty) {
            router.goto(`${currentRouterPath}tty`);
          } else {
            router.goto(`${currentRouterPath}logs`);
          }
        }
      });
    } else if (detailsPage) {
      // the container has been deleted
      detailsPage.close();
    }
  });
});
</script>

{#if container}
  <DetailsPage title={container.name} bind:this={detailsPage}>
    <StatusIcon slot="icon" icon={ContainerIcon} size={24} status={container.state} />
    <svelte:fragment slot="subtitle">
      <Link
        on:click={() => {
          if (container.imageHref) {
            router.goto(container.imageHref);
          }
        }}>{container.shortImage}</Link>
    </svelte:fragment>
    <svelte:fragment slot="actions">
      <div class="flex items-center w-5">
        {#if container.actionError}
          <ErrorMessage error={container.actionError} icon />
        {:else}
          <div>&nbsp;</div>
        {/if}
      </div>
      <ContainerActions container={container} detailed={true} on:update={() => (container = container)} />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end text-sm text-gray-700">
      <StateChange state={container.state} />
      <ContainerStatistics container={container} />
    </div>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Logs" selected={isTabSelected($router.path, 'logs')} url={getTabUrl($router.path, 'logs')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />

      {#if container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE}
        <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
      {/if}
      <Tab
        title="Terminal"
        selected={isTabSelected($router.path, 'terminal')}
        url={getTabUrl($router.path, 'terminal')} />
      {#if displayTty}
        <Tab title="Tty" selected={isTabSelected($router.path, 'tty')} url={getTabUrl($router.path, 'tty')} />
      {/if}
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ContainerDetailsSummary container={container} />
      </Route>
      <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
        <ContainerDetailsLogs container={container} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <ContainerDetailsInspect container={container} />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <ContainerDetailsKube container={container} />
      </Route>
      <Route path="/terminal" breadcrumb="Terminal" navigationHint="tab">
        <ContainerDetailsTerminal container={container} />
      </Route>
      <Route path="/tty" breadcrumb="Tty" navigationHint="tab">
        <ContainerDetailsTtyTerminal container={container} />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
