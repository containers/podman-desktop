<script lang="ts">
import type { Menu } from '@desktop-framework/api';
import { MenuContext } from '@desktop-framework/api';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu } from '@podman-desktop/ui-svelte';
import { createEventDispatcher, onMount } from 'svelte';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import FlatMenu from '/@/lib/ui/FlatMenu.svelte';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import { setVolumeStatus } from '/@/stores/volumes';

import type { VolumeInfoUI } from './VolumeInfoUI';

interface Props {
  volume: VolumeInfoUI;
  dropdownMenu?: boolean;
  detailed?: boolean;
}

let { volume, dropdownMenu = false, detailed = false }: Props = $props();

const dispatch = createEventDispatcher<{ update: VolumeInfoUI }>();

let contributions: Menu[] = $state([]);
onMount(async () => {
  try {
    contributions = await window.getContributedMenus(MenuContext.DASHBOARD_VOLUME);
  } catch (error) {
    console.error('Error fetching contributed menus for volumes:', error);
  }
});

async function removeVolume(): Promise<void> {
  setVolumeStatus(volume.engineId, volume.name, 'DELETING');
  dispatch('update', volume);

  await window.removeVolume(volume.engineId, volume.name);
}

// If dropdownMenu = true, we'll change style to the imported dropdownMenu style
// otherwise, leave blank.
let MenuComponent = $derived(dropdownMenu ? DropdownMenu : FlatMenu);
</script>

{#if volume.status === 'UNUSED'}
  <ListItemButtonIcon
    title="Delete Volume"
    onClick={(): void => withConfirmation(removeVolume, `delete volume ${volume.name}`, { title: 'Delete Volume?', variant: 'delete' })}
    detailed={detailed}
    icon={faTrash} />
{/if}

<MenuComponent>
  <ContributionActions
    args={[volume]}
    contextPrefix="volumeItem"
    dropdownMenu={dropdownMenu}
    contributions={contributions}
    detailed={detailed}
    onError={(errorMessage: string): void => console.error(errorMessage)} />
</MenuComponent>
