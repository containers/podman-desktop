<script lang="ts">
import { afterUpdate } from 'svelte';

import { contributions } from '../../stores/contribs';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import SettingsPage from '../preferences/SettingsPage.svelte';

let ociImage: string;

let installInProgress: boolean = false;
let errorInstall: string = '';
let logs: string[] = [];

let logElement;

async function installDDExtensionFromImage() {
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
  logElement.scroll({ top: logElement.scrollHeight, behavior: 'smooth' });
});

function deleteContribution(extensionName: string) {
  window.ddExtensionDelete(extensionName);
}
</script>

<SettingsPage title="Docker Desktop Extensions">
  <div class="bg-zinc-800 mt-5 rounded-md p-3">
    <p class="text-xs">There is an ongoing support of Docker Desktop UI extensions from Podman Desktop.</p>
    <p class="text-xs italic">
      Not all are guaranteed to work but you can add their OCI Image below to try and load them.
    </p>
    <p class="text-xs italic">
      Example: aquasec/trivy-docker-extension:latest for Trivy extension or redhatdeveloper/openshift-dd-ext:latest for
      the OpenShift extension.
    </p>

    <div class="container mx-auto w-full mt-4 flex-col">
      <div class="flex flex-col mb-4">
        <label for="ociImage" class="block mb-2 text-sm font-medium text-gray-300">Image name:</label>
        <input
          name="ociImage"
          id="ociImage"
          bind:value="{ociImage}"
          placeholder="Name of the Image"
          class="text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
          required />
      </div>
    </div>

    <button
      on:click="{() => installDDExtensionFromImage()}"
      disabled="{ociImage === undefined || ociImage === '' || installInProgress}"
      class="pf-c-button pf-m-primary"
      type="button">
      {#if installInProgress}
        <i class="pf-c-button__progress">
          <span class="pf-c-spinner pf-m-md" role="progressbar">
            <span class="pf-c-spinner__clipper"></span>
            <span class="pf-c-spinner__lead-ball"></span>
            <span class="pf-c-spinner__tail-ball"></span>
          </span>
        </i>
      {/if}
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-arrow-circle-down ml-6" aria-hidden="true"></i>
      </span>
      Install extension from the OCI image
    </button>

    <div
      class:opacity-0="{logs.length === 0}"
      bind:this="{logElement}"
      class="bg-zinc-700 text-gray-200 mt-2 h-16 p-1 overflow-y-auto">
      {#each logs as log}
        <p class="font-light text-sm">{log}</p>
      {/each}
    </div>

    <ErrorMessage class="p-1 text-sm" error="{errorInstall}" />
  </div>

  {#if $contributions.length > 0}
    <div class="flex border-t-2 border-purple-500 flex-1 flex-col m-4 p-2">
      <p>Installed extensions:</p>
      <div class="grid gap-4 grid-cols-4 py-4">
        {#each $contributions as contribution, index}
          <div class="flex flex-col bg-purple-700 h-[100px]">
            <div class="flex justify-end flex-wrap">
              <button
                class="inline-block text-gray-100 dark:text-gray-100 hover:text-gray-400 dark:hover:text-gray-400 focus:outline-none rounded-lg text-sm p-1.5"
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
