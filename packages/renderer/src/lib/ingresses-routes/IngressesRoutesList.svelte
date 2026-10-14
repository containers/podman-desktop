<script lang="ts">
import type { V1Route } from '@desktop-framework/api';
import { type KubernetesObject } from '@kubernetes/client-node';
import { TableColumn, TableDurationColumn, TableRow } from '@podman-desktop/ui-svelte';
import moment from 'moment';

import IngressRouteIcon from '/@/lib/images/IngressRouteIcon.svelte';
import NameColumn from '/@/lib/kube/column/Name.svelte';
import StatusColumn from '/@/lib/kube/column/Status.svelte';
import KubernetesObjectsList from '/@/lib/objects/KubernetesObjectsList.svelte';
import {
  ingressSearchPattern,
  kubernetesCurrentContextIngressesFiltered,
  kubernetesCurrentContextRoutesFiltered,
  routeSearchPattern,
} from '/@/stores/kubernetes-contexts-state';

import ActionsColumn from './columns/Actions.svelte';
import BackendColumn from './columns/Backend.svelte';
import HostPathColumn from './columns/HostPath.svelte';
import { IngressRouteUtils } from './ingress-route-utils';
import IngressRouteEmptyScreen from './IngressRouteEmptyScreen.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

interface Props {
  searchTerm?: string;
}

let { searchTerm = '' }: Props = $props();

$effect(() => {
  routeSearchPattern.set(searchTerm);
  ingressSearchPattern.set(searchTerm);
});

const ingressRouteUtils = new IngressRouteUtils();

let statusColumn = new TableColumn<IngressUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: StatusColumn,
  comparator: (a, b): number => a.status.localeCompare(b.status),
});

let nameColumn = new TableColumn<IngressUI | RouteUI>('Name', {
  renderer: NameColumn,
  comparator: (a, b): number => a.name.localeCompare(b.name),
});

let pathColumn = new TableColumn<IngressUI | RouteUI>('Host/Path', {
  width: '1.5fr',
  renderer: HostPathColumn,
  comparator: (a, b): number => compareHostPath(a, b),
});

let ageColumn = new TableColumn<IngressUI | RouteUI, Date | undefined>('Age', {
  renderMapping: (ingressRoute): Date | undefined => ingressRoute.created,
  renderer: TableDurationColumn,
  comparator: (a, b): number => moment(b.created).diff(moment(a.created)),
});

function compareHostPath(object1: IngressUI | RouteUI, object2: IngressUI | RouteUI): number {
  const hostPathObject1 = ingressRouteUtils.getHostPaths(object1)[0] ?? '';
  const hostPathObject2 = ingressRouteUtils.getHostPaths(object2)[0] ?? '';
  return hostPathObject1.label.localeCompare(hostPathObject2.label);
}

let backendColumn = new TableColumn<IngressUI | RouteUI>('Backend', {
  width: '1.5fr',
  renderer: BackendColumn,
  comparator: (a, b): number => compareBackend(a, b),
});

function compareBackend(object1: IngressUI | RouteUI, object2: IngressUI | RouteUI): number {
  const backendObject1 = ingressRouteUtils.getBackends(object1)[0] ?? '';
  const backendObject2 = ingressRouteUtils.getBackends(object2)[0] ?? '';
  return backendObject1.localeCompare(backendObject2);
}

const columns = [
  statusColumn,
  nameColumn,
  pathColumn,
  backendColumn,
  ageColumn,
  new TableColumn<IngressUI | RouteUI>('Actions', { align: 'right', renderer: ActionsColumn }),
];

const row = new TableRow<IngressUI | RouteUI>({ selectable: (_ingressRoute): boolean => true });
</script>


<KubernetesObjectsList
  kinds={[
    {
      resource: 'ingresses',
      transformer: ingressRouteUtils.getIngressUI,
      delete: window.kubernetesDeleteIngress,
      isResource: (o: KubernetesObject): boolean => ingressRouteUtils.isIngress(o as IngressUI | RouteUI),
      legacySearchPatternStore: ingressSearchPattern,
      legacyObjectStore: kubernetesCurrentContextIngressesFiltered,
    },
    {
      resource: 'routes',
      transformer: (o: KubernetesObject): RouteUI => ingressRouteUtils.getRouteUI(o as V1Route),
      delete: window.kubernetesDeleteRoute,
      isResource: (): boolean => true,
      legacySearchPatternStore: routeSearchPattern,
      legacyObjectStore: kubernetesCurrentContextRoutesFiltered,
    },
  ]}
  singular="ingress and route"
  plural="ingresses and routes"
  icon={IngressRouteIcon}
  searchTerm={searchTerm}
  columns={columns}
  row={row}
>
  <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
  {#snippet emptySnippet()}
    <IngressRouteEmptyScreen />
  {/snippet}
</KubernetesObjectsList>
