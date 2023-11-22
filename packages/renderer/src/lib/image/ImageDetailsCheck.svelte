<script lang="ts">
import type { ImageCheck } from '@podman-desktop/api';
import type { ImageCheckerInfo } from '../../../../main/src/plugin/api/image-checker-info';
import type { ImageInfoUI } from './ImageInfoUI';
import Markdown from '../markdown/Markdown.svelte';
import Fa from 'svelte-fa';
import { faCheckCircle, faExclamationCircle, faStethoscope } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button.svelte';
import WarningMessage from '../ui/WarningMessage.svelte';
import type { Unsubscriber } from 'svelte/store';
import { onDestroy, onMount } from 'svelte';
import { imageCheckerProviders } from '/@/stores/image-checker-providers';

export let image: ImageInfoUI;

interface CheckUI {
  provider: ImageCheckerInfo;
  check: ImageCheck;
}

interface ProviderError {
  provider: ImageCheckerInfo;
  error: Error;
}

let providers: ImageCheckerInfo[];
let results: CheckUI[] = [];
let cancellableTokenId: number = 0;

let remainingProviders: number;
let aborted = false;
let providerErrors: ProviderError[];

let providersUnsubscribe: Unsubscriber;

onMount(async () => {
  providerErrors = [];
  providersUnsubscribe = imageCheckerProviders.subscribe(providers => {
    callProviders(providers);
  });
});

onDestroy(() => {
  // unsubscribe from the store
  providersUnsubscribe?.();
});

async function callProviders(_providers: readonly ImageCheckerInfo[]) {
  providers = [..._providers];
  cancellableTokenId = await window.getCancellableTokenSource();
  remainingProviders = providers.length;

  _providers.forEach(provider => {
    let telemetryOptions = {
      provider: provider.label,
      error: '',
    };
    window
      .imageCheck(provider.id, image.name, cancellableTokenId)
      .then(_result => {
        remainingProviders--;
        _result?.checks.forEach(check => {
          results.push({
            provider,
            check,
          });
        });
        results.sort((a, b) => {
          const orderStatus = ['failed', 'success'];
          const orderSeverity = ['critical', 'high', 'medium', 'low', undefined];
          const orderProvider = providers.map(p => p.id).sort();

          const statusA = orderStatus.indexOf(a.check.status);
          const statusB = orderStatus.indexOf(b.check.status);
          if (statusA !== statusB) {
            return statusA - statusB;
          }

          const severityA = orderSeverity.indexOf(a.check.severity);
          const severityB = orderSeverity.indexOf(b.check.severity);
          if (severityA !== severityB) {
            return severityA - severityB;
          }

          const providerA = orderProvider.indexOf(a.provider.id);
          const providerB = orderProvider.indexOf(b.provider.id);
          if (providerA !== providerB) {
            return providerA - providerB;
          }
          return 0;
        });
        results = [...results];
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          telemetryOptions.error = String(error);
          remainingProviders--;
          providerErrors = [
            ...providerErrors,
            {
              provider,
              error,
            },
          ];
        }
      })
      .finally(() => {
        window.telemetryTrack('imageCheck', telemetryOptions);
      });
  });
}

function handleAbort() {
  if (cancellableTokenId !== 0) {
    window.cancelToken(cancellableTokenId);
  }
  aborted = true;
  window.telemetryTrack('imageCheck.aborted');
}
</script>

{#if remainingProviders > 0}
  <div class="flex m-5">
    <Fa size="18" class="cursor-pointer" icon="{faStethoscope}" /><span class="ml-2"
      >Analyzing your image, {remainingProviders}
      {remainingProviders > 1 ? 'checkers' : 'checker'} still working...</span>
  </div>
  <div class="text-center">
    <Button on:click="{() => handleAbort()}">Abort</Button>
  </div>
{/if}
{#if aborted}
  <div class="m-5">
    <WarningMessage error="Check aborted, partial results only" />
  </div>
{/if}
<div class="h-full overflow-y-auto">
  {#if providerErrors?.length}
    <div class="m-5">
      {#each providerErrors as providerError}
        <WarningMessage error="{providerError.provider.label}: {providerError.error}" />
      {/each}
    </div>
  {/if}
  {#each results as result}
    <div class="bg-charcoal-700 rounded-lg m-2 p-2">
      <div
        class="p-1 flex flex-row items-center {$$props.class}"
        class:text-red-500="{result.check.status === 'failed'}"
        class:text-green-400="{result.check.status === 'success'}">
        <span
          class:text-red-500="{result.check.status === 'failed'}"
          class:text-green-400="{result.check.status === 'success'}">
          <Fa
            size="18"
            class="cursor-pointer"
            icon="{result.check.status === 'failed' ? faExclamationCircle : faCheckCircle}" />
        </span>
        <div role="alert" aria-label="Error Message Content" class="ml-2">{result.check.name}</div>
        {#if result.check.severity}
          <div
            class="text-white text-sm px-1 ml-2 rounded-lg"
            class:bg-red-900="{result.check.severity === 'critical'}"
            class:bg-red-600="{result.check.severity === 'high'}"
            class:bg-amber-600="{result.check.severity === 'medium'}"
            class:bg-gray-700="{result.check.severity === 'low'}">
            {result.check.severity}
          </div>
          <div class=""></div>
        {/if}
        <div class="flex-auto text-right text-gray-900 text-sm">Reported by {result.provider.label}</div>
      </div>

      {#if result.check.markdownDescription}
        <div class="ml-8">
          <Markdown>{result.check.markdownDescription}</Markdown>
        </div>
      {/if}
    </div>
  {/each}
</div>
