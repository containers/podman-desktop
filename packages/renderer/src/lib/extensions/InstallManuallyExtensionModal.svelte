<script lang="ts">
import { faCloudDownload } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import Dialog from '/@/lib/dialogs/Dialog.svelte';

interface Props {
  closeCallback: () => void;
}

let { closeCallback }: Props = $props();
let imageName = $state('');

let inputfieldError: string | undefined = $state('');

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

async function installExtension(): Promise<void> {
  // do a trim on the image name
  const ociImage = imageName.trim();

  // the installation is reported by its task: the dialog is closed so it does not cover the dialogs
  // the installer may show, e.g. to confirm replacing a bundled extension
  closeCallback();

  try {
    await window.extensionInstallFromImage(
      ociImage,
      (data: string) => console.debug(`Installing ${ociImage}:`, data),
      (error: string) => console.error(`got an error when installing ${ociImage}`, error),
    );
  } catch (error: unknown) {
    console.error(`error when installing ${ociImage}`, error);
  }
}

async function handleKeydown(e: KeyboardEvent): Promise<void> {
  if (e.key === 'Enter' && inputfieldError === undefined) {
    e.preventDefault();
    await installExtension();
  }
}
</script>

<svelte:window onkeydown={handleKeydown} />

<Dialog
  title="Install Custom Extension"
  onclose={closeCallback}>
  {#snippet content()}
    <div  class="flex flex-col leading-5 space-y-5">
      <div>
        <label for="imageName" class="block pb-2 text-[var(--pd-modal-text)]">OCI Image:</label>
        <div class="min-h-14">
          <Input
            bind:value={imageName}
            name="imageName"
            id="imageName"
            placeholder="Enter OCI image name of the extension (e.g. quay.io/namespace/my-image)"
            on:input={validateImageName}
            error={inputfieldError}
            aria-invalid={inputfieldError !== ''}
            aria-label={inputAriaLabel}
            required />
        </div>
      </div>
    </div>
  {/snippet}
  {#snippet buttons()}

      <Button
        type="link"
        on:click={closeCallback}>Cancel</Button>
      <Button
        type="primary"
        icon={faCloudDownload}
        disabled={inputfieldError !== undefined}
        on:click={installExtension}>Install</Button>

  {/snippet}
</Dialog>
