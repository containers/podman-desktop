<script lang="ts">
import type { Registry } from '@podman-desktop/api';

import { onMount, tick } from 'svelte';
import { router } from 'tinro';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import type { PullEvent } from '../../../../main/src/plugin/api/pull-event';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';

import { providerInfos } from '../../stores/providers';
import Modal from '../dialogs/Modal.svelte';
import PreferencesRegistriesEditCreateRegistryModal from '../preferences/PreferencesRegistriesEditCreateRegistryModal.svelte';
import NoContainerEngineEmptyScreen from './NoContainerEngineEmptyScreen.svelte';

let logsPull;
let pullError = '';
let pullInProgress = false;
let pullFinished = false;
export let imageToPull: string = undefined;

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

let selectedProviderConnection: ProviderContainerConnectionInfo;
$: initTerminal();

const lineNumberPerId = new Map<string, number>();
let lineIndex = 0;

let terminalIntialized = false;

function callback(event: PullEvent) {
  let lineIndexToWrite;
  if (event.status) {
    if (event.id) {
      const lineNumber = lineNumberPerId.get(event.id);
      if (lineNumber) {
        lineIndexToWrite = lineNumber;
      } else {
        lineIndex++;
        lineIndexToWrite = lineIndex;
        lineNumberPerId.set(event.id, lineIndex);
      }
    }
  }
  // no index, append
  if (!lineIndexToWrite) {
    lineIndex++;
    lineIndexToWrite = lineIndex;
  }

  if (event.status) {
    // move cursor to the home
    logsPull.write(`\u001b[${lineIndexToWrite};0H`);
    // erase the line
    logsPull.write(`\u001B[2K`);
    // do we have id ?
    if (event.id) {
      logsPull.write(`${event.id}: `);
    }
    logsPull.write(event.status);
    // do we have progress ?
    if (event.progress && event.progress !== '') {
      logsPull.write(event.progress);
    } else if (event.progressDetail && event.progressDetail.current && event.progressDetail.total) {
      logsPull.write(` ${Math.round((event.progressDetail.current / event.progressDetail.total) * 100)}%`);
    }
    // write end of line
    logsPull.write(`\n\r`);
  } else if (event.error) {
    logsPull.write(event.error.replaceAll('\n', '\n\r') + '\n\r');
  }
}
let pullLogsXtermDiv: HTMLDivElement;

async function initTerminal() {
  if (terminalIntialized) {
    return;
  }

  // missing element, return
  if (!pullLogsXtermDiv) {
    return;
  }

  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  logsPull = new Terminal({ fontSize, lineHeight, disableStdin: true });
  const fitAddon = new FitAddon();
  logsPull.loadAddon(fitAddon);

  logsPull.open(pullLogsXtermDiv);
  // disable cursor
  logsPull.write('\x1b[?25l');

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    fitAddon.fit();
  });
  fitAddon.fit();
  terminalIntialized = true;
}

async function pullImage() {
  lineNumberPerId.clear();
  lineIndex = 0;
  await tick();
  initTerminal();
  await tick();
  logsPull?.reset();

  pullInProgress = true;
  try {
    await window.pullImage(selectedProviderConnection, imageToPull.trim(), callback);
    pullInProgress = false;
    pullFinished = true;
  } catch (error) {
    const errorMessage = error.message ? error.message : error;
    pullError = 'Could not connect to ' + selectedProviderConnection.name + ': ' + errorMessage;
    pullInProgress = false;
  }
}

async function pullImageFinished() {
  router.goto('/images');
}

async function gotoManageRegistries() {
  router.goto('/preferences/registries');
}

let showAddRegistryModal = false;
async function toggleAddARegistry() {
  showAddRegistryModal = true;
}

onMount(() => {
  if (!selectedProviderConnection) {
    selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
  }
});

let imageNameInvalid = undefined;
function validateImageName(event): void {
  imageToPull = event.target.value;
  if (imageToPull === undefined || imageToPull.trim() === '') {
    imageNameInvalid = 'Please enter a value';
  } else {
    imageNameInvalid = '';
  }
}
</script>

{#if providerConnections.length === 0}
  <NoContainerEngineEmptyScreen />
{/if}

{#if providerConnections.length > 0}
  <div class="flex p-4 gap-x-2 flex-row-reverse">
    <button on:click="{() => toggleAddARegistry()}" class="pf-c-button pf-m-primary" type="button">
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-id-badge" aria-hidden="true"></i>
      </span>
      Login to a Registry
    </button>

    <button on:click="{() => gotoManageRegistries()}" class="pf-c-button pf-m-primary" type="button">
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-cog" aria-hidden="true"></i>
      </span>
      Manage registries
    </button>
  </div>

  <div class="px-6 pt-2 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
    <h3 class="text-xl font-medium :text-white">Pull Image From a Registry</h3>

    <div class="bg-charcoal-800 pt-5 space-y-6 px-8 sm:pb-6 xl:pb-8 rounded-lg">
      <form novalidate class="pf-c-form pf-m-horizontal-on-sm w-full">
        <div class="pf-c-form__group w-full">
          <div class="pf-c-form__group-label w-full">
            <label class="pf-c-form__label" for="form-horizontal-custom-breakpoint-name w-full">
              <span class="pf-c-form__label-text">Image to Pull:</span>
              <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>
            </label>
          </div>
          <div class="pf-c-form__group-control">
            <input
              class="pf-c-form-control outline-none"
              type="text"
              name="serverUrl"
              disabled="{pullFinished || pullInProgress}"
              on:input="{event => validateImageName(event)}"
              bind:value="{imageToPull}"
              aria-invalid="{imageNameInvalid && imageNameInvalid !== ''}"
              placeholder="Image name"
              aria-label="imageName"
              required />
            {#if imageNameInvalid}
              <p class="pf-c-form__helper-text pf-m-error" id="form-help-text-address-helper" aria-live="polite">
                {imageNameInvalid}
              </p>
            {/if}
          </div>

          {#if providerConnections.length > 1}
            <div class="pt-4">
              <div class="pf-c-form__group">
                <div class="pf-c-form__group-label">
                  <label class="pf-c-form__label" for="form-horizontal-custom-breakpoint-name">
                    <span class="pf-c-form__label-text">Container Engine:</span>
                    <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>
                  </label>
                </div>
                <div class="pf-c-form__group-control">
                  <div class="flex w-full">
                    <select
                      class="w-auto border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 bg-gray-900 border-gray-900 placeholder-gray-700 text-white"
                      name="providerChoice"
                      bind:value="{selectedProviderConnection}">
                      {#each providerConnections as providerConnection}
                        <option value="{providerConnection}">{providerConnection.name}</option>
                      {/each}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          {/if}
          {#if providerConnections.length == 1}
            <input type="hidden" name="providerChoice" readonly bind:value="{selectedProviderConnection}" />
          {/if}
        </div>
        <footer class="pf-c-modal-box__footer">
          <div class="w-full flex flex-col justify-end">
            {#if !pullFinished}
              <button
                class="pf-c-button pf-m-primary"
                disabled="{!imageToPull || imageToPull.trim() === '' || pullInProgress}"
                type="submit"
                on:click="{() => pullImage()}">
                {#if pullInProgress === true}
                  <i class="pf-c-button__progress">
                    <span class="pf-c-spinner pf-m-md" role="progressbar">
                      <span class="pf-c-spinner__clipper"></span>
                      <span class="pf-c-spinner__lead-ball"></span>
                      <span class="pf-c-spinner__tail-ball"></span>
                    </span>
                  </i>
                {/if}
                Pull image</button>
            {:else}
              <button class="pf-c-button pf-m-primary" type="button" on:click="{() => pullImageFinished()}">
                Done</button>
            {/if}
            {#if pullError}
              <p class="pf-c-form__helper-text pf-m-error" id="form-help-text-address-helper" aria-live="polite">
                {pullError}
              </p>
            {/if}
          </div>
        </footer>
      </form>
    </div>
  </div>
  <div bind:this="{pullLogsXtermDiv}"></div>
{/if}

{#if showAddRegistryModal}
  <Modal
    on:close="{() => {
      showAddRegistryModal = false;
    }}">
    <PreferencesRegistriesEditCreateRegistryModal
      mode="create"
      toggleCallback="{() => {
        showAddRegistryModal = false;
      }}" />
  </Modal>
{/if}
