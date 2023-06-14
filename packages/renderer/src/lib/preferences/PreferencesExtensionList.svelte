<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPuzzlePiece, faTrash, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { afterUpdate } from 'svelte';
import { extensionInfos } from '../../stores/extensions';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import SettingsPage from '../preferences/SettingsPage.svelte';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import FeaturedExtensions from '../featured/FeaturedExtensions.svelte';

export let ociImage: string = undefined;

let installInProgress = false;
let errorInstall = '';
let logs: string[] = [];

let logElement;

const buttonClass =
  'm-0.5 text-gray-400 hover:bg-charcoal-600 hover:text-violet-600 font-medium rounded-full inline-flex items-center px-2 py-2 text-center';

async function installExtensionFromImage() {
  errorInstall = '';
  logs.length = 0;
  installInProgress = true;

  // do a trim on the image name
  ociImage = ociImage.trim();

  // download image
  await window.extensionInstallFromImage(
    ociImage,
    (data: string) => {
      logs = [...logs, data];
    },
    (error: string) => {
      console.log('got an error', error);
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

async function stopExtension(extension: ExtensionInfo) {
  await window.stopExtension(extension.id);
}
async function startExtension(extension: ExtensionInfo) {
  await window.startExtension(extension.id);
}

async function removeExtension(extension: ExtensionInfo) {
  await window.removeExtension(extension.id);
}

async function updateExtension(extension: ExtensionInfo, ociUri: string) {
  await window.updateExtension(extension.id, ociUri);
}
</script>

<SettingsPage title="Extensions">
  <div class="bg-charcoal-600 rounded-md p-3">
    <div class="bg-charcoal-700 mb-4 rounded-md p-3">
      <FeaturedExtensions />
    </div>

    <div class="bg-charcoal-700 mt-5 rounded-md p-3">
      <h1 class="text-lg mb-2">Install a new extension from OCI Image</h1>

      <div class="flex flex-col w-full">
        <div class="flex flex-row mb-2 w-full space-x-8 items-center">
          <input
            name="ociImage"
            id="ociImage"
            bind:value="{ociImage}"
            placeholder="Name of the Image"
            class="w-1/2 p-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
            required />

          <button
            on:click="{() => installExtensionFromImage()}"
            disabled="{ociImage === undefined || ociImage.trim() === '' || installInProgress}"
            class="w-full pf-c-button pf-m-primary"
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
              <i class="fas fa-arrow-circle-down" aria-hidden="true"></i>
            </span>
            Install extension from the OCI image
          </button>
        </div>

        <div class="container w-full flex-col">
          <div
            class:opacity-0="{logs.length === 0}"
            bind:this="{logElement}"
            class="bg-zinc-700 text-gray-300 mt-4 mb-3 p-1 h-16 overflow-y-auto">
            {#each logs as log}
              <p class="font-light text-sm">{log}</p>
            {/each}
          </div>

          <ErrorMessage error="{errorInstall}" />
        </div>
      </div>
    </div>
    <div class="bg-charcoal-600 mt-5 rounded-md p-3">
      <table class="min-w-full">
        <tbody>
          {#each $extensionInfos as extension}
            <tr class="border-y border-gray-900">
              <td class="px-6 py-2">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 py-3" title="Extension {extension.name} is {extension.state}">
                    <Fa
                      class="h-10 w-10 rounded-full {extension.state === 'started'
                        ? 'text-violet-600'
                        : 'text-gray-900'}"
                      size="25"
                      icon="{faPuzzlePiece}" />
                  </div>
                  <div class="ml-4">
                    <div class="flex flex-row">
                      <div class="text-sm text-gray-300">
                        {extension.displayName}
                        {extension.removable ? '(user)' : '(default extension)'}
                        <span class="text-xs font-extra-light text-gray-900">v{extension.version}</span>
                        {#if extension.update}
                          <button
                            class="mx-2 px-2 text-xs font-medium text-center text-white bg-violet-600 rounded-sm hover:bg-dustypurple-800 focus:ring-2 focus:outline-none focus:ring-dustypurple-700"
                            title="Update to {extension.update.version}"
                            on:click="{() => updateExtension(extension, extension.update.ociUri)}">
                            Update</button>
                        {/if}
                      </div>
                    </div>
                    <div class="flex flex-row">
                      <div class="text-sm text-gray-700 italic">{extension.description}</div>
                    </div>
                    <div class="flex">
                      <ConnectionStatus status="{extension.state}" />
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-2 py-2 whitespace-nowrap">
                <div class="flex flex-row justify-end">
                  <button
                    title="Start extension"
                    on:click="{() => startExtension(extension)}"
                    class="{buttonClass}"
                    class:hidden="{extension.state !== 'stopped'}"><Fa class="h-4 w-4" icon="{faPlay}" /></button>
                  <button
                    title="Stop extension"
                    class="{buttonClass}"
                    on:click="{() => stopExtension(extension)}"
                    hidden
                    class:hidden="{extension.state !== 'started'}"><Fa class="h-4 w-4" icon="{faStop}" /></button>

                  {#if extension.removable}
                    {#if extension.state === 'stopped'}
                      <button
                        title="Remove extension"
                        class="{buttonClass}"
                        on:click="{() => removeExtension(extension)}"><Fa class="h-4 w-4" icon="{faTrash}" /></button>
                    {:else}
                      <div
                        class="m-0.5 text-gray-900 rounded-full inline-flex items-center px-2 py-2 text-center"
                        title="Running extension cannot be removed.">
                        <Fa class="h-4 w-4" icon="{faTrash}" />
                      </div>
                    {/if}
                  {:else}
                    <div
                      class="m-0.5 text-gray-900 rounded-full inline-flex items-center px-2 py-2 text-center"
                      title="Default extension. Cannot be removed.">
                      <Fa class="h-4 w-4" icon="{faTrash}" />
                    </div>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div></SettingsPage>
