<script lang="ts">
import { NavPage } from '@podman-desktop/ui-svelte';

import ProviderConfiguring from '/@/lib/dashboard/ProviderConfiguring.svelte';
import ExtensionBanners from '/@/lib/recommendation/ExtensionBanners.svelte';

import { providerInfos } from '../../stores/providers';
import LearningCenter from '../learning-center/LearningCenter.svelte';
import NotificationsBox from './NotificationsBox.svelte';
import ProviderConfigured from './ProviderConfigured.svelte';
import type { InitializationContext } from './ProviderInitUtils';
import { DoNothingMode } from './ProviderInitUtils';
import ProviderInstalled from './ProviderInstalled.svelte';
import ProviderNotInstalled from './ProviderNotInstalled.svelte';
import ProviderReady from './ProviderReady.svelte';
import ProviderStarting from './ProviderStarting.svelte';
import ProviderStopped from './ProviderStopped.svelte';

const providerInitContexts = new Map<string, InitializationContext>();

$: providersNotInstalled = $providerInfos.filter(provider => provider.status === 'not-installed');
$: providersInstalled = $providerInfos.filter(provider => provider.status === 'installed');
$: providersConfiguring = $providerInfos.filter(provider => provider.status === 'configuring');
$: providersConfigured = $providerInfos.filter(provider => provider.status === 'configured');
$: providersReady = $providerInfos.filter(provider => provider.status === 'ready' || provider.status === 'started');
$: providersStarting = $providerInfos.filter(provider => provider.status === 'starting');
$: providersStopped = $providerInfos.filter(provider => provider.status === 'stopped');

function getInitializationContext(id: string): InitializationContext {
  let context: InitializationContext | undefined = providerInitContexts.get(id);

  if (!context) {
    context = { mode: DoNothingMode };
    providerInitContexts.set(id, context);
  }
  return context;
}
</script>

<NavPage searchEnabled={false} title="Dashboard">
  <div slot="content" class="flex flex-col min-w-full h-full bg-[var(--pd-content-bg)] shadow-nav py-5">
    <div class="min-w-full flex-1">
      <NotificationsBox />
      <div class="px-5 space-y-5 h-full">
        <!-- Provider is ready display a box to indicate some information -->
        {#if providersReady.length > 0}
          {#each providersReady as providerReady (providerReady.internalId)}
            <ProviderReady provider={providerReady} />
          {/each}
        {/if}

        <!-- Provider is starting -->
        {#if providersStarting.length > 0}
          {#each providersStarting as providerStarting (providerStarting.internalId)}
            <ProviderStarting provider={providerStarting} />
          {/each}
        {/if}

        <!-- Provider is installed but not ready, it requires a user action
          display a box to indicate how to make the provider ready -->
        {#if providersInstalled.length > 0}
          {#each providersInstalled as providerInstalled (providerInstalled.internalId)}
            <ProviderInstalled
              provider={providerInstalled}
              initializationContext={getInitializationContext(providerInstalled.internalId)} />
          {/each}
        {/if}

        <!-- Provider is configuring -->
        {#if providersConfiguring.length > 0}
          {#each providersConfiguring as providerConfiguring (providerConfiguring.internalId)}
            <ProviderConfiguring
              provider={providerConfiguring}
              initializationContext={getInitializationContext(providerConfiguring.internalId)} />
          {/each}
        {/if}

        <!-- Provider is configured but not ready, it requires a user action
          display a box to indicate how to make the provider ready /* (providerConfigured.internalId)*/-->
        {#if providersConfigured.length > 0}
          {#each providersConfigured as providerConfigured (providerConfigured.internalId)}
            <ProviderConfigured
              provider={providerConfigured}
              initializationContext={getInitializationContext(providerConfigured.internalId)} />
          {/each}
        {/if}

        <!-- Provider is not installed, display a box to indicate how to install from the tool if possible -->
        {#if providersNotInstalled.length > 0}
          {#each providersNotInstalled as providerNotInstalled (providerNotInstalled.internalId)}
            <ProviderNotInstalled provider={providerNotInstalled} />
          {/each}
        {/if}

        <!-- Provider is stopped -->
        {#if providersStopped.length > 0}
          {#each providersStopped as providerStopped (providerStopped.internalId)}
            <ProviderStopped provider={providerStopped} />
          {/each}
        {/if}
        <LearningCenter />
        <ExtensionBanners />
      </div>
    </div>
  </div>
</NavPage>
