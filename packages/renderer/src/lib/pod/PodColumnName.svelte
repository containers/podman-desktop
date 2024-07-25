<script lang="ts">
import { handleNavigation } from '/@/navigation';
import { NavigationPage } from '/@api/navigation-page';

import { PodUtils } from './pod-utils';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;

const podUtils = new PodUtils();

function openDetailsPod(pod: PodInfoUI) {
  handleNavigation({
    page: NavigationPage.POD,
    parameters: {
      kind: encodeURI(pod.kind),
      name: encodeURI(pod.name),
      engineId: encodeURIComponent(pod.engineId),
    },
  });
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click={() => openDetailsPod(object)}>
  <div class="text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
  <div class="flex flex-row text-sm gap-1">
    {#if podUtils.isKubernetesPod(object)}
      {#if object.node}
        <div class="text-[var(--pd-table-body-text-sub-secondary)]">
          {object.node}
        </div>
      {/if}
      <div class="font-extra-light text-[var(--pd-table-body-text)]">{object.namespace}</div>
    {:else}
      <div class="text-[var(--pd-table-body-text)]">
        {object.shortId}
      </div>
    {/if}
  </div>
</button>
