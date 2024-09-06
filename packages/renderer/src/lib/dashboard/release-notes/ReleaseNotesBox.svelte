<script lang="ts">
import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Button, CloseButton, Link } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import { showReleaseNotesBanner } from './release-notes-store';

let updateAvilable = false;
let currentVersion: string;
let content: HTMLElement | undefined;
let title: string = '';
let summaryTitle = '';
let summary: HTMLUListElement;
let imageUrl: string = '';
let imageAlt: string = '';

async function getImageFromNotes() {
  currentVersion = '1.11.0';
  let curVersionSplit = currentVersion.split('.', 2);
  const urlVersionFormat = curVersionSplit.join('.');
  let notesURL = `https://podman-desktop.io/blog/podman-desktop-release-${urlVersionFormat}`;
  const response = await fetch(notesURL);
  if (!response.ok) {
    notesURL = `https://github.com/containers/podman-desktop/releases/tag/v${currentVersion}`;
    title = 'Release notes are currently unavailable, please check again later.';
  } else {
    let text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    content = doc.getElementById('__blog-post-container') ?? undefined;
    if (content) {
      title = doc.getElementsByTagName('p')[0].innerText;
      summaryTitle = doc.getElementsByTagName('p')[3].innerText;
      summary = content.getElementsByTagName('ul')[0];
      if (summary) {
        document.getElementById('summary')!.innerText = `${summaryTitle}${summary.innerText}`;
        console.log(summary.innerHTML);
      }
      imageUrl = await fetch(`https://podman-desktop.io${content?.getElementsByTagName('img')[0].getAttribute('src')}`)
        .then(response => response.blob())
        .then(blob => {
          return URL.createObjectURL(blob);
        });
      imageAlt = content?.getElementsByTagName('img')[0].getAttribute('alt') ?? '';
      console.log(imageUrl);
    }
  }
}

function onclose() {
  $showReleaseNotesBanner = false;
}

onMount(async () => {
  window
    .podmanDesktopUpdateAvailable()
    .then(available => (updateAvilable = available))
    .catch(() => {
      console.log('Cannot check for update');
    });
  currentVersion = await window.getPodmanDesktopVersion();
  await getImageFromNotes();
});
</script>

{#if $showReleaseNotesBanner}
  <div
    class="flex bg-[var(--pd-content-card-bg)] rounded-md p-5 gap-3 flex-row flex-nowrap h-fit max-h-[260px] items-center">
    <img src={imageUrl} class="w-[30%] h-fit object-contain rounded-md" alt={imageAlt} />
    <div class="flex flex-col w-[70%]">
      <div class="flex flex-row items-center justify-between">
        <p class="text-[var(--pd-content-card-header-text)] font-bold text-xl m-2">
          {title}
        </p>
        <CloseButton on:click={() => onclose()} />
      </div>
      <div
        class="text-[var(--pd-content-card-text)] m-2 trunace text-ellipsis overflow-hidden whitespace-pre-line line-clamp-4">
        <div id="summary"></div>
      </div>
      <div class="flex flex-row justify-end items-center gap-3">
        <Link on:click={() => window.podmanDesktopOpenReleaseNotes('current')}>Learn more</Link>
        <Button on:click={() => window.updatePodmanDesktop()} hidden={updateAvilable} icon={faCircleArrowUp}
          >Update</Button>
      </div>
      <div class="flex justify-end items-center text-[var(--pd-content-card-light-title)] mt-2">
        v{currentVersion}
      </div>
    </div>
  </div>
{/if}
