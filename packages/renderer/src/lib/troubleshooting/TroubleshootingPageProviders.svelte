<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { providerInfos } from '/@/stores/providers';

import { type Unsubscriber } from 'svelte/store';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
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
  <TroubleshootingRepair providers="{providers}" />

  <TroubleshootingContainerEngines providers="{providers}" />
</div>
