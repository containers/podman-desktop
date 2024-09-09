<script lang="ts">
import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Button, CloseButton, Link } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import Markdown from '../../markdown/Markdown.svelte';
import { showReleaseNotesBanner } from './release-notes-store';

/* eslint-disable sonarjs/single-char-in-character-classes */
/* eslint-disable no-useless-escape */

let updateAvilable = false;
let currentVersion: string;
let title: string = '';
let summary: RegExpMatchArray | null;
let imageUrl: string = '';
let imageAlt: string = '';
let text: string = '';

async function getInfoFromNotes() {
  currentVersion = '1.11.0';
  let curVersionSplit = currentVersion.split('.', 2);
  const urlVersionFormat = curVersionSplit.join('.');
  // using GitHub raw md release notes file - will change when https://github.com/containers/podman-desktop/pull/8790/files is merged
  let tempUrl =
    'https://raw.githubusercontent.com/containers/podman-desktop/main/website/blog/2024-06-24-release-1.11.md';
  let result = await fetch(tempUrl);
  if (result.ok) {
    let resultText = (await result.text()).split('---', 3);
    let imagePath = resultText[1].match(/image: (.+)\n/);
    let imageName = imagePath ? imagePath[1].split('/').at(-1) : 'banner.png';
    imageUrl = `https://raw.githubusercontent.com/containers/podman-desktop/main/website/blog/img/podman-desktop-release-${urlVersionFormat}/${imageName}`;
    // uses regex to grab only the first part of the md file, remove the import ReactPlayer statement,
    text = resultText[2]
      .split('<!--truncate-->', 1)[0]
      .replace("import ReactPlayer from 'react-player'\n", '')
      .replace(/!\[.+\)\n/, '')
      .replace(/\[Click here to download it\]\(.+\)!/, '')
      .replace(/\n[\n]+/g, '\n');
    summary = text.match(/\-.+\n/g);
    title = text.replace(/\-.+\n/g, '');
    console.log(title);
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
  await getInfoFromNotes();
});
</script>

{#if $showReleaseNotesBanner}
  <div
    class="flex bg-[var(--pd-content-card-bg)] rounded-md p-5 gap-3 flex-row flex-nowrap h-fit max-h-[760px] items-center">
    <img src={imageUrl} class="w-[30%] h-fit object-contain rounded-md" alt={imageAlt} />
    <div class="flex flex-col w-[70%]">
      <div class="flex flex-row items-center justify-between">
        <p class="text-[var(--pd-content-card-header-text)] font-bold text-xl m-2">
          <Markdown markdown={title.split('\n')[1]}></Markdown>
        </p>
        <CloseButton on:click={() => onclose()} class="self-start" />
      </div>
      {#if summary}
        <div class="text-[var(--pd-content-card-text)] m-2 trunace text-ellipsis overflow-hidden whitespace-pre-line">
          <Markdown markdown={summary.toString().replace(/\n\,/g, '\n')}></Markdown>
        </div>
      {/if}
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
