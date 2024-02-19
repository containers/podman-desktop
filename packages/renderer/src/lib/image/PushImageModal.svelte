<script lang="ts">
import { onMount, tick } from 'svelte';
import { router } from 'tinro';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import Modal from '../dialogs/Modal.svelte';
import type { ImageInfoUI } from './ImageInfoUI';
import Button from '../ui/Button.svelte';
import Link from '../ui/Link.svelte';
import { faCheckCircle, faTriangleExclamation, faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

export let closeCallback: () => void;
export let imageInfoToPush: ImageInfoUI;

let pushInProgress = false;
let pushFinished = false;
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

let isAuthenticatedForThisImage = false;
$: window.hasAuthconfigForImage(imageInfoToPush.name).then(result => (isAuthenticatedForThisImage = result));
</script>

<Modal
  on:close="{() => {
    closeCallback();
  }}">
  <div class="modal flex flex-col place-self-center bg-charcoal-800 shadow-xl shadow-black">
    <div class="flex items-center justify-between px-6 py-5 space-x-2">
      <h1 class="grow text-lg font-bold">Push image</h1>

      <button class="hover:text-gray-300 py-1" on:click="{() => closeCallback()}">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>

    <div class="flex flex-col px-6 py-4 pt-0 text-sm leading-5 space-y-5">
      <div class="pb-4">
        <label for="modalImageTag" class="block mb-2 text-sm font-medium text-gray-400">Image tag</label>
        {#if isAuthenticatedForThisImage}
          <Fa class="absolute mt-3 ml-1.5 text-green-300" size="16" icon="{faCheckCircle}" />
        {:else}
          <Fa class="absolute mt-3 ml-1.5 text-amber-500" size="16" icon="{faTriangleExclamation}" />
        {/if}

        <select
          class="text-sm rounded-lg block w-full p-2.5 bg-charcoal-600 pl-6 border-r-8 border-transparent outline-1 outline {isAuthenticatedForThisImage
            ? 'outline-gray-900'
            : 'outline-amber-500'} placeholder-gray-700 text-white"
          name="imageChoice"
          bind:value="{selectedImageTag}">
          {#each imageTags as imageTag}
            <option value="{imageTag}">{imageTag}</option>
          {/each}
        </select>
        <!-- If the image is UNAUTHENTICATED, show a warning that the image is unable to be pushed
        and to click to go to the registries page -->
        {#if !isAuthenticatedForThisImage}
          <p class="text-amber-500 pt-1">
            No registry with push permissions found. <Link internalRef="/preferences/registries"
              >Add a registry now.</Link>
          </p>{/if}
      </div>

      <div class="flex justify-end space-x-2">
        {#if !pushInProgress && !pushFinished}
          <Button class="w-auto" type="secondary" on:click="{() => closeCallback()}">Cancel</Button>
        {/if}
        {#if !pushFinished}
          <Button
            class="w-auto"
            icon="{faCircleArrowUp}"
            disabled="{!isAuthenticatedForThisImage}"
            on:click="{() => {
              pushImage(selectedImageTag);
            }}"
            bind:inProgress="{pushInProgress}">
            Push image
          </Button>
        {:else}
          <Button on:click="{() => pushImageFinished()}" class="w-auto">Done</Button>
        {/if}
      </div>

      <div bind:this="{pushLogsXtermDiv}"></div>
    </div>
  </div></Modal>
