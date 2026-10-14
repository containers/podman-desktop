<script lang="ts">
import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';

import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';

interface Props {
  connections: ProviderContainerConnectionInfo[];
}

let { connections }: Props = $props();

let selected: undefined | ProviderContainerConnectionInfo = $state(undefined);
</script>

<label for="providerChoice">Container Engine</label>
<ContainerConnectionDropdown
  id="providerChoice"
  name="providerChoice"
  bind:value={selected}
  connections={connections}/>
{#if selected}
  <div role="alert">{selected.name}</div>
{/if}
