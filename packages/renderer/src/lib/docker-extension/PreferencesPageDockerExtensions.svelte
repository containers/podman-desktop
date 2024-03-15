<script lang="ts">
import { faArrowCircleDown } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@podman-desktop/ui-svelte';
import { afterUpdate } from 'svelte';

import { contributions } from '../../stores/contribs';
import SettingsPage from '../preferences/SettingsPage.svelte';
import Button from '../ui/Button.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';

export let ociImage: string | undefined = undefined;

let installInProgress = false;
let errorInstall = '';
let logs: string[] = [];

let logElement: HTMLDivElement;

async function installDDExtensionFromImage() {
  if (!ociImage) {
    errorInstall = 'no OCI image provided';
    return;
  }

  errorInstall = '';
  logs.length = 0;
  installInProgress = true;

  // do a trim on the image name
  ociImage = ociImage.trim();

  // download image
  await window.ddExtensionInstall(
    ociImage,
    (data: string) => {
      logs = [...logs, data];
    },
    (error: string) => {
      installInProgress = false;
      errorInstall = error;
    },
  );
  logs = [...logs, '☑️ installation finished !'];
  installInProgress = false;
  ociImage = '';
}

afterUpdate(() => {
  if (logElement.scroll) {
    logElement.scroll({ top: logElement.scrollHeight, behavior: 'smooth' });
  }
});

function deleteContribution(extensionName: string) {
  window.ddExtensionDelete(extensionName);
}
</script>

<SettingsPage title="Docker Desktop Extensions">
  <div class="bg-charcoal-600 rounded-md p-3">
    <p class="text-xs">There is an ongoing support of Docker Desktop UI extensions from Podman Desktop.</p>
    <p class="text-xs italic">
      Not all are guaranteed to work but you can add their OCI Image below to try and load them.
    </p>
    <p class="text-xs italic">
      Example: aquasec/trivy-docker-extension:latest for Trivy extension or redhatdeveloper/openshift-dd-ext:latest for
      the OpenShift extension.
    </p>

    <div class="container w-full mt-4 flex-col">
      <div class="flex flex-col mb-4">
        <label for="ociImage" class="block mb-2 text-sm font-medium text-gray-400">Image name:</label>
        <Input
          name="ociImage"
          id="ociImage"
          aria-label="OCI Image Name"
          bind:value="{ociImage}"
          placeholder="Name of the Image"
          required />
      </div>
    </div>

    <Button
      on:click="{() => installDDExtensionFromImage()}"
      inProgress="{installInProgress}"
      disabled="{ociImage === undefined || ociImage.trim() === ''}"
      icon="{faArrowCircleDown}">
      Install extension from the OCI image
    </Button>

    <div
      class:opacity-0="{logs.length === 0}"
      bind:this="{logElement}"
      class="bg-zinc-700 text-gray-300 mt-2 h-16 p-1 overflow-y-auto">
      {#each logs as log}
        <p class="font-light text-sm">{log}</p>
      {/each}
    </div>

    <ErrorMessage class="p-1 text-sm" error="{errorInstall}" />
  </div>

  {#if $contributions.length > 0}
    <div class="flex border-t-2 border-purple-500 flex-1 flex-col mt-4 p-2">
      <p>Installed extensions:</p>
      <div class="grid gap-4 grid-cols-4 pt-4">
        {#each $contributions as contribution, index}
          <div class="flex flex-col bg-purple-600 h-[100px]">
            <div class="flex justify-end flex-wrap">
              <button
                class="inline-block text-gray-100 hover:text-gray-700 focus:outline-none rounded-lg text-sm p-1.5"
                type="button">
                <i
                  class="fas fa-times"
                  on:click="{() => deleteContribution(contribution.extensionId)}"
                  aria-hidden="true"></i>
              </button>
            </div>
            <div class="flex flex-col p-3">
              <p class="text-sm">{index + 1}. {contribution.extensionId}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</SettingsPage>
