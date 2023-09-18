<script lang="ts">
import { faFileCode, faTrash, faPlay, faStop, faArrowsRotate, faRocket } from '@fortawesome/free-solid-svg-icons';
import type { ComposeInfoUI } from './ComposeInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import DropdownMenu from '../ui/DropdownMenu.svelte';
import FlatMenu from '../ui/FlatMenu.svelte';
import type { ContainerInfoUI } from '../container/ContainerInfoUI';
import type { Menu } from '../../../../main/src/plugin/menu-registry';
import ContributionActions from '/@/lib/actions/ContributionActions.svelte';

export let compose: ComposeInfoUI;
export let dropdownMenu = false;
export let detailed = false;
export let contributions: Menu[] = [];

export let inProgressCallback: (containers: ContainerInfoUI[], inProgress: boolean, state?: string) => void = () => {};
export let errorCallback: (erroMessage: string) => void = () => {};

const composeLabel = 'com.docker.compose.project';

async function startCompose(composeInfoUI: ComposeInfoUI) {
  inProgressCallback(composeInfoUI.containers, true, 'STARTING');
  try {
    await window.startContainersByLabel(composeInfoUI.engineId, composeLabel, composeInfoUI.name);
  } catch (error) {
    errorCallback(String(error));
  } finally {
    inProgressCallback(composeInfoUI.containers, false, 'RUNNING');
  }
}
async function stopCompose(composeInfoUI: ComposeInfoUI) {
  inProgressCallback(composeInfoUI.containers, true, 'STOPPING');
  try {
    await window.stopContainersByLabel(composeInfoUI.engineId, composeLabel, composeInfoUI.name);
  } catch (error) {
    errorCallback(String(error));
  } finally {
    inProgressCallback(composeInfoUI.containers, false, 'STOPPED');
  }
}

async function deleteCompose(composeInfoUI: ComposeInfoUI) {
  inProgressCallback(composeInfoUI.containers, true, 'DELETING');
  try {
    await window.deleteContainersByLabel(composeInfoUI.engineId, composeLabel, composeInfoUI.name);
  } catch (error) {
    errorCallback(String(error));
  } finally {
    inProgressCallback(composeInfoUI.containers, false, 'STOPPED');
  }
}

async function restartCompose(composeInfoUI: ComposeInfoUI) {
  inProgressCallback(composeInfoUI.containers, true, 'RESTARTING');
  try {
    await window.restartContainersByLabel(composeInfoUI.engineId, composeLabel, composeInfoUI.name);
  } catch (error) {
    errorCallback(String(error));
  } finally {
    inProgressCallback(composeInfoUI.containers, false);
  }
}

function deployToKubernetes(): void {
  router.goto(`/compose/deploy-to-kube/${compose.name}/${compose.engineId}`);
}

function openGenerateKube(): void {
  router.goto(`/compose/${encodeURI(compose.name)}/${encodeURI(compose.engineId)}/kube`);
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
  title="Start Compose"
  onClick="{() => startCompose(compose)}"
  hidden="{compose.status === 'RUNNING' || compose.status === 'STOPPING'}"
  detailed="{detailed}"
  inProgress="{compose.actionInProgress && compose.status === 'STARTING'}"
  icon="{faPlay}"
  iconOffset="pl-[0.15rem]" />

<ListItemButtonIcon
  title="Stop Compose"
  onClick="{() => stopCompose(compose)}"
  hidden="{!(compose.status === 'RUNNING' || compose.status === 'STOPPING')}"
  detailed="{detailed}"
  inProgress="{compose.actionInProgress && compose.status === 'STOPPING'}"
  icon="{faStop}" />

<ListItemButtonIcon
  title="Delete Compose"
  onClick="{() => deleteCompose(compose)}"
  icon="{faTrash}"
  detailed="{detailed}"
  inProgress="{compose.actionInProgress && compose.status === 'DELETING'}" />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this="{actionsStyle}">
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
    hidden="{!(compose.engineType === 'podman')}"
    detailed="{detailed}"
    icon="{faRocket}" />
  <ListItemButtonIcon
    title="Restart Compose"
    onClick="{() => restartCompose(compose)}"
    menu="{dropdownMenu}"
    detailed="{detailed}"
    icon="{faArrowsRotate}" />
  <ContributionActions
    args="{[compose]}"
    dropdownMenu="{dropdownMenu}"
    contributions="{contributions}"
    onError="{errorCallback}" />
</svelte:component>
