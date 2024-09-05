<script lang="ts">
import { Button, Link } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import IconImage from '../../appearance/IconImage.svelte';
import releaseImage from './banner.png';
import { default as releaseNotesJson } from './release-notes.json';

const latestReleaseNotes = releaseNotesJson.notes[0];
let updateAvilable = false;
console.log(latestReleaseNotes.summary);

onMount(async () => {
  window
    .PodmanDesktopUpdateAvailable()
    .then(available => (updateAvilable = available))
    .catch(() => {
      console.log('Cannot check for update');
    });
});
</script>

<div class="flex bg-[var(--pd-content-card-bg)] rounded-md p-5 gap-3 flex-row flex-nowrap h-fit max-h-[245px]">
  <IconImage image={releaseImage} class="w-[30%] object-contain" alt={latestReleaseNotes.alt} />
  <div class="flex flex-col w-[70%]">
    <p class="text-[var(--pd-content-card-header-text)] font-bold text-xl m-2">
      {latestReleaseNotes.title}
    </p>
    <p
      class="text-[var(--pd-content-card-text)] m-2 trunace text-ellipsis overflow-hidden whitespace-pre-line line-clamp-6">
      {latestReleaseNotes.summary}
    </p>
    <div class="flex flex-row justify-end items-center gap-3">
      <Link on:click={() => window.openExternal(latestReleaseNotes.websiteURL)}>Learn more</Link>
      <Button on:click={() => window.updatePodmanDesktop()} hidden={!updateAvilable}>Update</Button>
    </div>
  </div>
</div>
