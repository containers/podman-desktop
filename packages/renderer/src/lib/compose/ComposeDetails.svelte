<script lang="ts">
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import type { ContainerInfoUI } from '/@/lib/container/ContainerInfoUI';
import ComposeIcon from '/@/lib/images/PodIcon.svelte';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import Route from '/@/Route.svelte';
import { containersInfos } from '/@/stores/containers';

import ComposeActions from './ComposeActions.svelte';
import ComposeDetailsInspect from './ComposeDetailsInspect.svelte';
import ComposeDetailsKube from './ComposeDetailsKube.svelte';
import ComposeDetailsLogs from './ComposeDetailsLogs.svelte';
import ComposeDetailsSummary from './ComposeDetailsSummary.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';

interface Props {
  composeName: string;
  engineId: string;
}

let { composeName, engineId }: Props = $props();

// We only care about the status. Check each containersMatchingProject status and if every container is RUNNING, set status to RUNNING,
// else let status be 'STOPPED'
let status = $derived.by(() => {
  if (containerInProgress) {
    return containerInProgress.state;
  } else if (containersMatchingProject.length === 0) {
    return 'STOPPED';
  } else {
    const allRunning = containersMatchingProject.every(container => {
      // the UI state is uppercased by ContainerUtils.getState, unlike the raw backend value
      return container?.state === 'RUNNING';
    });
    if (allRunning) {
      return 'RUNNING';
    } else {
      return 'STOPPED';
    }
  }
});

// We will use the containersInfos store to get every container that matches
// the label com.docker.compose.project={composeName}
// Get all containers that match the composeName we are looking at
let containersMatchingProject = $derived<ContainerInfoUI[]>(
  $containersInfos.filter(container => {
    return container?.labels['com.docker.compose.project'] === composeName;
  }),
);

let containerInProgress = $derived(containersMatchingProject.find(container => container.actionInProgress));

let actionInProgress = $derived(containerInProgress?.actionInProgress ?? false);

// Get the engine type from the first container in the list (if it exists), else use podman
let engineType = $derived.by<'docker' | 'podman'>(() => {
  if (convertedContainers.length > 0) {
    return convertedContainers[0].engineType;
  }
  return 'podman';
});

// the store already holds ContainerInfoUI; copy so ComposeActions, which writes
// actionInProgress, actionError and state, never touches the store's own elements
let convertedContainers = $derived(
  containersMatchingProject.map(container => {
    return { ...container };
  }),
);

// Make sure we update the compose object with the name, status, engineID, containers, etc.
// or else logging will not appear correctly when loading (it'll see empty containers..)
let compose = $derived<ComposeInfoUI>({
  name: composeName,
  engineId: engineId,
  engineType: engineType,
  status: status,
  actionInProgress: actionInProgress,
  containers: convertedContainers,
});
</script>

{#if compose}
  <DetailsPage title={composeName} subtitle="">
    {#snippet iconSnippet()}
      <StatusIcon icon={ComposeIcon} size={24} status={compose.status} />
    {/snippet}
    {#snippet actionsSnippet()}
      <div class="flex items-center w-5">
        <div>&nbsp;</div>
      </div>
      <ComposeActions compose={compose} detailed={true} on:update={(): ComposeInfoUI => (compose = compose)} />
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Logs" selected={isTabSelected($router.path, 'logs')} url={getTabUrl($router.path, 'logs')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    {/snippet}
    {#snippet contentSnippet()}
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
    {/snippet}
  </DetailsPage>
{/if}
