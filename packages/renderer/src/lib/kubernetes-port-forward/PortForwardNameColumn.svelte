<script lang="ts">
import { type ForwardConfig, WorkloadKind } from '@desktop-framework/api';
import type { KubernetesObject } from '@kubernetes/client-node';
import { get } from 'svelte/store';

import { kubernetesCurrentContextPods } from '/@/stores/kubernetes-contexts-state';

interface Props {
  object: ForwardConfig;
}

let { object }: Props = $props();

async function openPodDetails(): Promise<void> {
  if (object.kind !== WorkloadKind.POD)
    throw new Error(`invalid kind: expected ${WorkloadKind.POD} received ${object.kind}`);

  const pod: KubernetesObject | undefined = get(kubernetesCurrentContextPods).find(
    pod => pod.metadata?.name === object.name && pod.metadata?.namespace === object.namespace,
  );

  if (!pod) throw new Error(`Cannot find corresponding pod for name ${object.name} in namespace ${object.namespace}`);

  await window.navigateToRoute('kubernetes', { kind: 'Pod', name: object.name, namespace: object.namespace });
}

async function openResourceDetails(): Promise<void> {
  switch (object.kind) {
    case WorkloadKind.POD:
      return openPodDetails();
    case WorkloadKind.DEPLOYMENT:
      break;
    case WorkloadKind.SERVICE:
      break;
  }
}
</script>

<button title="Open pod details" class="hover:cursor-pointer flex flex-col max-w-full" disabled={object.kind !== WorkloadKind.POD} onclick={openResourceDetails}>
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
  <div class="flex flex-row text-sm gap-1">
    {#if object.namespace}
      <div class="font-extra-light text-[var(--pd-table-body-text)]">{object.namespace}</div>
    {/if}
  </div>
</button>
