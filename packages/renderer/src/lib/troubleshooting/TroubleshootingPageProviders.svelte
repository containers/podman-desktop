<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { providerInfos } from '/@/stores/providers';

import { type Unsubscriber } from 'svelte/store';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import TroubleshootingContainerEngines from './TroubleshootingContainerEngines.svelte';

let providers: ProviderInfo[] = [];

let providersUnsubscribe: Unsubscriber;

onMount(() => {
  providersUnsubscribe = providerInfos.subscribe(value => {
    providers = value;
  });
});

onDestroy(() => {
  providersUnsubscribe?.();
});
</script>

<TroubleshootingContainerEngines providers="{providers}" />
