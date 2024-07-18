<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { type Unsubscriber } from 'svelte/store';

import { providerInfos } from '/@/stores/providers';
import type { ProviderInfo } from '/@api/provider-info';

import TroubleshootingContainerEngines from './TroubleshootingContainerEngines.svelte';
import TroubleshootingRepair from './TroubleshootingRepair.svelte';

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

<div class="flex flex-col w-full m-4 space-y-4">
  <TroubleshootingRepair providers={providers} />

  <TroubleshootingContainerEngines providers={providers} />
</div>
