<script lang="ts">
import { handleNavigation } from '/@/navigation';

import { NavigationPage } from '../../../../main/src/plugin/navigation/navigation-page';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;

function openDetailsPod(pod: PodInfoUI) {
  handleNavigation(NavigationPage.POD, {
    kind: encodeURI(pod.kind),
    name: encodeURI(pod.name),
    engineId: encodeURIComponent(pod.engineId),
  });
}
</script>

<button class="hover:cursor-pointer flex flex-col" on:click="{() => openDetailsPod(object)}">
  <div class="text-sm text-gray-300">{object.name}</div>
  <div class="text-xs text-violet-400">{object.shortId}</div>
</button>
