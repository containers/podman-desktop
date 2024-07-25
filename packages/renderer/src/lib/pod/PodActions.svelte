<script lang="ts">
import {
  faArrowsRotate,
  faExternalLinkSquareAlt,
  faFileCode,
  faPlay,
  faRocket,
  faStop,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu } from '@podman-desktop/ui-svelte';
import { createEventDispatcher, onMount } from 'svelte';
import { router } from 'tinro';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';

import type { Menu } from '../../../../main/src/plugin/menu-registry';
import { MenuContext } from '../../../../main/src/plugin/menu-registry';
import { ContainerUtils } from '../container/container-utils';
import FlatMenu from '../ui/FlatMenu.svelte';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let pod: PodInfoUI;
export let dropdownMenu = false;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: PodInfoUI }>();
export let onUpdate: (update: PodInfoUI) => void = update => {
  dispatch('update', update);
};

let contributions: Menu[] = [];
onMount(async () => {
  contributions = await window.getContributedMenus(MenuContext.DASHBOARD_POD);
});

let urls: Array<string> = [];
$: openingUrls = urls;
$: openingKubernetesUrls = new Map();

function extractPort(urlString: string) {
  const match = urlString.match(/:(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

onMount(async () => {
  if (pod.kind === 'podman') {
    const containerUtils = new ContainerUtils();

    const containerIds = pod.containers.map(podContainer => podContainer.Id);
    const podContainers = (await window.listContainers()).filter(
      container => containerIds.findIndex(containerInfo => containerInfo === container.Id) >= 0,
    );

    podContainers.forEach(container => {
      const openingUrls = containerUtils.getOpeningUrls(container);
      urls = [...new Set([...urls, ...openingUrls])];
    });
  } else if (pod.kind === 'kubernetes') {
    const ns = await window.kubernetesGetCurrentNamespace();
    if (ns) {
      const kubepod = await window.kubernetesReadNamespacedPod(pod.name, ns);
      if (kubepod?.metadata?.labels?.app) {
        const appName = kubepod.metadata.labels.app;
        const routes = await window.kubernetesListRoutes();
        const appRoutes = routes.filter(r => r.metadata.labels && r.metadata.labels['app'] === appName);
        appRoutes.forEach(route => {
          openingKubernetesUrls = openingKubernetesUrls.set(
            route.metadata.name,
            route.spec.tls ? `https://${route.spec.host}` : `http://${route.spec.host}`,
          );
        });
      }
    }
  }
});

function inProgress(inProgress: boolean, state?: string): void {
  pod.actionInProgress = inProgress;
  // reset error when starting task
  if (inProgress) {
    pod.actionError = '';
  }
  if (state) {
    pod.status = state;
  }

  onUpdate(pod);
}

function handleError(errorMessage: string): void {
  pod.actionError = errorMessage;
  pod.status = 'ERROR';
  onUpdate(pod);
}

async function startPod() {
  inProgress(true, 'STARTING');
  try {
    await window.startPod(pod.engineId, pod.id);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

async function restartPod() {
  inProgress(false, 'RESTARTING');
  try {
    if (pod.kind === 'podman') {
      await window.restartPod(pod.engineId, pod.id);
    } else {
      await window.restartKubernetesPod(pod.name);
    }
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

async function stopPod() {
  inProgress(false, 'STOPPING');
  try {
    await window.stopPod(pod.engineId, pod.id);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

async function deletePod(): Promise<void> {
  inProgress(false, 'DELETING');
  try {
    if (pod.kind === 'podman') {
      await window.removePod(pod.engineId, pod.id);
    } else {
      await window.kubernetesDeletePod(pod.name);
    }
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

function openGenerateKube(): void {
  router.goto(`/pods/${encodeURI(pod.kind)}/${encodeURI(pod.name)}/${encodeURIComponent(pod.engineId)}/kube`);
}

function deployToKubernetes(): void {
  router.goto(`/deploy-to-kube/${pod.id}/${pod.engineId}`);
}
// If dropdownMenu = true, we'll change style to the imported dropdownMenu style
// otherwise, leave blank.
let actionsStyle: typeof DropdownMenu | typeof FlatMenu;
if (dropdownMenu) {
  actionsStyle = DropdownMenu;
} else {
  actionsStyle = FlatMenu;
}
</script>

{#if pod.kind === 'podman'}
  <ListItemButtonIcon
    title="Start Pod"
    onClick={() => startPod()}
    hidden={pod.status === 'RUNNING' || pod.status === 'STOPPING'}
    detailed={detailed}
    inProgress={pod.actionInProgress && pod.status === 'STARTING'}
    icon={faPlay}
    iconOffset="pl-[0.15rem]" />
  <ListItemButtonIcon
    title="Stop Pod"
    onClick={() => stopPod()}
    hidden={!(pod.status === 'RUNNING' || pod.status === 'STOPPING')}
    detailed={detailed}
    inProgress={pod.actionInProgress && pod.status === 'STOPPING'}
    icon={faStop} />
{/if}
<ListItemButtonIcon
  title="Delete Pod"
  onClick={() => withConfirmation(deletePod, `delete pod ${pod.name}`)}
  icon={faTrash}
  detailed={detailed}
  inProgress={pod.actionInProgress && pod.status === 'DELETING'} />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this={actionsStyle}>
  {#if pod.kind === 'podman'}
    {#if !detailed}
      <ListItemButtonIcon
        title="Generate Kube"
        onClick={() => openGenerateKube()}
        menu={dropdownMenu}
        detailed={detailed}
        icon={faFileCode} />
    {/if}
    <ListItemButtonIcon
      title="Deploy to Kubernetes"
      onClick={() => deployToKubernetes()}
      menu={dropdownMenu}
      detailed={detailed}
      icon={faRocket} />
    {#if openingUrls.length === 0}
      <ListItemButtonIcon
        title="Open Exposed Port"
        menu={dropdownMenu}
        enabled={false}
        hidden={dropdownMenu}
        detailed={detailed}
        icon={faExternalLinkSquareAlt} />
    {:else if openingUrls.length === 1}
      <ListItemButtonIcon
        title="Open {extractPort(openingUrls[0])}"
        onClick={() => window.openExternal(openingUrls[0])}
        menu={dropdownMenu}
        enabled={pod.status === 'RUNNING'}
        hidden={dropdownMenu}
        detailed={detailed}
        icon={faExternalLinkSquareAlt} />
    {:else if openingUrls.length > 1}
      <DropdownMenu icon={faExternalLinkSquareAlt} hidden={dropdownMenu} shownAsMenuActionItem={true}>
        {#each openingUrls as url}
          <ListItemButtonIcon
            title="Open {extractPort(url)}"
            onClick={() => window.openExternal(url)}
            menu={!dropdownMenu}
            enabled={pod.status === 'RUNNING'}
            hidden={dropdownMenu}
            detailed={detailed}
            icon={faExternalLinkSquareAlt} />
        {/each}
      </DropdownMenu>
    {/if}
  {/if}
  <ListItemButtonIcon
    title="Restart Pod"
    onClick={() => restartPod()}
    menu={dropdownMenu}
    detailed={detailed}
    icon={faArrowsRotate} />
  {#if pod.kind === 'kubernetes'}
    {#if openingKubernetesUrls.size === 0}
      <ListItemButtonIcon
        title="Open Browser"
        menu={dropdownMenu}
        enabled={false}
        hidden={dropdownMenu}
        detailed={detailed}
        icon={faExternalLinkSquareAlt} />
    {:else if openingKubernetesUrls.size === 1}
      <ListItemButtonIcon
        title="Open {[...openingKubernetesUrls][0][0]}"
        onClick={() => window.openExternal([...openingKubernetesUrls][0][1])}
        menu={dropdownMenu}
        enabled={pod.status === 'RUNNING'}
        hidden={dropdownMenu}
        detailed={detailed}
        icon={faExternalLinkSquareAlt} />
    {:else if openingKubernetesUrls.size > 1}
      <DropdownMenu
        title="Open Kubernetes Routes"
        icon={faExternalLinkSquareAlt}
        hidden={dropdownMenu}
        shownAsMenuActionItem={true}>
        {#each Array.from(openingKubernetesUrls) as [routeName, routeHost]}
          <ListItemButtonIcon
            title="Open {routeName}"
            onClick={() => window.openExternal(routeHost)}
            menu={!dropdownMenu}
            enabled={pod.status === 'RUNNING'}
            hidden={dropdownMenu}
            detailed={detailed}
            icon={faExternalLinkSquareAlt} />
        {/each}
      </DropdownMenu>
    {/if}
  {/if}
  <ContributionActions
    args={[pod]}
    contextPrefix="podItem"
    dropdownMenu={dropdownMenu}
    contributions={contributions}
    detailed={detailed}
    onError={handleError} />
</svelte:component>
