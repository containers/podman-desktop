<script lang="ts">
import { faStethoscope } from '@fortawesome/free-solid-svg-icons';
import type { ImageInfo } from '@podman-desktop/api';
import { Button } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';

import { imageCheckerProviders } from '/@/stores/image-checker-providers';
import type { ImageCheckerInfo } from '/@api/image-checker-info';

import { type CheckUI, type ProviderUI } from '../ui/ProviderResultPage';
import ProviderResultPage from '../ui/ProviderResultPage.svelte';

const orderStatus = ['failed', 'success'];
const orderSeverity = ['critical', 'high', 'medium', 'low', undefined];

export let imageInfo: ImageInfo | undefined;

let providers: ProviderUI[];
let results: CheckUI[] = [];
let cancellableTokenId: number = 0;

let remainingProviders: number;
let aborted = false;

let providersUnsubscribe: Unsubscriber;

onMount(async () => {
  providersUnsubscribe = imageCheckerProviders.subscribe(providers => {
    callProviders(providers);
  });
});

onDestroy(() => {
  // unsubscribe from the store
  providersUnsubscribe?.();

  handleAbort();
});

async function callProviders(_providers: readonly ImageCheckerInfo[]) {
  providers = _providers.map(p => ({
    info: p,
    state: 'running',
  }));
  const sortedProvidersIds = providers.map(p => p.info.id).sort();
  cancellableTokenId = await window.getCancellableTokenSource();
  remainingProviders = providers.length;

  providers.forEach(provider => {
    if (!imageInfo) {
      return;
    }
    let telemetryOptions = {
      provider: provider.info.label,
      error: '',
    };
    window
      .imageCheck(provider.info.id, imageInfo, cancellableTokenId)
      .then(_result => {
        // we test if it is still running, as it could have been marked as 'canceled'
        if (provider.state === 'running') {
          provider.state = 'success';
        }
        providers = providers;
        remainingProviders--;
        _result?.checks.forEach(check => {
          results.push({
            provider: provider.info,
            check,
          });
        });
        results.sort((a, b) => {
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

          const providerA = sortedProvidersIds.indexOf(a.provider.id);
          const providerB = sortedProvidersIds.indexOf(b.provider.id);
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
          provider.state = 'failed';
          provider.error = error;
          providers = providers;
          remainingProviders--;
        }
      })
      .finally(() => {
        window.telemetryTrack('imageCheck', telemetryOptions);
      });
  });
}

function handleAbort() {
  if (cancellableTokenId !== 0 && remainingProviders > 0) {
    window.cancelToken(cancellableTokenId);
    providers = providers.map(p => {
      if (p.state === 'running') {
        p.state = 'canceled';
      }
      return p;
    });
    aborted = true;
    window.telemetryTrack('imageCheck.aborted');
    cancellableTokenId = 0;
  }
}
</script>

<ProviderResultPage providers={providers} results={results}>
  <div class="flex flex-row" slot="header-info">
    <div class="w-full flex mb-4 space-x-4">
      <Fa size="1.5x" icon={faStethoscope} />
      {#if aborted}
        <span>Image analysis canceled</span>
      {:else if remainingProviders > 0}
        <span>Image analysis in progress...</span>
      {:else}
        <span>Image analysis complete</span>
      {/if}
    </div>
    {#if remainingProviders > 0}
      <div class="mr-4">
        <Button on:click={() => handleAbort()}>Cancel</Button>
      </div>
    {/if}
  </div>
</ProviderResultPage>
