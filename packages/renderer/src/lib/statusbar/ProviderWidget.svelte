<script lang="ts">
import type { ProviderInfo } from '@desktop-framework/api';
import { Tooltip } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import ProviderButton from '/@/lib/statusbar/ProviderButton.svelte';

import ProviderWidgetStatus from './ProviderWidgetStatus.svelte';
import ProviderWidgetStatusStyle from './ProviderWidgetStatusStyle.svelte';

interface Props {
  entry: ProviderInfo;
  command?: () => void;
  disableTooltip?: boolean;
  class?: string;
  tooltipTopRight?: boolean;
}

let {
  entry,
  command = (): void => router.goto(`/preferences/resources?focus=${entry.id}`),
  disableTooltip = false,
  class: className,
  tooltipTopRight = false,
}: Props = $props();

let connections = $derived.by(() => {
  if (entry.containerConnections.length > 0) {
    return entry.containerConnections;
  } else if (entry.kubernetesConnections.length > 0) {
    return entry.kubernetesConnections;
  } else if (entry.vmConnections.length > 0) {
    return entry.vmConnections;
  } else {
    return [entry];
  }
});
</script>

<Tooltip top={!tooltipTopRight} topRight={tooltipTopRight}>
  {#snippet tipSnippet()}
    <div hidden={disableTooltip}>
      <div class="flex flex-col">
        {#if entry.updateInfo?.version}
          <div class="flex flex-row h-fit pb-1">
            Update available
          </div>
        {/if}
        {#each connections as connection (connection.name)}
          <div class="flex flex-row items-center h-fit">
            <ProviderWidgetStatus status={connection.status} class="mr-1"/>
            <ProviderWidgetStatusStyle status={connection.status}/>
            : {connection.name}
          </div>
        {/each}
      </div>
    </div>
  {/snippet}
  <ProviderButton
    class={className}
    provider={entry}
    onclick={command}
  />
</Tooltip>
