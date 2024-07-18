<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FilteredEmptyScreen,
  NavPage,
  Table,
  TableColumn,
  TableDurationColumn,
  TableRow,
  TableSimpleColumn,
} from '@podman-desktop/ui-svelte';
import moment from 'moment';
import { onMount } from 'svelte';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import {
  kubernetesCurrentContextPersistentVolumeClaimsFiltered,
  persistentVolumeClaimSearchPattern,
} from '/@/stores/kubernetes-contexts-state';

import { withBulkConfirmation } from '../actions/BulkActions';
import PVCIcon from '../images/PVCIcon.svelte';
import KubeApplyYamlButton from '../kube/KubeApplyYAMLButton.svelte';
import { PVCUtils } from './pvc-utils';
import PVCColumnActions from './PVCColumnActions.svelte';
import PvcColumnMode from './PVCColumnMode.svelte';
import PVCColumnName from './PVCColumnName.svelte';
import PVCColumnStatus from './PVCColumnStatus.svelte';
import PVCEmptyScreen from './PVCEmptyScreen.svelte';
import type { PVCUI } from './PVCUI';

export let searchTerm = '';
$: persistentVolumeClaimSearchPattern.set(searchTerm);

let pvcs: PVCUI[] = [];

const pvcUtils = new PVCUtils();

onMount(() => {
  return kubernetesCurrentContextPersistentVolumeClaimsFiltered.subscribe(value => {
    pvcs = value.map(pvc => pvcUtils.getPVCUI(pvc));
  });
});

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedPVCs() {
  const selectedPVCs = pvcs.filter(pvc => pvc.selected);
  if (selectedPVCs.length === 0) {
    return;
  }

  // mark pvcs for deletion
  bulkDeleteInProgress = true;
  selectedPVCs.forEach(pvc => (pvc.status = 'DELETING'));
  pvcs = pvcs;

  await Promise.all(
    selectedPVCs.map(async pvc => {
      try {
        await window.kubernetesDeletePersistentVolumeClaim(pvc.name);
      } catch (e) {
        console.error('error while deleting pvc', e);
      }
    }),
  );
  bulkDeleteInProgress = false;
}

let selectedItemsNumber: number;
let table: Table;

let statusColumn = new TableColumn<PVCUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: PVCColumnStatus,
  comparator: (a, b) => a.status.localeCompare(b.status),
});

let nameColumn = new TableColumn<PVCUI>('Name', {
  renderer: PVCColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let storageClassColumn = new TableColumn<PVCUI, string>('Storage', {
  renderMapping: pvc => pvc.storageClass,
  renderer: TableSimpleColumn,
  comparator: (a, b) => a.storageClass.localeCompare(b.storageClass),
});

let accessModesColumn = new TableColumn<PVCUI>('Mode', {
  renderer: PvcColumnMode,
  overflow: true,
  comparator: (a, b) => a.accessModes.join().localeCompare(b.accessModes.join()),
});

let sizeColumn = new TableColumn<PVCUI, string>('Size', {
  renderMapping: pvc => pvc.size,
  renderer: TableSimpleColumn,
  comparator: (a, b) => a.size.localeCompare(b.size),
});

let ageColumn = new TableColumn<PVCUI, Date | undefined>('Age', {
  renderMapping: pvc => pvc.created,
  renderer: TableDurationColumn,
  comparator: (a, b) => moment(b.created).diff(moment(a.created)),
});

const columns = [
  statusColumn,
  nameColumn,
  accessModesColumn,
  storageClassColumn,
  sizeColumn,
  ageColumn,
  new TableColumn<PVCUI>('Actions', { align: 'right', renderer: PVCColumnActions }),
];

const row = new TableRow<PVCUI>({ selectable: _pvc => true });
</script>

<NavPage bind:searchTerm={searchTerm} title="persistent volume claims">
  <svelte:fragment slot="additional-actions">
    <KubeApplyYamlButton />
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click={() =>
          withBulkConfirmation(
            deleteSelectedPVCs,
            `delete ${selectedItemsNumber} PVC${selectedItemsNumber > 1 ? 's' : ''}`,
          )}
        title="Delete {selectedItemsNumber} selected items"
        inProgress={bulkDeleteInProgress}
        icon={faTrash} />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
    <div class="flex grow justify-end">
      <KubernetesCurrentContextConnectionBadge />
    </div>
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="PVC"
      bind:this={table}
      bind:selectedItemsNumber={selectedItemsNumber}
      data={pvcs}
      columns={columns}
      row={row}
      defaultSortColumn="Name"
      on:update={() => (pvcs = pvcs)}>
    </Table>

    {#if $kubernetesCurrentContextPersistentVolumeClaimsFiltered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon={PVCIcon} kind="pvcs" bind:searchTerm={searchTerm} />
      {:else}
        <PVCEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
