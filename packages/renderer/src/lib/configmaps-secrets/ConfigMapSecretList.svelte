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
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import {
  configmapSearchPattern,
  kubernetesCurrentContextConfigMapsFiltered,
  kubernetesCurrentContextSecretsFiltered,
  secretSearchPattern,
} from '/@/stores/kubernetes-contexts-state';

import ConfigMapSecretIcon from '../images/ConfigMapSecretIcon.svelte';
import KubeApplyYamlButton from '../kube/KubeApplyYAMLButton.svelte';
import { ConfigMapSecretUtils } from './configmap-secret-utils';
import ConfigMapSecretColumnActions from './ConfigMapSecretColumnActions.svelte';
import ConfigMapSecretColumnName from './ConfigMapSecretColumnName.svelte';
import ConfigMapSecretColumnStatus from './ConfigMapSecretColumnStatus.svelte';
import ConfigMapSecretColumnType from './ConfigMapSecretColumnType.svelte';
import ConfigMapSecretEmptyScreen from './ConfigMapSecretEmptyScreen.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

export let searchTerm = '';
$: secretSearchPattern.set(searchTerm);
$: configmapSearchPattern.set(searchTerm);

let configmapsUI: ConfigMapSecretUI[] = [];
let secretsUI: ConfigMapSecretUI[] = [];
let configmapsSecretsUI: ConfigMapSecretUI[] = [];

const configmapSecretUtils = new ConfigMapSecretUtils();

let configmapsUnsubscribe: Unsubscriber;
let secretsUnsubscribe: Unsubscriber;
onMount(() => {
  configmapsUnsubscribe = kubernetesCurrentContextConfigMapsFiltered.subscribe(value => {
    configmapsUI = value.map(configmap => configmapSecretUtils.getConfigMapSecretUI(configmap));
    configmapsSecretsUI = [...configmapsUI, ...secretsUI];
  });

  secretsUnsubscribe = kubernetesCurrentContextSecretsFiltered.subscribe(value => {
    secretsUI = value.map(secret => configmapSecretUtils.getConfigMapSecretUI(secret));
    configmapsSecretsUI = [...configmapsUI, ...secretsUI];
  });
});

onDestroy(() => {
  // unsubscribe from the store
  configmapsUnsubscribe?.();
  secretsUnsubscribe?.();
});

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedConfigMapsSecrets() {
  const selectedConfigMapsSecrets = configmapsSecretsUI.filter(configmapsSecretsUI => configmapsSecretsUI.selected);
  if (selectedConfigMapsSecrets.length === 0) {
    return;
  }

  // mark configmap or secret for deletion
  bulkDeleteInProgress = true;
  selectedConfigMapsSecrets.forEach(configmapSecret => (configmapSecret.status = 'DELETING'));
  configmapsSecretsUI = configmapsSecretsUI;

  if (selectedConfigMapsSecrets.length > 0) {
    bulkDeleteInProgress = true;
    await Promise.all(
      selectedConfigMapsSecrets.map(async configmapSecret => {
        try {
          if (configmapSecretUtils.isSecret(configmapSecret)) {
            await window.kubernetesDeleteSecret(configmapSecret.name);
          }

          // Separate the delete logic (cannot have in else if) or else you need to infer the type of configmapSecret
          // using (configmapSecret as ConfigMapSecretUI)
          if (configmapSecretUtils.isConfigMap(configmapSecret)) {
            await window.kubernetesDeleteConfigMap(configmapSecret.name);
          }
        } catch (e) {
          console.error(
            `error while deleting ${configmapSecretUtils.isSecret(configmapSecret) ? 'secret' : 'configmap'}`,
            e,
          );
        }
      }),
    );
    bulkDeleteInProgress = false;
  }
}

let selectedItemsNumber: number;
let table: Table;

let statusColumn = new TableColumn<ConfigMapSecretUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: ConfigMapSecretColumnStatus,
  comparator: (a, b) => a.status.localeCompare(b.status),
});

let nameColumn = new TableColumn<ConfigMapSecretUI>('Name', {
  width: '1.3fr',
  renderer: ConfigMapSecretColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let namespaceColumn = new TableColumn<ConfigMapSecretUI, string>('Namespace', {
  renderMapping: configmapSecret => configmapSecret.namespace,
  renderer: TableSimpleColumn,
  comparator: (a, b) => a.namespace.localeCompare(b.namespace),
});

let ageColumn = new TableColumn<ConfigMapSecretUI, Date | undefined>('Age', {
  renderMapping: configmapSecret => configmapSecret.created,
  renderer: TableDurationColumn,
  comparator: (a, b) => moment(b.created).diff(moment(a.created)),
});

let keysColumn = new TableColumn<ConfigMapSecretUI, string>('Keys', {
  renderMapping: config => config.keys.length.toString(),
  renderer: TableSimpleColumn,
  comparator: (a, b) => a.keys.length - b.keys.length,
});

let typeColumn = new TableColumn<ConfigMapSecretUI>('Type', {
  overflow: true,
  width: '2fr',
  renderer: ConfigMapSecretColumnType,
  comparator: (a, b) => a.type.localeCompare(b.type),
});

const columns = [
  statusColumn,
  nameColumn,
  namespaceColumn,
  typeColumn,
  keysColumn,
  ageColumn,
  new TableColumn<ConfigMapSecretUI>('Actions', { align: 'right', renderer: ConfigMapSecretColumnActions }),
];

const row = new TableRow<ConfigMapSecretUI>({ selectable: _configmapSecret => true });
</script>

<NavPage bind:searchTerm="{searchTerm}" title="ConfigMaps & Secrets">
  <svelte:fragment slot="additional-actions">
    <KubeApplyYamlButton />
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click="{() => deleteSelectedConfigMapsSecrets()}"
        title="Delete {selectedItemsNumber} selected items"
        inProgress="{bulkDeleteInProgress}"
        icon="{faTrash}" />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
    <div class="flex grow justify-end">
      <KubernetesCurrentContextConnectionBadge />
    </div>
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="configmap & secret"
      bind:this="{table}"
      bind:selectedItemsNumber="{selectedItemsNumber}"
      data="{configmapsSecretsUI}"
      columns="{columns}"
      row="{row}"
      defaultSortColumn="Name"
      on:update="{() => (configmapsSecretsUI = configmapsSecretsUI)}">
    </Table>

    {#if $kubernetesCurrentContextConfigMapsFiltered.length === 0 && $kubernetesCurrentContextSecretsFiltered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon="{ConfigMapSecretIcon}" kind="configmaps or secrets" bind:searchTerm="{searchTerm}" />
      {:else}
        <ConfigMapSecretEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
