<script lang="ts">
import type { SecretInfo } from '@desktop-framework/api';

import ProviderInfo from '/@/lib/ui/ProviderInfo.svelte';

interface Props {
  object: SecretInfo;
}

let { object }: Props = $props();
</script>

<ProviderInfo provider={object.engineName} context={object.engineId} />
