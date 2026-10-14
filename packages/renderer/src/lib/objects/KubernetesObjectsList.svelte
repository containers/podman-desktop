<script lang="ts">
import type { IDisposable } from '@desktop-framework/api';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { KubernetesObject } from '@kubernetes/client-node';
import type { TableColumn, TableRow } from '@podman-desktop/ui-svelte';
import { Button, FilteredEmptyScreen, NavPage, Table } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount, type Snippet } from 'svelte';
import { type Readable, type Unsubscriber, type Writable } from 'svelte/store';

import { withBulkConfirmation } from '/@/lib/actions/BulkActions';
import KubeActions from '/@/lib/kube/KubeActions.svelte';
import NamespaceDropdown from '/@/lib/kube/NamespaceDropdown.svelte';
import { listenResources } from '/@/lib/kube/resources-listen';
import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';

import type { KubernetesObjectUI } from './KubernetesObjectUI';

export interface Kind {
  resource: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformer: (o: KubernetesObject) => KubernetesObjectUI;
  delete: (name: string) => Promise<void>;
  isResource: (o: KubernetesObject) => boolean;
  legacySearchPatternStore: Writable<string>;
  legacyObjectStore: Readable<KubernetesObject[]>;
}

interface Props {
  kinds: Kind[];
  searchTerm: string;
  singular: string;
  plural: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: TableColumn<any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: TableRow<any>;

  emptySnippet: Snippet;
}

let started = $state<boolean>(false);

let { kinds, singular, plural, icon, searchTerm, columns, row, emptySnippet }: Props = $props();

let resources = $state<{ [key: string]: KubernetesObject[] | undefined }>({});
let resourceListeners: (IDisposable | undefined)[] = [];
let legacyUnsubscribers: Unsubscriber[] = [];

const objects = $derived(
  kinds.flatMap(kind => resources[kind.resource]?.map(object => kind.transformer(object)) ?? []),
);

$effect(() => {
  kinds.forEach(kind => kind.legacySearchPatternStore.set(searchTerm));
});

onMount(async () => {
  for (let kind of kinds) {
    resourceListeners.push(
      await listenResources(
        kind.resource,
        {
          searchTermStore: kind.legacySearchPatternStore,
        },
        (updatedResources: KubernetesObject[]) => {
          started = true;
          resources[kind.resource] = updatedResources;
        },
      ),
    );

    legacyUnsubscribers.push(
      kind.legacyObjectStore.subscribe(o => {
        if (o === undefined) {
          return;
        }
        started = true;
        resources[kind.resource] = o;
      }),
    );
  }
});

onDestroy(() => {
  for (let resourceListener of resourceListeners) {
    resourceListener?.dispose();
  }
  for (let legacyUnsubscriber of legacyUnsubscribers) {
    legacyUnsubscriber?.();
  }
});

// delete the items selected in the list
let bulkDeleteInProgress = $state<boolean>(false);
async function deleteSelectedObjects(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedObjects = objects.filter((object: any) => object?.selected);
  if (selectedObjects.length === 0) {
    return;
  }

  // mark objects for deletion
  bulkDeleteInProgress = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedObjects.forEach((image: any) => (image.status = 'DELETING'));

  await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedObjects.map(async (object: any) => {
      try {
        await kinds.find(kind => kind.isResource(object))?.delete(object.name);
      } catch (e) {
        console.error(`error while deleting ${singular}`, e);
      }
    }),
  );
  bulkDeleteInProgress = false;
}

let selectedItemsNumber = $state<number>(0);
</script>

<NavPage bind:searchTerm={searchTerm} title={plural}>
  {#snippet additionalActions()}
    <KubeActions />
  {/snippet}

  {#snippet bottomAdditionalActions()}
    {#if kinds[0].resource !== 'nodes'}
      <NamespaceDropdown/>
    {/if}
    {#if selectedItemsNumber > 0}
      <Button
        on:click={(): void =>
          withBulkConfirmation(
            deleteSelectedObjects,
            `delete ${selectedItemsNumber} ${selectedItemsNumber > 1 ? plural : singular}`,
            { title: `Delete ${plural.charAt(0).toUpperCase() + plural.slice(1)}?`, variant:'delete' }
          )}
        title="Delete {selectedItemsNumber} selected items"
        inProgress={bulkDeleteInProgress}
        icon={faTrash} />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
    <div class="flex grow justify-end">
      <KubernetesCurrentContextConnectionBadge />
    </div>
  {/snippet}

  {#snippet content()}
  <div class="flex min-w-full grow">
    <Table
      kind={singular}
      bind:selectedItemsNumber={selectedItemsNumber}
      data={objects}
      columns={columns}
      row={row}
      defaultSortColumn="Name">
    </Table>

    {#if started && objects.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen
          icon={icon}
          kind={plural}
          searchTerm={searchTerm}
          on:resetFilter={(): string => (searchTerm = '')} />
      {:else}
        {@render emptySnippet()}
      {/if}
    {/if}
  </div>
  {/snippet}
</NavPage>
