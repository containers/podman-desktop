<script lang="ts">
import { router } from 'tinro';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;

function openDetailsPod(pod: PodInfoUI) {
  router.goto(`/pods/${encodeURI(pod.kind)}/${encodeURI(pod.name)}/${encodeURIComponent(pod.engineId)}/logs`);
}
</script>

<button class="hover:cursor-pointer flex flex-col" on:click="{() => openDetailsPod(object)}">
  <div class="text-sm text-gray-300">{object.name}</div>
  <div class="text-xs text-violet-400">{object.shortId}</div>
</button>
