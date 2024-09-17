<script lang="ts">
import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import type { Terminal } from '@xterm/xterm';
import { tick } from 'svelte';
import { router } from 'tinro';

import Dialog from '../dialogs/Dialog.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let closeCallback: () => void;
export let manifestInfoToPush: ImageInfoUI;

let pushInProgress = false;
let pushFinished = false;
let initTerminal = false;
let logsPush: Terminal;

async function pushManifest() {
  initTerminal = true;
  await tick();
  logsPush?.reset();

  pushInProgress = true;

  try {
    logsPush.write(`Pushing manifest ${manifestInfoToPush.name} ...\n\r`);
    await window.pushManifest({ name: manifestInfoToPush.name, destination: manifestInfoToPush.name });
    logsPush.write('Manifest pushed successfully\n\r');
    pushFinished = true;
  } catch (err) {
    logsPush.write(err + '\n\r');
    pushFinished = true;
    console.error(err);
  }
}

async function pushManifestFinished() {
  closeCallback();
  router.goto('/images');
}
</script>

<Dialog
  title="Push manifest"
  on:close={() => {
    closeCallback();
    logsPush?.dispose();
  }}>
  <div slot="content" class="flex flex-col leading-5 space-y-5">
    {#if !pushInProgress}
      <p class="text-sm">
        Push manifest {manifestInfoToPush.name}

        {#if manifestInfoToPush.children && manifestInfoToPush.children.length > 0}
          with {manifestInfoToPush.children.length} associated images
        {/if}
      </p>
    {/if}
    <div hidden={initTerminal === false}>
      <TerminalWindow bind:terminal={logsPush} disableStdIn />
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
        on:click={() => {
          pushManifest();
        }}
        bind:inProgress={pushInProgress}>
        Push manifest
      </Button>
    {:else}
      <Button on:click={() => pushManifestFinished()} class="w-auto">Done</Button>
    {/if}
  </svelte:fragment>
</Dialog>
