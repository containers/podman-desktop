<script lang="ts">
import '@xterm/xterm/css/xterm.css';

import type { CheckStatus, ProviderInfo } from '@desktop-framework/api';
import { TerminalSettings } from '@desktop-framework/api/terminal';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Button, Spinner } from '@podman-desktop/ui-svelte';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { onDestroy, onMount } from 'svelte';

import { getTerminalTheme } from '/@/lib/terminal/terminal-theme';
import Steps from '/@/lib/ui/Steps.svelte';

import PreflightChecks from './PreflightChecks.svelte';
import ProviderCard from './ProviderCard.svelte';
import {
  type InitializationContext,
  type InitializationMode,
  InitializationSteps,
  InitializeAndStartMode,
  InitializeOnlyMode,
} from './ProviderInitUtils';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';
import ProviderWarnings from './ProviderWarnings.svelte';

interface Props {
  provider: ProviderInfo;
  initializationContext: InitializationContext;
}

let { provider, initializationContext }: Props = $props();

let initializeInProgress = $state<boolean>(false);

let userToggle = $state<boolean>();

let initializeError = $state<string>();

let preflightChecks = $state<CheckStatus[]>([]);

let logsXtermDiv: HTMLDivElement;
let logsTerminal: Terminal;

// Terminal resize
let resizeObserver: ResizeObserver;
let termFit: FitAddon;
let installationOptionsMenuVisible = $state<boolean>(false);
let installationOptionSelected = $state<InitializationMode>(InitializeAndStartMode);
let checksInProgress = $state<boolean>(false);

async function runChecks(): Promise<void> {
  checksInProgress = true;
  preflightChecks = [];
  let currentCheck: CheckStatus;
  try {
    await window.runInstallPreflightChecks(provider.internalId, {
      startCheck: (status: CheckStatus): void => {
        currentCheck = status;
        preflightChecks = [...preflightChecks, currentCheck];
      },
      endCheck: (status: CheckStatus): void => {
        if (currentCheck) {
          currentCheck = status;
        }
        preflightChecks = [...preflightChecks.slice(0, -1), currentCheck];
      },
    });
  } catch (err) {
    console.error(err);
  }
  checksInProgress = false;
}

// no initialize support, hide the button
let initializationButtonVisible = $derived(
  userToggle ??
    (provider.containerProviderConnectionInitialization || provider.kubernetesProviderConnectionInitialization),
);

function showLastExecutionError(): void {
  initializeError = initializationContext.error;
  logsTerminal?.write('Initialization failed. Please check the error below and try again' + '\r\n');
  logsTerminal?.write(initializeError + '\r');
}

async function initializeProvider(): Promise<void> {
  initializeError = undefined;
  logsTerminal.clear();
  initializeInProgress = true;
  initializationContext.promise = window.initializeProvider(provider.internalId);
  initializationContext.promise.catch((error: unknown) => {
    initializationContext.error = String(error);
    userToggle = true;
    logsTerminal.write(error + '\r');
    console.error('Error while initializing the provider', error);
  });
  initializeInProgress = false;
}

async function refreshTerminal(): Promise<void> {
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

  const scrollback = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.Scrollback,
  );

  logsTerminal = new Terminal({
    fontSize,
    lineHeight,
    disableStdin: true,
    theme: getTerminalTheme(),
    convertEol: true,
    scrollback,
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
  await refreshTerminal();
  // show error if last execution failed
  showLastExecutionError();

  // Resize the terminal each time we change the div size
  resizeObserver = new ResizeObserver(() => {
    termFit?.fit();
  });

  // Observe the terminal div
  resizeObserver.observe(logsXtermDiv);
});

onDestroy(() => {
  // Cleanup the observer on destroy
  resizeObserver?.disconnect();
});

function updateOptionsMenu(visible: boolean): void {
  installationOptionsMenuVisible = visible;
}

async function onInstallationClick(): Promise<void> {
  initializeInProgress = true;
  userToggle = false;
  initializationContext.mode = installationOptionSelected as InitializationMode;
  await initializeProvider();
}
</script>

<ProviderCard provider={provider}>
  {#snippet content()}
    <p class="text-sm text-[var(--pd-content-text)] w-2/3 text-center" aria-label="Suggested Actions">
      To start working with containers, {provider.name} needs to be initialized.
    </p>

    <ProviderWarnings provider={provider} />

    <div class="flex space-x-2 mb-2">
      {#if provider.installationSupport}
        <Button
          icon={faList}
          inProgress={checksInProgress}
          on:click={runChecks}>
          Run checks
        </Button>
      {/if}
    </div>

    <div class="min-w-[230px] w-1/3 flex justify-center" class:hidden={!initializationButtonVisible}>
      <div class="w-[212px] relative">
        <div class="bg-[var(--pd-invert-content-card-bg)] text-[var(--pd-button-text)] flex w-[212px]">
          <button
            class="float-left bg-[var(--pd-button-primary-bg)] hover:bg-[var(--pd-button-primary-hover-bg)] pt-2 pr-3 pl-3 pb-2 text-[13px] text-[var(--pd-button-text)] mr-px w-[180px]"
            onclick={onInstallationClick}>
            {installationOptionSelected}
          </button>
          <button
            class="inline-block bg-[var(--pd-button-primary-bg)] hover:bg-[var(--pd-button-primary-hover-bg)] text-[13px] text-[var(--pd-button-text)] pt-2 pr-3 pl-3 pb-2 w-[32px]"
            aria-label="Installation options menu"
            onclick={(): void => updateOptionsMenu(!installationOptionsMenuVisible)}>
            <i class="fas fa-caret-down"></i>
          </button>
        </div>
        <div
          class="z-10 min-w-[130px] m-auto bg-primary text-[13px] text-[var(--pd-button-text)] absolute w-full"
          class:hidden={!installationOptionsMenuVisible}>
          <ul class="w-full outline-hidden bg-[var(--pd-dropdown-bg)] rounded-xs placeholder-[var(--pd-content-text)]">
            <li>
              <button
                class="w-full p-2 bg-[var(--pd-button-primary-bg)] text-[var(--pd-button-text)] hover:bg-[var(--pd-button-primary-hover-bg)] cursor-pointer"
                onclick={(): void => {
                  installationOptionSelected = InitializeOnlyMode;
                  installationOptionsMenuVisible = false;
                }}>
                {InitializeOnlyMode}
                {provider.name}
              </button>
            </li>
            <li>
              <button
                class="w-full p-2 bg-[var(--pd-button-primary-bg)] text-[var(--pd-button-text)] hover:bg-[var(--pd-button-primary-hover-bg)] cursor-pointer"
                onclick={(): void => {
                  installationOptionSelected = InitializeAndStartMode;
                  installationOptionsMenuVisible = false;
                }}>
                {InitializeAndStartMode}
                {provider.name}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="flex flex-col w-full lg:w-2/3 justify-center items-center" class:hidden={!initializeInProgress}>
      {#if installationOptionSelected === InitializeAndStartMode}
        <Steps steps={InitializationSteps} />
      {/if}
      <div class="flex flex-col text-[var(--pd-content-text)]">
        <div>Initializing</div>
        <div class="my-2">
          <Spinner />
        </div>
      </div>
    </div>

    <div
      class="bg-[var(--pd-terminal-background)] p-[5px] pr-0"
      style="width: 100%; text-align: left; display: {initializeError ? 'block' : 'none'}"
      bind:this={logsXtermDiv}>
    </div>

    <PreflightChecks preflightChecks={preflightChecks} />
  {/snippet}
  {#snippet update()}
    {#if provider.updateInfo?.version && provider.version !== provider.updateInfo?.version}
      <ProviderUpdateButton onPreflightChecks={(checks): CheckStatus[] => (preflightChecks = checks)} provider={provider} />
    {/if}
  {/snippet}
</ProviderCard>
