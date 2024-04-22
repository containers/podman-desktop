<script lang="ts">
import { faCloudDownload } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import Modal from '/@/lib/dialogs/Modal.svelte';
import Button from '/@/lib/ui/Button.svelte';
import CloseButton from '/@/lib/ui/CloseButton.svelte';

export let closeCallback: () => void;
let imageName = '';

let installInProgress = false;
let inputfieldError: string | undefined = '';
let progressPercent = 0;
let logs: string[] = [];

const inputAriaLabel = 'Image name to install custom extension';

onMount(async () => {
  // search input field and make focus by aria-label Image name to install custom extension
  const imageNameInputField = document.querySelector(`[aria-label="${inputAriaLabel}"]`);
  if (imageNameInputField && imageNameInputField instanceof HTMLInputElement) {
    imageNameInputField.focus();
  }
});

function validateImageName(event: Event): void {
  if (event.target instanceof HTMLInputElement) {
    let name = event.target.value;
    if (!name) {
      inputfieldError = 'Missing name';
      return;
    } else {
      inputfieldError = undefined;
      return;
    }
  }
  inputfieldError = 'Invalid input';
}

async function installExtension() {
  inputfieldError = undefined;
  logs = [];

  installInProgress = true;

  // do a trim on the image name
  const ociImage = imageName?.trim();

  try {
    // download image
    await window.extensionInstallFromImage(
      ociImage,
      (data: string) => {
        logs = [...logs, data];
        console.debug(`Installing ${ociImage}:`, data);

        // try to extract percentage from string like
        // data Downloading sha256:e8d2c9e5c69499c41ba39b7828c00e55087572884cac466b4d1b47243b085c7d.tar - 11% - (55132/521578)
        const percentageMatch = data.match(/(\d+)%/);
        if (percentageMatch) {
          progressPercent = parseInt(percentageMatch[1]);
        }
      },
      (error: string) => {
        console.error(`got an error when installing ${ociImage}`, error);
        installInProgress = false;
        inputfieldError = error;
      },
    );
    logs = [...logs, '☑️ installation finished !'];
    progressPercent = 100;
  } catch (error) {
    console.error('error', error);
  }
  installInProgress = false;
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (progressPercent === 100) {
      closeCallback();
    } else {
      installExtension();
    }
  }
}
</script>

<svelte:window on:keydown="{handleKeydown}" />

<Modal
  name="Install Extension from OCI image"
  on:close="{() => {
    closeCallback();
  }}">
  <div class="modal flex flex-col place-self-center bg-charcoal-800 shadow-xl shadow-black">
    <div class="flex items-center justify-between px-6 py-5 space-x-2">
      <h1 class="grow text-lg font-bold capitalize">Install custom extension</h1>

      <CloseButton on:click="{() => closeCallback()}" />
    </div>
    <div class="flex flex-col px-10 py-4 text-sm leading-5 space-y-5">
      <div>
        <label for="imageName" class="block text-sm pb-2 text-gray-400">OCI Image:</label>
        <div class="min-h-14">
          {#if progressPercent < 100}
            <Input
              bind:value="{imageName}"
              name="imageName"
              id="imageName"
              placeholder="Enter OCI image name of the extension (e.g. quay.io/namespace/my-image)"
              on:input="{event => validateImageName(event)}"
              disabled="{installInProgress}"
              error="{inputfieldError}"
              aria-invalid="{inputfieldError !== ''}"
              aria-label="{inputAriaLabel}"
              required />
          {:else}
            <div class="text-gray-400">{imageName} successfully installed.</div>
          {/if}
        </div>
        <div class="w-full min-h-9 h-9 py-2">
          {#if installInProgress}
            <div class="flex grow">
              <div class="w-full h-4 mb-4 rounded-md bg-gray-600 progress-bar overflow-hidden">
                <div class="h-4 bg-purple-500 rounded-md" role="progressbar" style="width: {progressPercent}%"></div>
              </div>
              <div class="ml-2 w-3 text-xs text-purple-500">{progressPercent}%</div>
            </div>
          {/if}
        </div>
        <div class="w-full grid grid-flow-col justify-items-center">
          <Button
            type="link"
            on:click="{() => {
              closeCallback();
            }}">Cancel</Button>
          {#if progressPercent !== 100}
            <Button
              icon="{faCloudDownload}"
              disabled="{inputfieldError !== undefined}"
              on:click="{() => installExtension()}"
              inProgress="{installInProgress}">Install</Button>
          {/if}
          {#if progressPercent === 100}
            <Button on:click="{() => closeCallback()}">Done</Button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</Modal>
