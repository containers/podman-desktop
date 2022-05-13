<script lang="ts">
import type { Registry } from '@tmpwip/extension-api';

import { onMount, tick } from 'svelte';
import { router } from 'tinro';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import type { ProviderInfo } from '../../../../preload/src/api/provider-info';
import { TerminalSettings } from '../../../../preload/src/terminal-settings';

import { providerInfos } from '../../stores/providers';
import NoContainerEngineEmptyScreen from './NoContainerEngineEmptyScreen.svelte';

let logsPull;
let pullError = '';
let pullInProgress = false;
let pullFinished = false;
let imageToPull = {
  name: undefined,
  registryServerUrl: undefined,
};

let providers: ProviderInfo[] = [];
$: providerConnections = providers
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');
$: selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;

$: initTerminal();

let terminalIntialized = false;

let gotErrorDuringPull = false;
function callback(name: string, data: string) {
  if (name === 'first-message') {
    // clear on the first message
    logsPull?.clear();
    logsPull?.reset();
  } else if (name === 'data') {
    // parse JSON message
    const jsonObject = JSON.parse(data);
    if (jsonObject.status) {
      logsPull.write(jsonObject.status + '\n\r');
    } else if (jsonObject.error) {
      gotErrorDuringPull = true;
      logsPull.write(jsonObject.error.replaceAll('\n', '\n\r') + '\n\r');
    }
  } else if (name === 'end') {
    if (!gotErrorDuringPull) {
      pullFinished = true;
    }
    pullInProgress = false;
  }
}
let pullLogsXtermDiv: HTMLDivElement;

function initTerminal() {
  if (terminalIntialized) {
    return;
  }

  // missing element, return
  if (!pullLogsXtermDiv) {
    return;
  }

  // grab font size
  const fontSize = window.getConfigurationValue<number>(TerminalSettings.SectionName + '.' + TerminalSettings.FontSize);
  const lineHeight = window.getConfigurationValue<number>(
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
  gotErrorDuringPull = false;
  await tick();
  initTerminal();
  await tick();
  logsPull?.reset();

  pullInProgress = true;
  try {
    await window.pullImage(selectedProviderConnection, imageToPull.name, callback);
  } catch (error) {
    pullError = error;
  }
}

async function pullImageFinished() {
  router.goto('/images');
}

async function gotoManageRegistries() {
  router.goto('/preferences/registries');
}

onMount(() => {
  providerInfos.subscribe(value => {
    providers = value;
  });
});

let imageNameInvalid = 'Please enter a value';
function validateImageName(event: any): void {
  const userValue = event.target.value;
  if (userValue === '' || userValue === undefined) {
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
  <div class="flex p-4">
    <button on:click="{() => gotoManageRegistries()}" class="pf-c-button pf-m-primary" type="button">
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-cog" aria-hidden="true"></i>
      </span>
      Manage registries
    </button>
  </div>
  <hr />

  <div class="px-6 pt-2 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
    <h3 class="text-xl font-medium  :text-white">Pull Image From a Registry</h3>

    <form novalidate class="pf-c-form pf-m-horizontal-on-sm">
      <div class="pf-c-form__group">
        <div class="pf-c-form__group-label">
          <label class="pf-c-form__label" for="form-horizontal-custom-breakpoint-name">
            <span class="pf-c-form__label-text">Image to Pull:</span>
            <span class="pf-c-form__label-required" aria-hidden="true">&#42;</span>
          </label>
        </div>
        <div class="pf-c-form__group-control">
          <input
            class="pf-c-form-control"
            type="text"
            name="serverUrl"
            disabled="{pullFinished || pullInProgress}"
            on:input="{event => validateImageName(event)}"
            bind:value="{imageToPull.name}"
            aria-invalid="{!!imageNameInvalid}"
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
                    class="w-auto border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
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
              disabled="{!!imageNameInvalid || pullInProgress}"
              type="button"
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
            <button class="pf-c-button pf-m-primary" type="button" on:click="{() => pullImageFinished()}"> Done</button>
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
  <div bind:this="{pullLogsXtermDiv}"></div>
{/if}
