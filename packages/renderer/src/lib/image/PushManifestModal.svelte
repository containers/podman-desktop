<script lang="ts">
import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { tick } from 'svelte';
import { router } from 'tinro';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getTerminalTheme } from '../../../../main/src/plugin/terminal-theme';
import Dialog from '../dialogs/Dialog.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let closeCallback: () => void;
export let manifestInfoToPush: ImageInfoUI;

let pushInProgress = false;
let pushFinished = false;
let logsPush: Terminal;

let terminalIntialized = false;

async function initTerminal() {
  if (terminalIntialized) {
    return;
  }

  // missing element, return
  if (!pushLogsXtermDiv) {
    return;
  }

  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  logsPush = new Terminal({ fontSize, lineHeight, disableStdin: true, theme: getTerminalTheme() });
  const fitAddon = new FitAddon();
  logsPush.loadAddon(fitAddon);

  logsPush.open(pushLogsXtermDiv);
  // disable cursor
  logsPush.write('\x1b[?25l');

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    fitAddon.fit();
  });
  fitAddon.fit();
  terminalIntialized = true;
}

async function pushManifest() {
  await tick();
  await initTerminal();
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
let pushLogsXtermDiv: HTMLDivElement;
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
    <div bind:this={pushLogsXtermDiv}></div>
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
