<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';

import { handleNavigation } from '/@/navigation';

import type { PodInfoUI } from './PodInfoUI';

interface Props {
  object: PodInfoUI;
}

let { object }: Props = $props();

function openDetailsPod(pod: PodInfoUI): void {
  handleNavigation({
    page: NavigationPage.PODMAN_POD,
    parameters: {
      name: encodeURI(pod.name),
      engineId: encodeURIComponent(pod.engineId),
    },
  });
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full text-left" onclick={(): void => openDetailsPod(object)}>
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
  <div class="flex flex-row text-sm gap-1">
    <div class="text-[var(--pd-table-body-text)]">
      {object.shortId}
    </div>
  </div>
</button>
