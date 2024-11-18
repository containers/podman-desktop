<script lang="ts">
import { get } from 'svelte/store';

import { handleNavigation } from '/@/navigation';
import { podsInfos } from '/@/stores/pods';
import { type ForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';
import { NavigationPage } from '/@api/navigation-page';

import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';

interface Props {
  object: ForwardConfig;
}

let { object }: Props = $props();

function openPodDetails(): void {
  if (object.kind !== WorkloadKind.POD)
    throw new Error(`invalid kind: expected ${WorkloadKind.POD} received ${object.kind}`);

  const pod: PodInfo | undefined = get(podsInfos)
    .filter(podInfo => podInfo.kind === 'kubernetes')
    .find(podInfo => podInfo.Name === object.name && podInfo.Namespace === object.namespace);

  if (!pod) throw new Error(`Cannot find corresponding pod for name ${object.name} in namespace ${object.namespace}`);

  return handleNavigation({
    page: NavigationPage.POD,
    parameters: {
      kind: encodeURI(pod.kind),
      name: encodeURI(pod.Name),
      engineId: encodeURIComponent(pod.engineId),
    },
  });
}

function openResourceDetails(): void {
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

<button title="Open pod details" class="hover:cursor-pointer flex flex-col max-w-full" disabled={object.kind !== WorkloadKind.POD} onclick={openResourceDetails.bind(undefined)}>
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
  <div class="flex flex-row text-sm gap-1">
    {#if object.namespace}
      <div class="font-extra-light text-[var(--pd-table-body-text)]">{object.namespace}</div>
    {/if}
  </div>
</button>
