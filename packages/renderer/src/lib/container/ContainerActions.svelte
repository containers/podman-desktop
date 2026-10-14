<script lang="ts">
import type { Menu } from '@desktop-framework/api';
import { MenuContext, NavigationPage } from '@desktop-framework/api';
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
import { onMount } from 'svelte';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { ContextUI } from '/@/lib/context/context';
import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import FlatMenu from '/@/lib/ui/FlatMenu.svelte';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import { handleNavigation } from '/@/navigation';
import { containersInfos, setContainerActionError, setContainerStatus } from '/@/stores/containers';
import { context } from '/@/stores/context';

import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from './ContainerInfoUI';

interface Props {
  container: ContainerInfoUI;
  dropdownMenu?: boolean;
  detailed?: boolean;
}

const { container, dropdownMenu = false, detailed = false }: Props = $props();

let globalContext: ContextUI = $derived.by(() => {
  let contextUI = new ContextUI();
  const allValues = $context.collectAllValues();
  for (const k in allValues) {
    contextUI.setValue(k, allValues[k]);
  }
  contextUI.setValue('containerImageName', container.image);
  return contextUI;
});

let contributions: Menu[] = $state([]);
onMount(async () => {
  contributions = await window.getContributedMenus(MenuContext.DASHBOARD_CONTAINER);
});

function inProgress(inProgress: boolean, state?: string): void {
  const cnt = $containersInfos.find(c => c.id === container.id && c.engineId === container.engineId);
  if (!cnt) return;

  let containerActionError = cnt.actionError;
  if (inProgress) {
    containerActionError = '';
  }

  let containerState = cnt.state;
  if (state) {
    containerState = state;
  }
  setContainerStatus(container.engineId, container.id, containerState, inProgress, containerActionError);
}

function handleError(errorMessage: string): void {
  setContainerActionError(container.engineId, container.id, errorMessage);
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

async function unpauseContainer(): Promise<void> {
  inProgress(true, 'STARTING');
  try {
    await window.unpauseContainer(container.engineId, container.id);
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
  window
    .openExternal(container.openingUrl)
    .catch((err: unknown) => console.error(`Error opening URL ${container.openingUrl}`, err));
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
let ActionsStyle = $derived(dropdownMenu ? DropdownMenu : FlatMenu);
</script>

<ListItemButtonIcon
  title="Start Container"
  onClick={container.state === 'PAUSED' ? unpauseContainer : startContainer}
  hidden={container.state === 'RUNNING' || container.state === 'STOPPING'}
  detailed={detailed}
  inProgress={container.actionInProgress && container.state === 'STARTING'}
  icon={faPlay}/>

<ListItemButtonIcon
  title="Stop Container"
  onClick={stopContainer}
  hidden={!(container.state === 'RUNNING' || container.state === 'STOPPING')}
  detailed={detailed}
  inProgress={container.actionInProgress && container.state === 'STOPPING'}
  icon={faStop} />

<ListItemButtonIcon
  title="Delete Container"
  onClick={(): void => withConfirmation(deleteContainer, `delete container ${container.name}`, { title: 'Delete Container?', variant: 'delete' })}
  icon={faTrash}
  detailed={detailed}
  inProgress={container.actionInProgress && container.state === 'DELETING'} />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<ActionsStyle>
  {#if !detailed}
    <ListItemButtonIcon
      title="Open Logs"
      onClick={openLogs}
      menu={dropdownMenu}
      detailed={false}
      icon={faAlignLeft} />
    <ListItemButtonIcon
      title="Generate Kube"
      onClick={openGenerateKube}
      menu={dropdownMenu}
      hidden={!(container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE)}
      detailed={detailed}
      icon={faFileCode} />
  {/if}
  <ListItemButtonIcon
    title="Deploy to Kubernetes"
    onClick={deployToKubernetes}
    menu={dropdownMenu}
    hidden={!(container.engineType === 'podman' && container.groupInfo.type === ContainerGroupInfoTypeUI.STANDALONE)}
    detailed={detailed}
    icon={faRocket} />
  <ListItemButtonIcon
    title="Open Browser"
    onClick={openBrowser}
    menu={dropdownMenu}
    enabled={container.state === 'RUNNING' && container.hasPublicPort}
    hidden={dropdownMenu && container.state !== 'RUNNING'}
    detailed={detailed}
    icon={faExternalLinkSquareAlt} />
  {#if !detailed}
    <ListItemButtonIcon
      title="Open Terminal"
      onClick={openTerminalContainer}
      menu={dropdownMenu}
      hidden={container.state !== 'RUNNING'}
      detailed={false}
      icon={faTerminal} />
  {/if}
  <ListItemButtonIcon
    title="Restart Container"
    onClick={restartContainer}
    menu={dropdownMenu}
    detailed={detailed}
    icon={faArrowsRotate} />
  <ListItemButtonIcon
    title="Export Container"
    tooltip="Exports container's filesystem contents as a tar archive and saves it on the local machine"
    onClick={exportContainer}
    menu={dropdownMenu}
    detailed={detailed}
    icon={faDownload} />
  <ContributionActions
    args={[container]}
    contextPrefix="containerItem"
    dropdownMenu={dropdownMenu}
    contributions={contributions}
    detailed={detailed}
    onError={handleError}
    contextUI={globalContext} />
</ActionsStyle>
