<script lang="ts">
import { faCheckCircle, faCircleArrowUp, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Button, Link } from '@podman-desktop/ui-svelte';
import type { Terminal } from '@xterm/xterm';
import { onMount, tick } from 'svelte';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import Dialog from '../dialogs/Dialog.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let closeCallback: () => void;
export let imageInfoToPush: ImageInfoUI;

let pushInProgress = false;
let pushFinished = false;
let initTerminal = false;
let logsPush: Terminal;

let selectedImageTag = '';
let imageTags: string[] = [];
onMount(async () => {
  const inspectInfo = await window.getImageInspect(imageInfoToPush.engineId, imageInfoToPush.id);

  imageTags = inspectInfo.RepoTags;
  if (imageTags.length > 0) {
    selectedImageTag = imageTags[0];
  }
});

async function pushImage(imageTag: string) {
  gotErrorDuringPush = false;
  initTerminal = true;
  await tick();
  window.dispatchEvent(new Event('resize'));
  logsPush?.reset();

  pushInProgress = true;

  await window.pushImage(imageInfoToPush.engineId, imageTag, callback);
}

let gotErrorDuringPush = false;

async function pushImageFinished() {
  closeCallback();
  router.goto('/images');
}
function callback(name: string, data: string) {
  if (name === 'first-message') {
    // clear on the first message
    logsPush?.clear();
  } else if (name === 'data') {
    // parse JSON message
    const jsonObject = JSON.parse(data);
    if (jsonObject.status) {
      logsPush?.write(jsonObject.status + '\n\r');
    }
  } else if (name === 'error') {
    gotErrorDuringPush = true;
    logsPush?.write(data + '\n\r');
  } else if (name === 'end') {
    if (!gotErrorDuringPush) {
      pushFinished = true;
    }
    pushInProgress = false;
  }
}

let isAuthenticatedForThisImage = false;
$: window
  .hasAuthconfigForImage(imageInfoToPush.name)
  .then(result => (isAuthenticatedForThisImage = result))
  .catch((err: unknown) => console.error(`Error getting authentication required for image ${imageInfoToPush.id}`, err));
</script>

<Dialog
  title="Push image"
  on:close={() => {
    closeCallback();
  }}>
  <div slot="content" class="flex flex-col text-sm leading-5 space-y-5">
    <div class="pb-4">
      <label for="modalImageTag" class="block mb-2 text-sm font-medium text-[var(--pd-modal-text)]">Image tag</label>
      {#if isAuthenticatedForThisImage}
        <Fa class="absolute mt-3 ml-1.5 text-[var(--pd-state-success)]" size="1x" icon={faCheckCircle} />
      {:else}
        <Fa class="absolute mt-3 ml-1.5 text-[var(--pd-state-warning)]" size="1x" icon={faTriangleExclamation} />
      {/if}

      <select
        class="text-sm rounded-lg block w-full p-2.5 bg-[var(--pd-dropdown-bg)] pl-6 border-r-8 border-transparent outline-1 outline {isAuthenticatedForThisImage
          ? 'outline-[var(--pd-modal-border)]'
          : 'outline-[var(--pd-state-warning)]'} placeholder-[var(--pd-content-text)] text-[var(--pd-default-text)]"
        name="imageChoice"
        bind:value={selectedImageTag}>
        {#each imageTags as imageTag}
          <option value={imageTag}>{imageTag}</option>
        {/each}
      </select>
      <!-- If the image is UNAUTHENTICATED, show a warning that the image is unable to be pushed
      and to click to go to the registries page -->
      {#if !isAuthenticatedForThisImage}
        <p class="text-[var(--pd-state-warning)] pt-1">
          No registry with push permissions found. <Link on:click={() => router.goto('/preferences/registries')}
            >Add a registry now.</Link>
        </p>{/if}
    </div>

    <div class="h-[185px]" hidden={initTerminal === false}>
      <TerminalWindow class="h-full" bind:terminal={logsPush} disableStdIn />
    </div>
  </div>

  <svelte:fragment slot="buttons">
    {#if !pushInProgress && !pushFinished}
      <Button class="w-auto" type="secondary" on:click={() => closeCallback()}>Cancel</Button>
    {/if}
    {#if !pushFinished}
      <Button
        class="w-auto"
        icon={faCircleArrowUp}
        disabled={!isAuthenticatedForThisImage}
        on:click={async () => {
          await pushImage(selectedImageTag);
        }}
        bind:inProgress={pushInProgress}>
        Push image
      </Button>
    {:else}
      <Button on:click={() => pushImageFinished()} class="w-auto">Done</Button>
    {/if}
  </svelte:fragment>
</Dialog>
