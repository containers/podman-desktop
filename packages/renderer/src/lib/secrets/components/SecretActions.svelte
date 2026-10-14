<script lang="ts">
import type { Menu, SecretInfo } from '@desktop-framework/api';
import { MenuContext } from '@desktop-framework/api';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu } from '@podman-desktop/ui-svelte';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import FlatMenu from '/@/lib/ui/FlatMenu.svelte';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';

interface Props {
  object: SecretInfo;
  dropdownMenu?: boolean;
  detailed?: boolean;
}

let { object, dropdownMenu = true, detailed = false }: Props = $props();

let loading: boolean = $state(false);
let contributions: Promise<Menu[]> = $derived(window.getContributedMenus(MenuContext.DASHBOARD_SECRET));

const MenuComponent = $derived(dropdownMenu ? DropdownMenu : FlatMenu);

function onDeleteSecret(): void {
  withConfirmation(
    async () => {
      try {
        loading = true;
        await window.removeSecret(object.engineId, object.Id);
      } finally {
        loading = false;
      }
    },
    `delete secret ${object.Name}`,
    { title: 'Delete Secret?', variant: 'delete' },
  );
}
</script>

<ListItemButtonIcon
  title="Delete Secret"
  onClick={onDeleteSecret}
  icon={faTrash}
  inProgress={loading}
  detailed={detailed}
  enabled={true} />

{#await contributions then menus}
  {#if menus.length > 0}
    <MenuComponent>
      <ContributionActions
        args={[object]}
        contextPrefix="secretItem"
        dropdownMenu={dropdownMenu}
        contributions={menus}
        detailed={detailed}
        onError={(errorMessage: string): void => console.error(errorMessage)} />
    </MenuComponent>
  {/if}
{/await}
