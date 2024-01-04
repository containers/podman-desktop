<script lang="ts">
import DropdownMenu from '../ui/DropdownMenu.svelte';
import FlatMenu from '../ui/FlatMenu.svelte';

export let dropdownMenu = false;
export let dropdownMenuAsMenuActionItem = false;
export let onBeforeToggle = () => {};
</script>

{#if dropdownMenu}
  <DropdownMenu shownAsMenuActionItem="{dropdownMenuAsMenuActionItem}" onBeforeToggle="{onBeforeToggle}"
    ><slot /></DropdownMenu>
{:else}
  <FlatMenu><slot /></FlatMenu>
{/if}
