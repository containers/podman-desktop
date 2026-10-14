<script lang="ts">
import { SYSTEM_OVERVIEW_EXPANDED } from '@desktop-framework/api';
import { Expandable, Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import SystemOverviewContent from '/@/lib/dashboard/SystemOverviewContent.svelte';
import { ExpandableState } from '/@/lib/ui/expandable-state.svelte';
import { systemOverviewInfos } from '/@/stores/dashboard/system-overview.svelte';

import { STATUS_TEXT_CLASS } from './system-overview-utils.svelte';

const expandableState = new ExpandableState(SYSTEM_OVERVIEW_EXPANDED);
</script>

<div class="flex flex-1 flex-col bg-[var(--pd-content-card-bg)] p-5 rounded-lg">
  <Expandable bind:initialized={expandableState.initialized} bind:expanded={expandableState.expanded} onclick={expandableState.toggle.bind(expandableState)}>
    {#snippet title()}
      <div class="flex items-center gap-2">
        <span class="text-lg font-semibold text-[var(--pd-content-card-header-text)]">System Overview</span>
        {#if !expandableState.expanded}
          <Tooltip tip={$systemOverviewInfos.text} containerClass="inline-flex items-center">
            {#key $systemOverviewInfos.status.status}
              <Icon class={STATUS_TEXT_CLASS[$systemOverviewInfos.status.status]} icon={$systemOverviewInfos.status.icon} size={$systemOverviewInfos.status.status === 'progressing' ? '1.25em' : 'lg'} />
            {/key}
          </Tooltip>
        {/if}
      </div>
    {/snippet}
    <SystemOverviewContent />
  </Expandable>
</div>
