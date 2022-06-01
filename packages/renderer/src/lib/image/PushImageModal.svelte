<script lang="ts">
import { onMount, tick } from 'svelte';
import { router } from 'tinro';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import type { ImageInfo } from '../../../../main/src/plugin/api/image-info';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import type { ImageInfoUI } from './ImageInfoUI';

export let closeCallback: () => void;
export let imageInfoToPush: ImageInfoUI;

function keydownDockerfileChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    closeCallback();
  }
}
let pushError = '';
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

<div
  class="modal z-50 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0"
  tabindex="{0}"
  autofocus
  on:keydown="{keydownDockerfileChoice}">
  <div class="modal-overlay fixed w-full h-full bg-gray-900 opacity-50"></div>

  <div class="relative px-4 w-full max-w-4xl h-full md:h-auto">
    <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div class="flex justify-end p-2">
          <button
            on:click="{() => closeCallback()}"
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
            data-modal-toggle="authentication-modal">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
              ><path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"></path
              ></svg>
          </button>
        </div>
        <!--<form class="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">-->
        <div class="px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
          <h3 class="text-xl font-medium text-gray-900 dark:text-white">Pushing image</h3>

          <div>
            <label for="modalImageTag" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >Image Tag</label>
            <select
              class="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
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
          <!-- </form>-->
        </div>
      </div>
    </div>
  </div>
</div>
