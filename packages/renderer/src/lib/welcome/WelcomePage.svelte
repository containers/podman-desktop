<script lang="ts">
import { providerInfos } from '../../stores/providers';
import { onMount } from 'svelte';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import ProviderNotInstalled from './ProviderNotInstalled.svelte';
import ProviderReady from './ProviderReady.svelte';
import ProviderInstalled from './ProviderInstalled.svelte';
import ProviderConfigured from './ProviderConfigured.svelte';
import ProviderStopped from './ProviderStopped.svelte';
import ProviderStarting from './ProviderStarting.svelte';
import NavPage from '../ui/NavPage.svelte';

$: providersNotInstalled = $providerInfos.filter(provider => provider.status === 'not-installed');
$: providersInstalled = $providerInfos.filter(provider => provider.status === 'installed');
$: providersConfigured = $providerInfos.filter(provider => provider.status === 'configured');
$: providersReady = $providerInfos.filter(provider => provider.status === 'ready' || provider.status === 'started');
$: providersStarting = $providerInfos.filter(provider => provider.status === 'starting');
$: providersStopped = $providerInfos.filter(provider => provider.status === 'stopped');
</script>

<NavPage searchEnabled="{false}" title="Dashboard" subtitle="&nbsp;">
  <div slot="empty" class="flex flex-col min-h-full bg-zinc-700">
    <div class="min-w-full flex-1">
      <div class="pt-5 px-5 space-y-5">
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
            <ProviderInstalled provider="{providerInstalled}" />
          {/each}
        {/if}

        <!-- Provider is configured but not ready, it requires a user action
          display a box to indicate how to make the provider ready -->
        {#if providersConfigured.length > 0}
          {#each providersConfigured as providerConfigured}
            <ProviderConfigured provider="{providerConfigured}" />
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
      </div>
    </div>
  </div>
</NavPage>
