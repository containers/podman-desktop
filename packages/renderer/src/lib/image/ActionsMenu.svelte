<script lang="ts">
import { DropdownMenu } from '@podman-desktop/ui-svelte';

import FlatMenu from '../ui/FlatMenu.svelte';

export let dropdownMenu = false;
export let dropdownMenuAsMenuActionItem = false;
export let onBeforeToggle = () => {};
</script>

{#if dropdownMenu}
  <DropdownMenu shownAsMenuActionItem={dropdownMenuAsMenuActionItem} onBeforeToggle={onBeforeToggle}
    ><slot /></DropdownMenu>
{:else}
  <FlatMenu><slot /></FlatMenu>
{/if}
