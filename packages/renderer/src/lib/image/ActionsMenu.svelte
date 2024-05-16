<script lang="ts">
import { Dropdown } from '@podman-desktop/ui-svelte';

import FlatMenu from '../ui/FlatMenu.svelte';

export let dropdownMenu = false;
export let dropdownMenuAsMenuActionItem = false;
export let onBeforeToggle = () => {};
</script>

{#if dropdownMenu}
  <Dropdown shownAsMenuActionItem="{dropdownMenuAsMenuActionItem}" onBeforeToggle="{onBeforeToggle}"><slot /></Dropdown>
{:else}
  <FlatMenu><slot /></FlatMenu>
{/if}
