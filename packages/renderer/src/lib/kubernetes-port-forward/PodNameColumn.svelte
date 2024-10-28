<script lang="ts">
import { handleNavigation } from '/@/navigation';
import { podsInfos } from '/@/stores/pods';
import { NavigationPage } from '/@api/navigation-page';

import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';

interface Props {
  object: { name: string; namespace: string };
}

let { object }: Props = $props();

let pod: PodInfo | undefined = $derived(
  $podsInfos
    .filter(podInfo => podInfo.kind === 'kubernetes')
    .find(podInfo => podInfo.Name === object.name && podInfo.Namespace === object.namespace),
);

async function openPodDetails(): Promise<void> {
  if (!pod) return;

  return handleNavigation({
    page: NavigationPage.POD,
    parameters: {
      kind: encodeURI(pod.kind),
      name: encodeURI(pod.Name),
      engineId: encodeURIComponent(pod.engineId),
    },
  });
}
</script>

<button title="Open pod details" class="hover:cursor-pointer flex flex-col max-w-full" onclick={openPodDetails.bind(undefined)}>
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
</button>
