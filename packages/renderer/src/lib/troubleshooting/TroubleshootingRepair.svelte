<script lang="ts">
import { faWrench } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import type { ProviderInfo } from '/@api/provider-info';

import TroubleshootingRepairCleanup from './TroubleshootingRepairCleanup.svelte';

export let providers: ProviderInfo[] = [];
</script>

<div class="flex flex-col w-full bg-charcoal-600 p-4 rounded-lg">
  <div class="flex flex-row w-full pb-2 items-center">
    <Fa size="1.5x" class="pr-2 text-gray-700" icon={faWrench} />
    <div class="text-xl" aria-label="Repair">Repair</div>
  </div>

  <TroubleshootingRepairCleanup providers={providers} />
</div>
