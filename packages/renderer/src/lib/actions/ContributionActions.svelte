<script lang="ts">
import type { Menu } from '../../../../main/src/plugin/menu-registry';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { removeNonSerializableProperties } from '/@/lib/actions/ActionUtils';

export let args: unknown[];

export let dropdownMenu = false;
export let contributions: Menu[] = [];

export let onError: (errorMessage: string) => void;

async function executeContribution(menu: Menu): Promise<void> {
  try {
    await window.executeCommand(menu.command, ...removeNonSerializableProperties(args));
  } catch (err) {
    onError(`Error while executing ${menu.title}: ${String(err)}`);
  }
}
</script>

{#each contributions as menu}
  <ListItemButtonIcon
    title="{menu.title}"
    onClick="{() => executeContribution(menu)}"
    menu="{dropdownMenu}"
    icon="{faEllipsisVertical}" />
{/each}
