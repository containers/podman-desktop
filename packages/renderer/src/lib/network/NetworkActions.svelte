<script lang="ts">
import type { Menu } from '@desktop-framework/api';
import { MenuContext } from '@desktop-framework/api';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu } from '@podman-desktop/ui-svelte';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import FlatMenu from '/@/lib/ui/FlatMenu.svelte';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import { setNetworkStatus } from '/@/stores/networks';

import type { NetworkInfoUI } from './NetworkInfoUI';
import UpdateNetworkDialog from './UpdateNetworkDialog.svelte';

interface Props {
  object: NetworkInfoUI;
  dropdownMenu?: boolean;
  detailed?: boolean;
}

let { object, dropdownMenu = true, detailed = false }: Props = $props();

const contributions: Promise<Menu[]> = $derived(window.getContributedMenus(MenuContext.DASHBOARD_NETWORK));
const MenuComponent = $derived(dropdownMenu ? DropdownMenu : FlatMenu);

let showUpdateNetworkDialog = $state(false);

async function removeNetwork(): Promise<void> {
  const oldStatus = object.status;
  setNetworkStatus(object.engineId, object.id, 'DELETING');

  try {
    await window.removeNetwork(object.engineId, object.id);
  } catch (error) {
    setNetworkStatus(object.engineId, object.id, oldStatus);
    await window.showMessageBox({
      title: 'Delete Network Failed',
      message: `Error while deleting network ${object.name}: ${error instanceof Error ? error.message : String(error)}`,
      type: 'error',
      buttons: ['Dismiss'],
    });
  }
}

function closeUpdateDialog(): void {
  showUpdateNetworkDialog = false;
}
</script>

<ListItemButtonIcon
  title="Update Network"
  onClick={(): void => {showUpdateNetworkDialog = true;}}
  icon={faEdit}
  detailed={detailed}
  enabled={object.engineType === 'podman'} />

<ListItemButtonIcon
  title="Delete Network"
  onClick={(): void => withConfirmation(removeNetwork, `delete network ${object.name}`, { title: 'Delete Network?', variant: 'delete' })}
  icon={faTrash}
  detailed={detailed}
  enabled={object.status === 'UNUSED'} />

{#if showUpdateNetworkDialog}
  <UpdateNetworkDialog network={object} onClose={closeUpdateDialog} />
{/if}

{#await contributions then menus}
  {#if menus.length > 0}
    <MenuComponent>
      <ContributionActions
        args={[object]}
        contextPrefix="networkItem"
        dropdownMenu={dropdownMenu}
        contributions={menus}
        detailed={detailed}
        onError={(errorMessage: string): void => console.error(errorMessage)} />
    </MenuComponent>
  {/if}
{/await}
