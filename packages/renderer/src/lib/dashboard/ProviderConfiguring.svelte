<script lang="ts">
import 'xterm/css/xterm.css';

import { Spinner } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import type { CheckStatus, ProviderInfo } from '/@api/provider-info';

import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { getPanelDetailColor } from '../color/color';
import Steps from '../ui/Steps.svelte';
import PreflightChecks from './PreflightChecks.svelte';
import ProviderCard from './ProviderCard.svelte';
import { type InitializationContext, InitializationSteps, InitializeAndStartMode } from './ProviderInitUtils';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';

export let provider: ProviderInfo;
export let initializationContext: InitializationContext;

let initializeError: string | undefined = undefined;

let preflightChecks: CheckStatus[] = [];

let logsXtermDiv: HTMLDivElement;
let logsTerminal;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;

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
  resizeObserver = new ResizeObserver(() => {
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

<ProviderCard provider={provider}>
  <svelte:fragment slot="content">
    <div class="flex flex-col w-full lg:w-2/3 justify-center items-center">
      {#if initializationContext.mode === InitializeAndStartMode}
        <Steps steps={InitializationSteps} />
      {/if}
      <div class="flex flex-col text-gray-700 items-center" aria-label="Transitioning State">
        <div>Initializing</div>
        <div class="my-2">
          <Spinner />
        </div>
      </div>
    </div>

    <div
      class=""
      style="background-color: {getPanelDetailColor()}; width: 100%; text-align: left; display: {initializeError
        ? 'block'
        : 'none'}"
      bind:this={logsXtermDiv}>
    </div>

    <PreflightChecks preflightChecks={preflightChecks} />
  </svelte:fragment>
  <svelte:fragment slot="update">
    {#if provider.updateInfo?.version && provider.version !== provider.updateInfo?.version}
      <ProviderUpdateButton onPreflightChecks={checks => (preflightChecks = checks)} provider={provider} />
    {/if}
  </svelte:fragment>
</ProviderCard>
