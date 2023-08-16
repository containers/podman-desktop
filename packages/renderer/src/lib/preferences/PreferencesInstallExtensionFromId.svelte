<style>
.progress-bar::-webkit-progress-bar {
  background-color: #ccc;
}

.progress-bar::-webkit-progress-value {
  background-color: currentColor;
}
</style>

<script lang="ts">
import type { CatalogExtension } from '../../../../main/src/plugin/extensions-catalog/extensions-catalog-api';
import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import type { Unsubscriber } from 'svelte/store';

import { onDestroy, onMount } from 'svelte';
import SettingsPage from '/@/lib/preferences/SettingsPage.svelte';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';
import EmptyScreen from '/@/lib/ui/EmptyScreen.svelte';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import Markdown from '/@/lib/markdown/Markdown.svelte';
import { extensionInfos } from '/@/stores/extensions';
import ErrorMessage from '/@/lib/ui/ErrorMessage.svelte';

export let extensionId: string = undefined;

let installedExtensions: ExtensionInfo[] = [];
let extensionDetails: CatalogExtension = undefined;
let extensions = [];
let title;
let readmeContent = '';

// get the content of the URL and return it using FETCH API
async function fetchReadmeContent(url: string): Promise<void> {
  if (!url) {
    return;
  }
  const response = await fetch(url);
  const data = await response.text();
  readmeContent = data;
}

$: extensionDetails = extensions.find(e => e.id === extensionId);

$: title = extensionDetails
  ? `Installing extension ${extensionDetails.extensionName} from ${extensionDetails.publisherName}...`
  : `Installing extension with id '${extensionId}'...`;
$: nonPreviewVersions = extensionDetails ? extensionDetails.versions.filter(v => v.preview === false) : [];
$: latestVersion = nonPreviewVersions.length > 0 ? nonPreviewVersions[0] : undefined;
$: latestVersionNumber = latestVersion ? `v${latestVersion.version}` : '';
$: latestVersionOciLink = latestVersion ? latestVersion.ociUri : undefined;
$: latestVersionIcon = latestVersion ? latestVersion.files.find(f => f.assetType === 'icon')?.data : undefined;
$: latestVersionReadme = latestVersion ? latestVersion.files.find(f => f.assetType === 'README')?.data : undefined;
$: fetchReadmeContent(latestVersionReadme);
$: isInstalled = installedExtensions.find(e => e.id === extensionId) !== undefined;

let installInProgress = false;

let logs = [];
let errorInstall = '';

let percentage = 0;

async function installExtension() {
  if (!latestVersionOciLink) {
    console.log('no oci link found for this extension');
    return;
  }

  console.log('User asked to install the extension', extensionId);
  logs = [];

  installInProgress = true;
  errorInstall = '';
  percentage = 0;

  // do a trim on the image name
  const ociImage = latestVersionOciLink;

  try {
    // download image
    await window.extensionInstallFromImage(
      ociImage,
      (data: string) => {
        logs = [...logs, data];
        console.log('data', data);

        // try to extract percentage from string like
        // data Downloading sha256:e8d2c9e5c69499c41ba39b7828c00e55087572884cac466b4d1b47243b085c7d.tar - 11% - (55132/521578)
        const percentageMatch = data.match(/(\d+)%/);
        if (percentageMatch) {
          percentage = parseInt(percentageMatch[1]);
        }
      },
      (error: string) => {
        console.log(`got an error when installing ${extensionId}`, error);
        installInProgress = false;
        errorInstall = error;
      },
    );
    logs = [...logs, '☑️ installation finished !'];
    percentage = 100;
  } catch (error) {
    console.log('error', error);
  }
  installInProgress = false;
}

let subscribeCatalogExtensions: Unsubscriber;
let subscribeInstalledExtensions: Unsubscriber;

onMount(() => {
  subscribeInstalledExtensions = extensionInfos.subscribe(e => {
    installedExtensions = e;
  });

  subscribeCatalogExtensions = catalogExtensionInfos.subscribe(e => {
    extensions = e;
  });
});

onDestroy(() => {
  subscribeCatalogExtensions?.();
  subscribeInstalledExtensions?.();
});
</script>

<SettingsPage title="{title}">
  {#if extensionDetails}
    <div class="bg-charcoal-600 mt-5 rounded-md p-3">
      <div class="bg-charcoal-700 rounded-md p-3">
        <div class="flex flex-row">
          <div>
            {#if latestVersionIcon}
              <img alt="{extensionDetails.extensionName} icon" src="{latestVersionIcon}" class="w-20 h-20 rounded-md" />
            {/if}
          </div>

          <div class="flex flex-col ml-2">
            <div class="text-2xl text-gray-300">
              {extensionDetails.extensionName}
              {latestVersionNumber}
            </div>
            <div class="text-sm text-gray-300">
              {extensionDetails.displayName}
            </div>
            <div class="flex">
              {#if installInProgress}
                <div
                  class="px-3 my-1 text-sm font-medium text-center text-white bg-violet-600 rounded-sm focus:outline-none cursor-default"
                  title="Extension {extensionDetails.extensionName} is already installed.">
                  Installing...
                </div>
              {:else if !isInstalled}
                <button
                  class="px-3 my-1 text-sm font-medium text-center text-white bg-violet-600 rounded-sm hover:bg-dustypurple-800 focus:ring-2 focus:outline-none focus:ring-dustypurple-700"
                  title="Install extension {extensionDetails.extensionName}"
                  on:click="{() => installExtension()}">
                  Install...
                </button>
              {:else}
                <div
                  class="px-3 my-1 text-sm font-medium text-center text-white bg-violet-600 rounded-sm focus:outline-none cursor-default"
                  title="Extension {extensionDetails.extensionName} is already installed.">
                  Installed
                </div>
              {/if}
            </div>
          </div>
        </div>
        <div class="py-2">
          {#if installInProgress}
            <div class="flex flex-row items-center">
              <progress
                class="w-full appearance-none border-none h-1 text-violet-700 text-base progress-bar"
                max="100"
                value="{percentage}"></progress>
              <div class="ml-2 text-violet-400">{percentage}%</div>
            </div>
          {:else}
            &nbsp;
            {#if errorInstall}
              <ErrorMessage error="{errorInstall}" />
            {/if}
          {/if}
        </div>
      </div>

      <div class="bg-charcoal-700 rounded-md mt-4 p-3">
        <Markdown markdown="{readmeContent}" />
      </div>
    </div>
  {:else}
    <EmptyScreen
      title="Extension not found"
      message="Extension with id '{extensionId}' is not available in the catalog"
      icon="{faPuzzlePiece}" />
  {/if}
</SettingsPage>
