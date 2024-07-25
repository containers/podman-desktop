<script lang="ts">
import { router } from 'tinro';

import Badge from '../ui/Badge.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let object: ImageInfoUI;

function openDetails(image: ImageInfoUI) {
  if (image.isManifest) {
    router.goto(`/manifests/${image.id}/${image.engineId}/${image.base64RepoTag}/summary`);
  } else {
    router.goto(`/images/${image.id}/${image.engineId}/${image.base64RepoTag}/summary`);
  }
}
</script>

<button class="flex flex-col max-w-full" on:click={() => openDetails(object)}>
  <div class="flex flex-row gap-1 items-center max-w-full">
    <div class="text-[var(--pd-table-body-text-highlight)] overflow-hidden text-ellipsis">
      {object.name}
      {object.isManifest ? ' (manifest)' : ''}
    </div>
    {#if object.badges.length}
      {#each object.badges as badge}
        <Badge color={badge.color} label={badge.label} />
      {/each}
    {/if}
  </div>
  <div class="flex flex-row text-sm gap-1 w-full">
    <div class="text-[var(--pd-table-body-text-sub-secondary)]">{object.shortId}</div>
    <div class="font-extra-light text-[var(--pd-table-body-text)] overflow-hidden text-ellipsis">{object.tag}</div>
  </div>
</button>
