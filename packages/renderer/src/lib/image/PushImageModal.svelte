<script lang="ts">
import { onMount, tick } from 'svelte';
import { router } from 'tinro';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import Modal from '../dialogs/Modal.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let closeCallback: () => void;
export let imageInfoToPush: ImageInfoUI;

function keydownDockerfileChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    closeCallback();
  }
}
let pushInProgress = false;
let pushFinished = false;
let logsPush;

let selectedImageTag = '';
let imageTags: string[] = [];
onMount(async () => {
  const inspectInfo = await window.getImageInspect(imageInfoToPush.engineId, imageInfoToPush.id);

  imageTags = inspectInfo.RepoTags;
  if (imageTags.length > 0) {
    selectedImageTag = imageTags[0];
  }
});

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

  logsPush = new Terminal({ fontSize, lineHeight, disableStdin: true });
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

async function pushImage(imageTag: string) {
  gotErrorDuringPush = false;
  await tick();
  initTerminal();
  await tick();
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
      logsPush.write(jsonObject.status + '\n\r');
    } else if (jsonObject.error) {
      gotErrorDuringPush = true;
      logsPush.write(jsonObject.error.replaceAll('\n', '\n\r') + '\n\r');
    }
  } else if (name === 'end') {
    if (!gotErrorDuringPush) {
      pushFinished = true;
    }
    pushInProgress = false;
  }
}
let pushLogsXtermDiv: HTMLDivElement;
</script>

<Modal
  on:close="{() => {
    closeCallback();
  }}">
  <div class="modal flex flex-col place-self-center bg-zinc-900 shadow-xl shadow-black">
    <div class="flex items-center justify-between px-6 py-5 space-x-2">
      <h1 class="grow text-lg font-bold capitalize">Push Image</h1>

      <button class="hover:text-gray-300 py-1" on:click="{() => closeCallback()}">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>

    <div class="flex flex-col px-10 py-4 text-sm leading-5 space-y-5">
      <div>
        <label for="modalImageTag" class="block mb-2 text-sm font-medium text-gray-400 dark:text-gray-400"
          >Image Tag</label>
        <select
          class="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-zinc-800 border-gray-900 placeholder-gray-700 text-white"
          name="imageChoice"
          bind:value="{selectedImageTag}">
          {#each imageTags as imageTag}
            <option value="{imageTag}">{imageTag}</option>
          {/each}
        </select>
      </div>

      {#if !pushFinished}
        <button
          class="pf-c-button pf-m-primary"
          disabled="{pushInProgress}"
          type="button"
          on:click="{() => {
            pushImage(selectedImageTag);
          }}">
          {#if pushInProgress === true}
            <i class="pf-c-button__progress">
              <span class="pf-c-spinner pf-m-md" role="progressbar">
                <span class="pf-c-spinner__clipper"></span>
                <span class="pf-c-spinner__lead-ball"></span>
                <span class="pf-c-spinner__tail-ball"></span>
              </span>
            </i>
          {:else}
            <i class="fas fa-arrow-circle-up" aria-hidden="true"></i>
          {/if}
          Push image</button>
      {:else}
        <button class="pf-c-button pf-m-primary" type="button" on:click="{() => pushImageFinished()}"> Done</button>
      {/if}

      <div bind:this="{pushLogsXtermDiv}"></div>
    </div>
  </div></Modal>
