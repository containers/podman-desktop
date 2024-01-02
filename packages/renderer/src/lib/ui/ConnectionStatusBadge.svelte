<script lang="ts">
import { kubernetesConnection } from '../../stores/kubernetes-connection';
import { onMount } from 'svelte';
import type { KubernetesConnection } from '../../../../main/src/plugin/kubernetes-connection';
import Badge from '/@/lib/ui/Badge.svelte';

let connection: KubernetesConnection | undefined = undefined;

onMount(() => {
  return kubernetesConnection.subscribe(value => {
    connection = value;
  });
});

function getConnectionBadgeColor(status: string | undefined) {
  if (status === undefined || status === 'error') return 'bg-gray-900';

  return 'bg-green-600';
}
</script>

<Badge
  text="{connection?.status || 'unknown'}"
  classColor="{getConnectionBadgeColor(connection?.status)}"
  tooltip="{connection?.error}" />
