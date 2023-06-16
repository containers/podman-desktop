<script lang="ts">
import { providerInfos } from '../../stores/providers';
import ProviderNotInstalled from './ProviderNotInstalled.svelte';
import ProviderReady from './ProviderReady.svelte';
import ProviderInstalled from './ProviderInstalled.svelte';
import ProviderConfigured from './ProviderConfigured.svelte';
import ProviderStopped from './ProviderStopped.svelte';
import ProviderStarting from './ProviderStarting.svelte';
import NavPage from '../ui/NavPage.svelte';
import type { InitializationContext } from './ProviderInitUtils';
import { InitializeAndStartMode } from './ProviderInitUtils';
import FeaturedExtensions from '/@/lib/featured/FeaturedExtensions.svelte';
import ProviderConfiguring from '/@/lib/dashboard/ProviderConfiguring.svelte';

const providerInitContexts = new Map<string, InitializationContext>();

$: providersNotInstalled = $providerInfos.filter(provider => provider.status === 'not-installed');
$: providersInstalled = $providerInfos.filter(provider => provider.status === 'installed');
$: providersConfiguring = $providerInfos.filter(provider => provider.status === 'configuring');
$: providersConfigured = $providerInfos.filter(provider => provider.status === 'configured');
$: providersReady = $providerInfos.filter(provider => provider.status === 'ready' || provider.status === 'started');
$: providersStarting = $providerInfos.filter(provider => provider.status === 'starting');
$: providersStopped = $providerInfos.filter(provider => provider.status === 'stopped');

function getInitializationContext(id: string) {
  let context: InitializationContext;

  if (providerInitContexts.has(id)) {
    context = providerInitContexts.get(id);
  } else {
    context = { mode: InitializeAndStartMode };
    providerInitContexts.set(id, context);
  }
  return context;
}
</script>

<NavPage searchEnabled="{false}" title="Dashboard">
  <div slot="content" class="flex flex-col h-full bg-charcoal-700 shadow-nav pt-5 overflow-hidden">
    <div class="min-w-full flex-1 overflow-auto">
      <div class="px-5 space-y-5 h-full">
        <!-- Provider is ready display a box to indicate some information -->
        {#if providersReady.length > 0}
          {#each providersReady as providerReady}
            <ProviderReady provider="{providerReady}" />
          {/each}
        {/if}

        <!-- Provider is starting -->
        {#if providersStarting.length > 0}
          {#each providersStarting as providerStarting}
            <ProviderStarting provider="{providerStarting}" />
          {/each}
        {/if}

        <!-- Provider is installed but not ready, it requires a user action
          display a box to indicate how to make the provider ready -->
        {#if providersInstalled.length > 0}
          {#each providersInstalled as providerInstalled}
            <ProviderInstalled
              provider="{providerInstalled}"
              initializationContext="{getInitializationContext(providerInstalled.internalId)}" />
          {/each}
        {/if}

        <!-- Provider is configuring -->
        {#if providersConfiguring.length > 0}
          {#each providersConfiguring as providerConfiguring}
            <ProviderConfiguring
              provider="{providerConfiguring}"
              initializationContext="{getInitializationContext(providerConfiguring.internalId)}" />
          {/each}
        {/if}

        <!-- Provider is configured but not ready, it requires a user action
          display a box to indicate how to make the provider ready -->
        {#if providersConfigured.length > 0}
          {#each providersConfigured as providerConfigured}
            <ProviderConfigured
              provider="{providerConfigured}"
              initializationContext="{getInitializationContext(providerConfigured.internalId)}" />
          {/each}
        {/if}

        <!-- Provider is not installed, display a box to indicate how to install from the tool if possible -->
        {#if providersNotInstalled.length > 0}
          {#each providersNotInstalled as providerNotInstalled}
            <ProviderNotInstalled provider="{providerNotInstalled}" />
          {/each}
        {/if}

        <!-- Provider is stopped -->
        {#if providersStopped.length > 0}
          {#each providersStopped as providerStopped}
            <ProviderStopped provider="{providerStopped}" />
          {/each}
        {/if}

        <FeaturedExtensions />
      </div>
    </div>
  </div>
</NavPage>
