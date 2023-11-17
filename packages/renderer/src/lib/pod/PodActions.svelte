<script lang="ts">
import {
  faFileCode,
  faPlay,
  faRocket,
  faStop,
  faArrowsRotate,
  faTrash,
  faExternalLinkSquareAlt,
} from '@fortawesome/free-solid-svg-icons';
import type { PodInfoUI } from './PodInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import DropdownMenu from '../ui/DropdownMenu.svelte';
import FlatMenu from '../ui/FlatMenu.svelte';
import type { Menu } from '../../../../main/src/plugin/menu-registry';
import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { onMount } from 'svelte';
import { MenuContext } from '../../../../main/src/plugin/menu-registry';
import { ContainerUtils } from '../container/container-utils';

export let pod: PodInfoUI;
export let dropdownMenu = false;
export let detailed = false;

export let inProgressCallback: (inProgress: boolean, state?: string) => void = () => {};
export let errorCallback: (erroMessage: string) => void = () => {};

let contributions: Menu[] = [];
onMount(async () => {
  contributions = await window.getContributedMenus(MenuContext.DASHBOARD_POD);
});

let urls: Array<string> = [];
$: openingUrls = urls;

function extractPort(urlString: string) {
  const match = urlString.match(/:(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

onMount(async () => {
  const containerUtils = new ContainerUtils();

  const containerIds = pod.containers.map(podContainer => podContainer.Id);
  const podContainers = (await window.listContainers()).filter(
    container => containerIds.findIndex(containerInfo => containerInfo === container.Id) >= 0,
  );

  podContainers.forEach(container => {
    const openingUrls = containerUtils.getOpeningUrls(container);
    urls = [...new Set([...urls, ...openingUrls])];
  });
});

async function startPod(podInfoUI: PodInfoUI) {
  inProgressCallback(true, 'STARTING');
  try {
    await window.startPod(podInfoUI.engineId, podInfoUI.id);
  } catch (error) {
    errorCallback(String(error));
  } finally {
    inProgressCallback(false, 'RUNNING');
  }
}

async function restartPod(podInfoUI: PodInfoUI) {
  inProgressCallback(true, 'RESTARTING');
  try {
    await window.restartPod(podInfoUI.engineId, podInfoUI.id);
  } catch (error) {
    errorCallback(String(error));
  } finally {
    inProgressCallback(false);
  }
}

async function stopPod(podInfoUI: PodInfoUI) {
  inProgressCallback(true, 'STOPPING');
  try {
    await window.stopPod(podInfoUI.engineId, podInfoUI.id);
  } catch (error) {
    errorCallback(String(error));
  } finally {
    inProgressCallback(false, 'STOPPED');
  }
}

async function deletePod(podInfoUI: PodInfoUI): Promise<void> {
  inProgressCallback(true, 'DELETING');
  try {
    if (pod.kind === 'podman') {
      await window.removePod(podInfoUI.engineId, podInfoUI.id);
    } else {
      await window.kubernetesDeletePod(podInfoUI.name);
    }
  } catch (error) {
    errorCallback(String(error));
  } finally {
    inProgressCallback(false);
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
    onClick="{() => startPod(pod)}"
    hidden="{pod.status === 'RUNNING' || pod.status === 'STOPPING'}"
    detailed="{detailed}"
    inProgress="{pod.actionInProgress && pod.status === 'STARTING'}"
    icon="{faPlay}"
    iconOffset="pl-[0.15rem]" />
  <ListItemButtonIcon
    title="Stop Pod"
    onClick="{() => stopPod(pod)}"
    hidden="{!(pod.status === 'RUNNING' || pod.status === 'STOPPING')}"
    detailed="{detailed}"
    inProgress="{pod.actionInProgress && pod.status === 'STOPPING'}"
    icon="{faStop}" />
{/if}
<ListItemButtonIcon
  title="Delete Pod"
  onClick="{() => deletePod(pod)}"
  icon="{faTrash}"
  detailed="{detailed}"
  inProgress="{pod.actionInProgress && pod.status === 'DELETING'}" />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this="{actionsStyle}">
  {#if pod.kind === 'podman'}
    {#if !detailed}
      <ListItemButtonIcon
        title="Generate Kube"
        onClick="{() => openGenerateKube()}"
        menu="{dropdownMenu}"
        detailed="{detailed}"
        icon="{faFileCode}" />
    {/if}
    <ListItemButtonIcon
      title="Deploy to Kubernetes"
      onClick="{() => deployToKubernetes()}"
      menu="{dropdownMenu}"
      detailed="{detailed}"
      icon="{faRocket}" />
    {#if openingUrls.length === 0}
      <ListItemButtonIcon
        title="Open Exposed Port"
        menu="{dropdownMenu}"
        enabled="{false}"
        hidden="{dropdownMenu}"
        detailed="{detailed}"
        icon="{faExternalLinkSquareAlt}" />
    {:else if openingUrls.length === 1}
      <ListItemButtonIcon
        title="Open {extractPort(openingUrls[0])}"
        onClick="{() => window.openExternal(openingUrls[0])}"
        menu="{dropdownMenu}"
        enabled="{pod.status === 'RUNNING'}"
        hidden="{dropdownMenu}"
        detailed="{detailed}"
        icon="{faExternalLinkSquareAlt}" />
    {:else if openingUrls.length > 1}
      <DropdownMenu icon="{faExternalLinkSquareAlt}" hidden="{dropdownMenu}" shownAsMenuActionItem="{true}">
        {#each openingUrls as url}
          <ListItemButtonIcon
            title="Open {extractPort(url)}"
            onClick="{() => window.openExternal(url)}"
            menu="{!dropdownMenu}"
            enabled="{pod.status === 'RUNNING'}"
            hidden="{dropdownMenu}"
            detailed="{detailed}"
            icon="{faExternalLinkSquareAlt}" />
        {/each}
      </DropdownMenu>
    {/if}
    <ListItemButtonIcon
      title="Restart Pod"
      onClick="{() => restartPod(pod)}"
      menu="{dropdownMenu}"
      detailed="{detailed}"
      icon="{faArrowsRotate}" />
  {/if}
  <ContributionActions
    args="{[pod]}"
    contextPrefix="podItem"
    dropdownMenu="{dropdownMenu}"
    contributions="{contributions}"
    onError="{errorCallback}" />
</svelte:component>
