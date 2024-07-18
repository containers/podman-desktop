<script lang="ts">
import { faArrowsRotate, faFileCode, faPlay, faRocket, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu } from '@podman-desktop/ui-svelte';
import { createEventDispatcher, onMount } from 'svelte';
import { router } from 'tinro';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';

import type { Menu } from '../../../../main/src/plugin/menu-registry';
import { MenuContext } from '../../../../main/src/plugin/menu-registry';
import FlatMenu from '../ui/FlatMenu.svelte';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';

export let compose: ComposeInfoUI;
export let dropdownMenu = false;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: ComposeInfoUI }>();
export let onUpdate: (update: ComposeInfoUI) => void = update => {
  dispatch('update', update);
};
const composeLabel = 'com.docker.compose.project';

let contributions: Menu[] = [];
onMount(async () => {
  contributions = await window.getContributedMenus(MenuContext.DASHBOARD_COMPOSE);
});

function inProgress(inProgress: boolean, state?: string): void {
  compose.actionInProgress = inProgress;
  // reset error when starting task
  if (inProgress) {
    compose.actionError = '';
  }
  if (state) {
    compose.status = state;
  }

  for (const container of compose.containers) {
    container.actionInProgress = inProgress;
    // reset error when starting task
    if (inProgress) {
      container.actionError = '';
    }
    if (state) {
      container.state = state;
    }
  }
  onUpdate(compose);
}

function handleError(errorMessage: string): void {
  compose.actionError = errorMessage;
  compose.status = 'ERROR';

  onUpdate(compose);
}

async function startCompose() {
  inProgress(true, 'STARTING');
  try {
    await window.startContainersByLabel(compose.engineId, composeLabel, compose.name);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}
async function stopCompose() {
  inProgress(true, 'STOPPING');
  try {
    await window.stopContainersByLabel(compose.engineId, composeLabel, compose.name);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

async function deleteCompose() {
  inProgress(true, 'DELETING');
  try {
    await window.deleteContainersByLabel(compose.engineId, composeLabel, compose.name);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

async function restartCompose() {
  inProgress(true, 'RESTARTING');
  try {
    await window.restartContainersByLabel(compose.engineId, composeLabel, compose.name);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

function deployToKubernetes(): void {
  router.goto(`/compose/deploy-to-kube/${compose.name}/${compose.engineId}`);
}

function openGenerateKube(): void {
  router.goto(`/compose/details/${encodeURI(compose.name)}/${encodeURI(compose.engineId)}/kube`);
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
  onClick={() => startCompose()}
  hidden={compose.status === 'RUNNING' || compose.status === 'STOPPING'}
  detailed={detailed}
  inProgress={compose.actionInProgress && compose.status === 'STARTING'}
  icon={faPlay}
  iconOffset="pl-[0.15rem]" />

<ListItemButtonIcon
  title="Stop Compose"
  onClick={() => stopCompose()}
  hidden={!(compose.status === 'RUNNING' || compose.status === 'STOPPING')}
  detailed={detailed}
  inProgress={compose.actionInProgress && compose.status === 'STOPPING'}
  icon={faStop} />

<ListItemButtonIcon
  title="Delete Compose"
  onClick={() => withConfirmation(deleteCompose, `delete compose ${compose.name}`)}
  icon={faTrash}
  detailed={detailed}
  inProgress={compose.actionInProgress && compose.status === 'DELETING'} />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this={actionsStyle}>
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
    hidden={compose.engineType !== 'podman'}
    detailed={detailed}
    icon={faRocket} />
  <ListItemButtonIcon
    title="Restart Compose"
    onClick={() => restartCompose()}
    menu={dropdownMenu}
    detailed={detailed}
    icon={faArrowsRotate} />
  <ContributionActions
    args={[compose]}
    contextPrefix="composeItem"
    dropdownMenu={dropdownMenu}
    contributions={contributions}
    detailed={detailed}
    onError={handleError} />
</svelte:component>
