<script lang="ts">
import { faTrash, faPlay, faStop, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import type { ComposeInfoUI } from './ComposeInfoUI';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import DropdownMenu from '../ui/DropdownMenu.svelte';
import FlatMenu from '../ui/FlatMenu.svelte';

export let compose: ComposeInfoUI;
export let dropdownMenu = false;
export let detailed = false;

export let inProgressCallback: (inProgress: boolean, state?: string) => void = () => {};
export let errorCallback: (erroMessage: string) => void = () => {};

const composeLabel = 'com.docker.compose.project';

async function startCompose(composeInfoUI: ComposeInfoUI) {
  inProgressCallback(true, 'STARTING');
  try {
    await window.startContainersByLabel(composeInfoUI.engineId, composeLabel, composeInfoUI.name);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false, 'RUNNING');
  }
}
async function stopCompose(composeInfoUI: ComposeInfoUI) {
  inProgressCallback(true, 'STOPPING');
  try {
    await window.stopContainersByLabel(composeInfoUI.engineId, composeLabel, composeInfoUI.name);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false, 'STOPPED');
  }
}

async function deleteCompose(composeInfoUI: ComposeInfoUI) {
  inProgressCallback(true, 'DELETING');
  try {
    await window.deleteContainersByLabel(composeInfoUI.engineId, composeLabel, composeInfoUI.name);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false, 'STOPPED');
  }
}

async function restartCompose(composeInfoUI: ComposeInfoUI) {
  inProgressCallback(true, 'RESTARTING');
  try {
    await window.restartContainersByLabel(composeInfoUI.engineId, composeLabel, composeInfoUI.name);
  } catch (error) {
    errorCallback(error);
  } finally {
    inProgressCallback(false);
  }
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
  <ListItemButtonIcon
    title="Restart Compose"
    onClick="{() => restartCompose(compose)}"
    menu="{dropdownMenu}"
    detailed="{detailed}"
    icon="{faArrowsRotate}" />
</svelte:component>
