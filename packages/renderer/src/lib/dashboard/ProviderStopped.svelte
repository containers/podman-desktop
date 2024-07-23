<script lang="ts">
import type { ProviderInfo } from '/@api/provider-info';

import ProviderCard from './ProviderCard.svelte';

export let provider: ProviderInfo;
</script>

<ProviderCard provider={provider}></ProviderCard>
