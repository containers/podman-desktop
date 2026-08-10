<script lang="ts">
import { SvelteMap } from 'svelte/reactivity';

import { providerInfos } from '/@/stores/providers';

import ProviderConfigured from './ProviderConfigured.svelte';
import ProviderConfiguring from './ProviderConfiguring.svelte';
import { DoNothingMode, type InitializationContext } from './ProviderInitUtils';
import ProviderInstalled from './ProviderInstalled.svelte';
import ProviderNotInstalled from './ProviderNotInstalled.svelte';
import ProviderReady from './ProviderReady.svelte';
import ProviderStarting from './ProviderStarting.svelte';
import ProviderStopped from './ProviderStopped.svelte';

const providerInitContexts = new SvelteMap<string, InitializationContext>();

let providersNotInstalled = $derived($providerInfos.filter(provider => provider.status === 'not-installed'));
let providersInstalled = $derived($providerInfos.filter(provider => provider.status === 'installed'));
let providersConfiguring = $derived($providerInfos.filter(provider => provider.status === 'configuring'));
let providersConfigured = $derived($providerInfos.filter(provider => provider.status === 'configured'));
let providersReady = $derived(
  $providerInfos.filter(provider => provider.status === 'ready' || provider.status === 'started'),
);
let providersStarting = $derived($providerInfos.filter(provider => provider.status === 'starting'));
let providersStopped = $derived($providerInfos.filter(provider => provider.status === 'stopped'));

$effect(() => {
  for (const provider of $providerInfos) {
    if (!providerInitContexts.has(provider.internalId)) {
      providerInitContexts.set(provider.internalId, { mode: DoNothingMode });
    }
  }
});

function getInitializationContext(id: string): InitializationContext {
  return providerInitContexts.get(id) ?? { mode: DoNothingMode };
}
</script>

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