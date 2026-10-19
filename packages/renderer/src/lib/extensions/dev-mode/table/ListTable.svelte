<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, Table, TableColumn, TableRow, TableSimpleColumn } from '@podman-desktop/ui-svelte';

import { withBulkConfirmation } from '/@/lib/actions/BulkActions';
import type { SelectableExtensionDevelopmentFolderInfoUI } from '/@/lib/extensions/dev-mode/development-folder-info-ui';
import DevelopmentExtensionTableActionsColumn from '/@/lib/extensions/dev-mode/table/ActionsColumn.svelte';

interface Props {
  selectedItemsNumber?: number;
  extensionFolderUIInfos: SelectableExtensionDevelopmentFolderInfoUI[];
}

let { extensionFolderUIInfos, selectedItemsNumber = $bindable(0) }: Props = $props();

const nameColumn = new TableColumn<SelectableExtensionDevelopmentFolderInfoUI, string>('Name', {
  width: '3fr',
  renderer: TableSimpleColumn,
  renderMapping: (extensionFolder): string => extensionFolder.name,
  comparator: (a, b): number => a.name.localeCompare(b.name),
});

const extensionNameColumn = new TableColumn<SelectableExtensionDevelopmentFolderInfoUI, string>('Extension', {
  width: '2fr',
  renderer: TableSimpleColumn,
  renderMapping: (extensionFolder): string => extensionFolder.extension?.name ?? 'Unknown',
  comparator: (a, b): number => a.name.localeCompare(b.name),
});
const extensionStateColumn = new TableColumn<SelectableExtensionDevelopmentFolderInfoUI, string>('State', {
  width: '2fr',
  renderer: TableSimpleColumn,
  renderMapping: (extensionFolder): string => extensionFolder.extension?.state ?? '',
  comparator: (a, b): number => a.name.localeCompare(b.name),
});
const actionsColumn = new TableColumn<SelectableExtensionDevelopmentFolderInfoUI>('Actions', {
  align: 'right',
  width: '150px',
  renderer: DevelopmentExtensionTableActionsColumn,
  overflow: true,
});

const columns = [nameColumn, extensionNameColumn, extensionStateColumn, actionsColumn];

const row = new TableRow<SelectableExtensionDevelopmentFolderInfoUI>({
  selectable: (): boolean => true,
});

function deleteSelectedFolders(): void {}
let bulkDeleteInProgress = false;

function key(extensionFolder: SelectableExtensionDevelopmentFolderInfoUI): string {
  return extensionFolder.path;
}
function label(extensionFolder: SelectableExtensionDevelopmentFolderInfoUI): string {
  return extensionFolder.name;
}
</script>

<Table
  kind="extensions"
  data={extensionFolderUIInfos}
  {columns}
  {row}
  bind:selectedItemsNumber
  defaultSortColumn="Name"
  key={key}
  label={label}>
</Table>

<div class="h-5 px-6 mb-2">
  {#if selectedItemsNumber > 0}
    <Button
      on:click={(): void =>
        withBulkConfirmation(
          deleteSelectedFolders,
          `Untrack loading extension from ${selectedItemsNumber} folder${selectedItemsNumber > 1 ? 's' : ''}`,
          { title: 'Untrack Extensions?', variant: 'delete' },
        )}
      title="Untrack {selectedItemsNumber} selected items"
      inProgress={bulkDeleteInProgress}
      icon={faTrash} />
    <span>On {selectedItemsNumber} selected items.</span>
  {:else}
    <div>&nbsp;</div>
  {/if}
</div>
