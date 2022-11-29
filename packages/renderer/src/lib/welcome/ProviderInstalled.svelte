<script lang="ts">
import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import PreflightChecks from './PreflightChecks.svelte';
import ProviderLinks from './ProviderLinks.svelte';
import ProviderLogo from './ProviderLogo.svelte';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';
import { onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from '../color/color';

export let provider: ProviderInfo;
let providerToggleValue = false;

let initializeInProgress = false;

let initalizeError: string | undefined = undefined;

let preflightChecks: CheckStatus[] = [];

let noErrors = true;

let logsXtermDiv: HTMLDivElement;
let logsTerminal;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;

async function initializeProvider() {
  initalizeError = undefined;
  logsTerminal.clear();
  if (providerToggleValue) {
    initializeInProgress = true;
    try {
      await window.initializeProvider(provider.internalId);
      // wait that status is updated
      await new Promise<void>(resolve => {
        window.events.receive('provider-change', () => {
          resolve();
        });
      });
    } catch (error) {
      initalizeError = error;
      providerToggleValue = false;
      logsTerminal.write(error + '\r');
      console.error('Error while initializing the provider', error);
    }
    initializeInProgress = false;
  }
}

async function refreshTerminal() {
  // missing element, return
  if (!logsXtermDiv) {
    console.log('missing xterm div, exiting...');
    return;
  }
  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  logsTerminal = new Terminal({
    fontSize,
    lineHeight,
    disableStdin: true,
    theme: {
      background: getPanelDetailColor(),
    },
    convertEol: true,
  });
  termFit = new FitAddon();
  logsTerminal.loadAddon(termFit);

  logsTerminal.open(logsXtermDiv);
  // disable cursor
  logsTerminal.write('\x1b[?25l');

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    termFit.fit();
  });
  termFit.fit();
}

onMount(async () => {
  // Refresh the terminal on initial load
  refreshTerminal();

  // Resize the terminal each time we change the div size
  resizeObserver = new ResizeObserver(entries => {
    termFit?.fit();
  });

  // Observe the terminal div
  resizeObserver.observe(logsXtermDiv);
});

onDestroy(() => {
  // Cleanup the observer on destroy
  resizeObserver?.unobserve(logsXtermDiv);
});
</script>

<div class="p-2 flex flex-col bg-zinc-800 rounded-lg">
  <ProviderLogo provider="{provider}" />
  <div class="flex flex-col items-center text-center">
    <p class="text-xl text-gray-300">
      {provider.name}
      {#if provider.version}
        v{provider.version}
      {/if}
      is installed but not ready
    </p>
    <p class="text-base text-gray-400">
      To start working with containers, {provider.name} needs to be initialized.
    </p>
    <label for="toggle-{provider.internalId}" class="inline-flex relative items-center my-5 cursor-pointer">
      <input
        type="checkbox"
        disabled="{initializeInProgress}"
        bind:checked="{providerToggleValue}"
        on:change="{() => initializeProvider()}"
        id="toggle-{provider.internalId}"
        class="sr-only peer" />
      <div
        class="w-9 h-5 peer-focus:ring-violet-800 rounded-full peer bg-zinc-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600">
      </div>
      <span class="ml-3 text-sm font-medium text-gray-300">Initialize {provider.name}</span>
    </label>
    {#if initializeInProgress}
      <div class="flex mt-2 flex-col">
        <div>Initializing...Please Wait...</div>
        <div class="my-2">
          <i class="pf-c-button__progress">
            <span class="pf-c-spinner pf-m-md" role="progressbar">
              <span class="pf-c-spinner__clipper"></span>
              <span class="pf-c-spinner__lead-ball"></span>
              <span class="pf-c-spinner__tail-ball"></span>
            </span>
          </i>
        </div>
      </div>
    {/if}

    <div
      class=""
      style="background-color: {getPanelDetailColor()}; width: 100%; text-align: left; display: {initalizeError
        ? 'block'
        : 'none'}"
      class:h-full="{noErrors === false}"
      class:min-w-full="{noErrors === false}"
      bind:this="{logsXtermDiv}">
    </div>
  </div>

  {#if provider.updateInfo}
    <div class="mt-10 mb-1  w-full flex  justify-around">
      <ProviderUpdateButton onPreflightChecks="{checks => (preflightChecks = checks)}" provider="{provider}" />
    </div>
  {/if}
  <PreflightChecks preflightChecks="{preflightChecks}" />

  <div class="mt-10 mb-1  w-full flex  justify-around"></div>
  <ProviderLinks provider="{provider}" />
</div>
