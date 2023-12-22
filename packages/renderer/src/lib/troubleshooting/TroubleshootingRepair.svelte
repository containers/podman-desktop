<script lang="ts">
import { faWrench } from '@fortawesome/free-solid-svg-icons';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import Fa from 'svelte-fa';
import TroubleshootingRepairCleanup from './TroubleshootingRepairCleanup.svelte';

export let providers: ProviderInfo[] = [];
</script>

<div class="flex flex-col w-full bg-charcoal-600 p-4 rounded-lg">
  <div class="flex flex-row w-full pb-2 items-center">
    <Fa size="24" class="pr-2 text-gray-700" icon="{faWrench}" />
    <div class="text-xl" aria-label="Repair">Repair</div>
  </div>

  <TroubleshootingRepairCleanup providers="{providers}" />
</div>
