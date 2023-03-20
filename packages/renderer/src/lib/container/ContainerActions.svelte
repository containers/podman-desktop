<script lang="ts">
import {
  faAlignLeft,
  faEllipsisVertical,
  faFileCode,
  faPlay,
  faRocket,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons';
import { faStop } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { ContainerGroupInfoTypeUI, ContainerInfoUI } from './ContainerInfoUI';

import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import DropdownMenu from '../ui/DropdownMenu.svelte';
import FlatMenu from '../ui/FlatMenu.svelte';
export let container: ContainerInfoUI;
export let dropdownMenu: boolean = false;
export let detailed: boolean = false;

export let inProgressCallback: (inProgress: boolean, state?: string) => void = () => {};
export let errorCallback: (erroMessage: string) => void = () => {};

async function startContainer(containerInfo: ContainerInfoUI) {
  inProgressCallback(true, 'STARTING');
  try {
    await window.startContainer(containerInfo.engineId, containerInfo.id);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
}

async function restartContainer(containerInfo: ContainerInfoUI) {
  inProgressCallback(true, 'RESTARTING');
  try {
    await window.restartContainer(containerInfo.engineId, containerInfo.id);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
}

async function stopContainer(containerInfo: ContainerInfoUI) {
  inProgressCallback(true);
  try {
    await window.stopContainer(containerInfo.engineId, containerInfo.id);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
}

function openBrowser(containerInfo: ContainerInfoUI): void {
  window.openExternal(containerInfo.openingUrl);
}

function openLogs(containerInfo: ContainerInfoUI): void {
  router.goto(`/containers/${container.id}/logs`);
}

async function deleteContainer(containerInfo: ContainerInfoUI): Promise<void> {
  inProgressCallback(true);
  try {
    await window.deleteContainer(containerInfo.engineId, containerInfo.id);
    router.goto('/containers/');
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
}

function openTerminalContainer(containerInfo: ContainerInfoUI): void {
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
let actionsStyle;
if (dropdownMenu) {
  actionsStyle = DropdownMenu;
} else {
  actionsStyle = FlatMenu;
}
</script>

<ListItemButtonIcon
  title="Start Container"
  onClick="{() => startContainer(container)}"
  hidden="{container.state === 'RUNNING'}"
  detailed="{detailed}"
  icon="{faPlay}" />

<ListItemButtonIcon
  title="Stop Container"
  onClick="{() => stopContainer(container)}"
  hidden="{!(container.state === 'RUNNING')}"
  detailed="{detailed}"
  icon="{faStop}" />

<ListItemButtonIcon
  title="Delete Container"
  onClick="{() => deleteContainer(container)}"
  icon="{faTrash}"
  detailed="{detailed}" />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this="{actionsStyle}">
  {#if !detailed}
    <ListItemButtonIcon
      title="Open Logs"
      onClick="{() => openLogs(container)}"
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
    onClick="{() => openBrowser(container)}"
    menu="{dropdownMenu}"
    enabled="{container.state === 'RUNNING' && container.hasPublicPort}"
    hidden="{dropdownMenu && container.state !== 'RUNNING'}"
    detailed="{detailed}"
    icon="{faExternalLinkSquareAlt}" />
  {#if !detailed}
    <ListItemButtonIcon
      title="Open Terminal"
      onClick="{() => openTerminalContainer(container)}"
      menu="{dropdownMenu}"
      hidden="{!(container.state === 'RUNNING')}"
      detailed="{false}"
      icon="{faTerminal}" />
  {/if}
  <ListItemButtonIcon
    title="Restart Container"
    onClick="{() => restartContainer(container)}"
    menu="{dropdownMenu}"
    detailed="{detailed}"
    icon="{faArrowsRotate}" />
</svelte:component>
