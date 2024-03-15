<script lang="ts">
import {
  faAlignLeft,
  faArrowsRotate,
  faExternalLinkSquareAlt,
  faFileCode,
  faPlay,
  faRocket,
  faStop,
  faTerminal,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher, onMount } from 'svelte';
import { router } from 'tinro';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';

import type { Menu } from '../../../../main/src/plugin/menu-registry';
import { MenuContext } from '../../../../main/src/plugin/menu-registry';
import DropdownMenu from '../ui/DropdownMenu.svelte';
import FlatMenu from '../ui/FlatMenu.svelte';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;
export let dropdownMenu = false;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: ContainerInfoUI }>();

let contributions: Menu[] = [];
onMount(async () => {
  contributions = await window.getContributedMenus(MenuContext.DASHBOARD_CONTAINER);
});

function inProgress(inProgress: boolean, state?: string): void {
  container.actionInProgress = inProgress;
  // reset error when starting task
  if (inProgress) {
    container.actionError = '';
  }
  if (state) {
    container.state = state;
  }
  dispatch('update', container);
}

function handleError(errorMessage: string): void {
  container.actionError = errorMessage;
  container.state = 'ERROR';
  dispatch('update', container);
}

async function startContainer() {
  inProgress(true, 'STARTING');
  try {
    await window.startContainer(container.engineId, container.id);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

async function restartContainer() {
  inProgress(true, 'RESTARTING');
  try {
    await window.restartContainer(container.engineId, container.id);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

async function stopContainer() {
  inProgress(true, 'STOPPING');
  try {
    await window.stopContainer(container.engineId, container.id);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

function openBrowser(): void {
  if (!container.openingUrl) {
    return;
  }
  window.openExternal(container.openingUrl);
}

function openLogs(): void {
  router.goto(`/containers/${container.id}/logs`);
}

async function deleteContainer(): Promise<void> {
  inProgress(true, 'DELETING');
  try {
    await window.deleteContainer(container.engineId, container.id);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

function openTerminalContainer(): void {
  router.goto(`/containers/${container.id}/terminal`);
}

function openGenerateKube(): void {
  router.goto(`/containers/${container.id}/kube`);
}

function deployToKubernetes(): void {
  router.goto(`/deploy-to-kube/${container.id}/${container.engineId}`);
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

<ListItemButtonIcon
  title="Start Container"
  onClick="{() => startContainer()}"
  hidden="{container.state === 'RUNNING' || container.state === 'STOPPING'}"
  detailed="{detailed}"
  inProgress="{container.actionInProgress && container.state === 'STARTING'}"
  icon="{faPlay}"
  iconOffset="pl-[0.15rem]" />

<ListItemButtonIcon
  title="Stop Container"
  onClick="{() => stopContainer()}"
  hidden="{!(container.state === 'RUNNING' || container.state === 'STOPPING')}"
  detailed="{detailed}"
  inProgress="{container.actionInProgress && container.state === 'STOPPING'}"
  icon="{faStop}" />

<ListItemButtonIcon
  title="Delete Container"
  confirm="{true}"
  onClick="{() => deleteContainer()}"
  icon="{faTrash}"
  detailed="{detailed}"
  inProgress="{container.actionInProgress && container.state === 'DELETING'}" />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this="{actionsStyle}">
  {#if !detailed}
    <ListItemButtonIcon
      title="Open Logs"
      onClick="{() => openLogs()}"
      menu="{dropdownMenu}"
      detailed="{false}"
      icon="{faAlignLeft}" />
    <ListItemButtonIcon
      title="Generate Kube"
      onClick="{() => openGenerateKube()}"
      menu="{dropdownMenu}"
      hidden="{!(
        container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE
      )}"
      detailed="{detailed}"
      icon="{faFileCode}" />
  {/if}
  <ListItemButtonIcon
    title="Deploy to Kubernetes"
    onClick="{() => deployToKubernetes()}"
    menu="{dropdownMenu}"
    hidden="{!(container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE)}"
    detailed="{detailed}"
    icon="{faRocket}" />
  <ListItemButtonIcon
    title="Open Browser"
    onClick="{() => openBrowser()}"
    menu="{dropdownMenu}"
    enabled="{container.state === 'RUNNING' && container.hasPublicPort}"
    hidden="{dropdownMenu && container.state !== 'RUNNING'}"
    detailed="{detailed}"
    icon="{faExternalLinkSquareAlt}" />
  {#if !detailed}
    <ListItemButtonIcon
      title="Open Terminal"
      onClick="{() => openTerminalContainer()}"
      menu="{dropdownMenu}"
      hidden="{!(container.state === 'RUNNING')}"
      detailed="{false}"
      icon="{faTerminal}" />
  {/if}
  <ListItemButtonIcon
    title="Restart Container"
    onClick="{() => restartContainer()}"
    menu="{dropdownMenu}"
    detailed="{detailed}"
    icon="{faArrowsRotate}" />
  <ContributionActions
    args="{[container]}"
    contextPrefix="containerItem"
    dropdownMenu="{dropdownMenu}"
    contributions="{contributions}"
    detailed="{detailed}"
    onError="{handleError}" />
</svelte:component>
