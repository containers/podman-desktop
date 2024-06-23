<script lang="ts">
import { handleNavigation } from '/@/navigation';

import { NavigationPage } from '../../../../main/src/plugin/navigation/navigation-page';
import { PodUtils } from './pod-utils';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;

const podUtils = new PodUtils();

function openDetailsPod(pod: PodInfoUI) {
  handleNavigation(NavigationPage.POD, {
    kind: encodeURI(pod.kind),
    name: encodeURI(pod.name),
    engineId: encodeURIComponent(pod.engineId),
  });
}
</script>

<button class="hover:cursor-pointer flex flex-col max-w-full" on:click="{() => openDetailsPod(object)}">
  <div class="text-sm text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis">
    {object.name}
  </div>
  <div class="flex flex-row text-xs gap-1">
    {#if podUtils.isKubernetesPod(object)}
      {#if object.node}
        <div class="text-xs text-[var(--pd-table-body-text-sub-secondary)]">
          {object.node}
        </div>
      {/if}
      <div class="font-extra-light text-[var(--pd-table-body-text-sub-highlight)]">{object.namespace}</div>
    {:else}
      <div class="text-xs text-[var(--pd-table-body-text-sub-secondary)]">
        {object.shortId}
      </div>
    {/if}
  </div>
</button>
