<script lang="ts">
import type { AuditResult } from '@desktop-framework/extension-api';
import { faCircleInfo, faTriangleExclamation, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';

interface Props {
  auditResult: AuditResult;
}

const { auditResult }: Props = $props();

const infoRecords = $derived(auditResult?.records.filter(record => record.type === 'info'));
const warningRecords = $derived(auditResult?.records.filter(record => record.type === 'warning'));
const errorRecords = $derived(auditResult?.records.filter(record => record.type === 'error'));
</script>

{#if errorRecords && errorRecords.length > 0}
  {#each errorRecords as record, index (index)}
    <div
      class="bg-[var(--pd-content-bg)] text-[var(--pd-state-error)] border-t-2 border-[var(--pd-state-error)] p-4 mb-2"
      role="alert"
      aria-label="error">
      <div class="flex flex-row">
        <div class="mr-3">
          <Icon size="1.1x" class="text-[var(--pd-state-error)]" icon={faXmarkCircle} />
        </div>
        <div class="text-sm">
          {record.record}
        </div>
      </div>
    </div>
  {/each}
{/if}

{#if warningRecords && warningRecords.length > 0}
  {#each warningRecords as record, index (index)}
    <div
      class="bg-[var(--pd-content-bg)] text-[var(--pd-state-warning)] border-t-2 border-[var(--pd-state-warning)] p-4 mb-2"
      role="alert"
      aria-label="warning">
      <div class="flex flex-row">
        <div class="mr-3">
          <Icon size="1.1x" class="flex text-[var(--pd-state-warning)]" icon={faTriangleExclamation} />
        </div>
        <div class="text-sm">
          {record.record}
        </div>
      </div>
    </div>
  {/each}
{/if}

{#if infoRecords && infoRecords.length > 0}
  {#each infoRecords as record, index (index)}
    <div
      class="bg-[var(--pd-content-bg)] border-t-2 border-[var(--pd-state-info)] p-4 mb-2"
      role="alert"
      aria-label="info">
      <div class="flex flex-row">
        <div class="mr-3">
          <Icon size="1.1x" class="text-[var(--pd-state-info)]" icon={faCircleInfo} />
        </div>
        <div class="text-sm">
          {record.record}
        </div>
      </div>
    </div>
  {/each}
{/if}
