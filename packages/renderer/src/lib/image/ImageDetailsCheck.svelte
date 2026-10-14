<script lang="ts">
import type { ImageCheckerInfo } from '@desktop-framework/api';
import type { ImageInfo } from '@desktop-framework/extension-api';
import { faStethoscope } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import type { CheckUI, ProviderUI } from '/@/lib/ui/ProviderResultPage';
import ProviderResultPage from '/@/lib/ui/ProviderResultPage.svelte';
import { imageCheckerProviders } from '/@/stores/image-checker-providers';

const orderStatus = ['failed', 'success'];
const orderSeverity = ['critical', 'high', 'medium', 'low', undefined];

interface Props {
  imageInfo?: ImageInfo;
}

const { imageInfo }: Props = $props();

let providers: ProviderUI[] = $state([]);
let results: CheckUI[] = $state([]);
let cancellableTokenId: number = $state(0);

let remainingProviders: number = $state(0);
let aborted = $state(false);
let aborting = $state(false);

let providersUnsubscribe: Unsubscriber;

onMount(async () => {
  providersUnsubscribe = imageCheckerProviders.subscribe(providers => {
    callProviders(providers).catch((err: unknown) => console.error('Error calling image providers', err));
  });
});

onDestroy(async () => {
  // unsubscribe from the store
  providersUnsubscribe?.();

  await handleAbort();
});

async function callProviders(_providers: readonly ImageCheckerInfo[]): Promise<void> {
  providers = _providers.map(p => ({
    info: p,
    state: 'running',
  }));
  const sortedProvidersIds = providers.map(p => p.info.id).toSorted();
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
      .imageCheck(provider.info.id, $state.snapshot(imageInfo), cancellableTokenId)
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
        results = results.toSorted((a, b) => {
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
        window
          .telemetryTrack('imageCheck', telemetryOptions)
          .catch((err: unknown) => console.error('Error sending imageCheck telemetry', err));
      });
  });
}

async function handleAbort(): Promise<void> {
  // avoid race condition
  if (aborting) return;

  if (cancellableTokenId !== 0 && remainingProviders > 0) {
    aborting = true;
    await window.cancelToken(cancellableTokenId).finally(() => {
      aborting = false;
    });
    // reset token
    cancellableTokenId = 0;
    aborted = true;

    // update providers
    providers = providers.map(p => {
      if (p.state === 'running') {
        p.state = 'canceled';
      }
      return p;
    });

    // telemetry
    await window.telemetryTrack('imageCheck.aborted');
  }
}
</script>

<ProviderResultPage providers={providers} results={results}>
  <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
  {#snippet headerInfo()}
  <div class="flex flex-row" role="status" aria-label="Analysis Status">
    <div class="w-full flex mb-4 space-x-4">
      <Icon size="1.5x" icon={faStethoscope} />
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
        <Button on:click={handleAbort}>Cancel</Button>
      </div>
    {/if}
  </div>
  {/snippet}
</ProviderResultPage>
