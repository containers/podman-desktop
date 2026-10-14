<script lang="ts">
import type { ProviderInfo } from '@desktop-framework/api';

import ProviderCard from './ProviderCard.svelte';

interface Props {
  provider: ProviderInfo;
}
let { provider }: Props = $props();
</script>

<ProviderCard provider={provider}></ProviderCard>
