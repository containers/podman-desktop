<script lang="ts">
import {
  faAlignLeft,
  faArrowsRotate,
  faDownload,
  faExternalLinkSquareAlt,
  faFileCode,
  faPlay,
  faRocket,
  faStop,
  faTerminal,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu } from '@podman-desktop/ui-svelte';
import { createEventDispatcher, onMount } from 'svelte';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import { handleNavigation } from '/@/navigation';
import { NavigationPage } from '/@api/navigation-page';

import type { Menu } from '../../../../main/src/plugin/menu-registry';
import { MenuContext } from '../../../../main/src/plugin/menu-registry';
import FlatMenu from '../ui/FlatMenu.svelte';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;
export let dropdownMenu = false;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: ContainerInfoUI }>();
export let onUpdate: (update: ContainerInfoUI) => void = update => {
  dispatch('update', update);
};
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
  onUpdate(container);
}

function handleError(errorMessage: string): void {
  container.actionError = errorMessage;
  container.state = 'ERROR';
  onUpdate(container);
}

async function startContainer(): Promise<void> {
  inProgress(true, 'STARTING');
  try {
    await window.startContainer(container.engineId, container.id);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

async function restartContainer(): Promise<void> {
  inProgress(true, 'RESTARTING');
  try {
    await window.restartContainer(container.engineId, container.id);
  } catch (error) {
    handleError(String(error));
  } finally {
    inProgress(false);
  }
}

async function stopContainer(): Promise<void> {
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
  handleNavigation({
    page: NavigationPage.CONTAINER_LOGS,
    parameters: {
      id: container.id,
    },
  });
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

async function exportContainer(): Promise<void> {
  handleNavigation({
    page: NavigationPage.CONTAINER_EXPORT,
    parameters: {
      id: container.id,
    },
  });
}

function openTerminalContainer(): void {
  handleNavigation({
    page: NavigationPage.CONTAINER_TERMINAL,
    parameters: {
      id: container.id,
    },
  });
}

function openGenerateKube(): void {
  handleNavigation({
    page: NavigationPage.CONTAINER_KUBE,
    parameters: {
      id: container.id,
    },
  });
}

function deployToKubernetes(): void {
  handleNavigation({
    page: NavigationPage.DEPLOY_TO_KUBE,
    parameters: {
      id: container.id,
      engineId: container.engineId,
    },
  });
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
  onClick={() => startContainer()}
  hidden={container.state === 'RUNNING' || container.state === 'STOPPING'}
  detailed={detailed}
  inProgress={container.actionInProgress && container.state === 'STARTING'}
  icon={faPlay}
  iconOffset="pl-[0.15rem]" />

<ListItemButtonIcon
  title="Stop Container"
  onClick={() => stopContainer()}
  hidden={!(container.state === 'RUNNING' || container.state === 'STOPPING')}
  detailed={detailed}
  inProgress={container.actionInProgress && container.state === 'STOPPING'}
  icon={faStop} />

<ListItemButtonIcon
  title="Delete Container"
  onClick={() => withConfirmation(deleteContainer, `delete container ${container.name}`)}
  icon={faTrash}
  detailed={detailed}
  inProgress={container.actionInProgress && container.state === 'DELETING'} />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<svelte:component this={actionsStyle}>
  {#if !detailed}
    <ListItemButtonIcon
      title="Open Logs"
      onClick={() => openLogs()}
      menu={dropdownMenu}
      detailed={false}
      icon={faAlignLeft} />
    <ListItemButtonIcon
      title="Generate Kube"
      onClick={() => openGenerateKube()}
      menu={dropdownMenu}
      hidden={!(container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE)}
      detailed={detailed}
      icon={faFileCode} />
  {/if}
  <ListItemButtonIcon
    title="Deploy to Kubernetes"
    onClick={() => deployToKubernetes()}
    menu={dropdownMenu}
    hidden={!(container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE)}
    detailed={detailed}
    icon={faRocket} />
  <ListItemButtonIcon
    title="Open Browser"
    onClick={() => openBrowser()}
    menu={dropdownMenu}
    enabled={container.state === 'RUNNING' && container.hasPublicPort}
    hidden={dropdownMenu && container.state !== 'RUNNING'}
    detailed={detailed}
    icon={faExternalLinkSquareAlt} />
  {#if !detailed}
    <ListItemButtonIcon
      title="Open Terminal"
      onClick={() => openTerminalContainer()}
      menu={dropdownMenu}
      hidden={container.state !== 'RUNNING'}
      detailed={false}
      icon={faTerminal} />
  {/if}
  <ListItemButtonIcon
    title="Restart Container"
    onClick={() => restartContainer()}
    menu={dropdownMenu}
    detailed={detailed}
    icon={faArrowsRotate} />
  <ListItemButtonIcon
    title="Export Container"
    tooltip="Exports container's filesystem contents as a tar archive and saves it on the local machine"
    onClick={() => exportContainer()}
    menu={dropdownMenu}
    detailed={detailed}
    icon={faDownload} />
  <ContributionActions
    args={[container]}
    contextPrefix="containerItem"
    dropdownMenu={dropdownMenu}
    contributions={contributions}
    detailed={detailed}
    onError={handleError} />
</svelte:component>
