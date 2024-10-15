<script lang="ts">
import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Button, CloseButton, Link } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';

import type { ReleaseNotes } from '/@api/release-notes-info';

import Markdown from '../markdown/Markdown.svelte';

let showBanner = false;
let notesAvailable = false;
let updateAvailable = false;
let notesURL: string;
let currentVersion: string;
let notesInfo: ReleaseNotes | undefined;
const receiveShowReleaseNotes = window.events?.receive('show-release-notes', () => {
  showBanner = true;
});

function openReleaseNotes() {
  window.openExternal(notesURL);
}

function updatePodmanDesktop() {
  window.updatePodmanDesktop();
}

async function getInfoFromNotes() {
  const releaseNotes = await window.podmanDesktopGetReleaseNotes();
  notesInfo = releaseNotes.notes;
  notesAvailable = notesInfo !== undefined;
  notesURL = releaseNotes.notesURL;
}

async function onClose() {
  await window.updateConfigurationValue(`releaseNotesBanner.show`, currentVersion);
  showBanner = false;
}

onMount(async () => {
  currentVersion = await window.getPodmanDesktopVersion();
  showBanner = (await window.getConfigurationValue(`releaseNotesBanner.show`)) !== currentVersion ? true : false;
  try {
    updateAvailable = await window.podmanDesktopUpdateAvailable();
  } catch (e) {
    console.log('Cannot check for update');
  }
  await getInfoFromNotes();
});

onDestroy(async () => {
  receiveShowReleaseNotes.dispose();
});
</script>

{#if showBanner}
  {#if notesAvailable}
    <div class="flex bg-[var(--pd-content-card-bg)] rounded-md p-5 gap-3 flex-row flex-nowrap h-[200px] items-center">
      {#if notesInfo?.image}
        <img
          src={notesInfo.image}
          class="max-h-[100%] w-auto max-w-[20%] object-contain rounded-md self-start"
          alt={`Podman Desktop ${currentVersion} release image`} />
      {/if}
      <div class="flex flex-col flex-1 h-100% self-start">
        <div class="flex flex-row items-center justify-between">
          <p class="text-[var(--pd-content-card-header-text)] font-bold text-xl ml-2">
            {notesInfo?.title ?? ''}
          </p>
          <CloseButton on:click={onClose} />
        </div>
        {#if notesInfo?.summary}
          <div
            class="text-[var(--pd-content-card-text)] truncate text-ellipsis overflow-hidden whitespace-pre-line line-clamp-6">
            <Markdown markdown={notesInfo?.summary}></Markdown>
          </div>
        {/if}
        <div class="flex flex-row justify-end items-center gap-3 mt-2">
          <Link on:click={openReleaseNotes}>Learn more</Link>
          <Button on:click={updatePodmanDesktop} hidden={!updateAvailable} icon={faCircleArrowUp}>Update</Button>
        </div>
      </div>
    </div>
  {:else if notesURL}
    <div class="flex bg-[var(--pd-content-card-bg)] rounded-md p-5 flex-col flex-nowrap h-auto items-center">
      <div class="flex flex-row items-center justify-between w-full">
        <p class="text-[var(--pd-content-card-header-text)] font-bold text-lg w-full items-center">
          Release notes are currently unavailable, please check again later
          {#if notesURL}
            or try this <Link on:click={openReleaseNotes}>link</Link>
          {/if}
        </p>
        <CloseButton on:click={onClose} />
      </div>
    </div>
  {/if}
{/if}
