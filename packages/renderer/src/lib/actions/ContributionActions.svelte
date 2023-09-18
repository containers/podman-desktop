<script lang="ts">
import type { Menu } from '../../../../main/src/plugin/menu-registry';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { removeNonSerializableProperties } from '/@/lib/actions/ActionUtils';

function isSerializable(value: any): boolean {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'object':
      return true;
    default:
      return false;
  }
}

function removeNonSerializableProperties<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeNonSerializableProperties(item)) as any;
  }

  const result: Partial<T> = {};

  for (const key in obj) {
    if (isSerializable(obj[key])) {
      result[key] = removeNonSerializableProperties(obj[key]);
    }
  }

  return result as T;
}

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
