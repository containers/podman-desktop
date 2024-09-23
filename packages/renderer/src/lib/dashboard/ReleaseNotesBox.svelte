<script lang="ts">
import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Button, CloseButton, Link } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import Markdown from '../markdown/Markdown.svelte';

let showBanner = true;
let notesAvailable = true;
let updateAvilable = false;
let notesURL: string;
let currentVersion: string;
let title: string = '';
let summary: string = '';
let imageUrl: string = '';
let imageAlt: string = '';

async function getInfoFromNotes() {
  let curVersionSplit = currentVersion.split('.', 2);
  const urlVersionFormat = curVersionSplit.join('.');
  notesURL = `https://podman-desktop.io/release-notes/${urlVersionFormat}.json`;
  const response = await fetch(notesURL);
  if (!response.ok) {
    notesAvailable = false;
    notesURL = `https://github.com/containers/podman-desktop/releases/tag/v${currentVersion}`;
  } else {
    let notesInfo = await response.json();
    imageUrl = notesInfo.image ? notesInfo.image : '';
    imageAlt = imageUrl ? `Podman Desktop ${urlVersionFormat} release image` : '';
    title = notesInfo.title ? notesInfo.title : '';
    summary = notesInfo.summary ? notesInfo.summary : '';
  }
}

function onclose() {
  window.updateConfigurationValue('releaseNotesBanner.show', false);
  showBanner = false;
}

onMount(async () => {
  currentVersion = await window.getPodmanDesktopVersion();
  window.updateConfigurationValue(`releaseNotesBanner.show.${currentVersion}`, true);
  showBanner = (await window.getConfigurationValue(`releaseNotesBanner.show.${currentVersion}`)) ?? true;
  if (showBanner) {
    window
      .podmanDesktopUpdateAvailable()
      .then(available => (updateAvilable = available))
      .catch(() => {
        console.log('Cannot check for update');
      });
    await getInfoFromNotes();
  }
});
</script>

{#if showBanner}
  {#if notesAvailable}
    <div class="flex bg-[var(--pd-content-card-bg)] rounded-md p-5 gap-3 flex-row flex-nowrap h-[230px] items-center">
      {#if imageUrl}
        <img src={imageUrl} class="max-h-[190px] w-auto max-w-[20%] object-contain rounded-md" alt={imageAlt} />
      {/if}
      <div class="flex flex-col flex-1">
        <div class="flex flex-row items-center justify-between">
          <p class="text-[var(--pd-content-card-header-text)] font-bold text-xl ml-2">
            {title}
          </p>
          <CloseButton on:click={() => onclose()} />
        </div>
        <div
          class="text-[var(--pd-content-card-text)] trunace text-ellipsis overflow-hidden whitespace-pre-line line-clamp-6">
          <Markdown markdown={summary}></Markdown>
        </div>
        <div class="flex flex-row justify-end items-center gap-3 mt-2">
          <Link on:click={() => window.podmanDesktopOpenReleaseNotes('current')}>Learn more</Link>
          <Button on:click={() => window.updatePodmanDesktop()} hidden={!updateAvilable} icon={faCircleArrowUp}
            >Update</Button>
        </div>
        <div class="flex justify-end items-center text-[var(--pd-content-card-light-title)] mt-2">
          v{currentVersion}
        </div>
      </div>
    </div>
  {:else}
    <div class="flex bg-[var(--pd-content-card-bg)] rounded-md p-5 gap-3 flex-row flex-nowrap h-auto items-center">
      <div class="flex flex-row items-center justify-between w-full">
        <p class="text-[var(--pd-content-card-header-text)] font-bold text-lg ml-2 w-full items-center">
          Release notes are currently unavailable, please check again later or try this
          <a href={notesURL} class="text-[var(--pd-link)]">link</a>
        </p>
        <CloseButton on:click={() => onclose()} />
      </div>
    </div>
  {/if}
{/if}
