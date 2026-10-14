<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';

import Badge from '/@/lib/ui/Badge.svelte';
import { handleNavigation } from '/@/navigation';

import type { ImageInfoUI } from './ImageInfoUI';

interface Props {
  object: ImageInfoUI;
}

let { object }: Props = $props();

function openDetails(image: ImageInfoUI): void {
  handleNavigation({
    page: image.isManifest ? NavigationPage.MANIFEST : NavigationPage.IMAGE,
    parameters: { id: image.id, engineId: image.engineId, tag: image.tag ? `${image.name}:${image.tag}` : image.name },
  });
}
</script>

<button class="flex flex-col max-w-full" onclick={(): void => openDetails(object)}>
  <div class="flex flex-row gap-1 items-center max-w-full">
    <div class="text-[var(--pd-table-body-text-highlight)] overflow-hidden text-ellipsis">
      {object.name}
      {object.isManifest ? ' (manifest)' : ''}
    </div>
    {#if object.badges.length}
      {#each object.badges as badge, index (index)}
        <Badge color={badge.color} label={badge.label} />
      {/each}
    {/if}
  </div>
  <div class="flex flex-row text-sm gap-1 w-full">
    <div class="text-[var(--pd-table-body-text-sub-secondary)]">{object.shortId}</div>
    <div class="font-extra-light text-[var(--pd-table-body-text)] overflow-hidden text-ellipsis">{object.tag}</div>
  </div>
</button>
