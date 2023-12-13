<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import ProviderCard from './ProviderCard.svelte';

export let provider: ProviderInfo;
</script>

<ProviderCard provider="{provider}"></ProviderCard>
