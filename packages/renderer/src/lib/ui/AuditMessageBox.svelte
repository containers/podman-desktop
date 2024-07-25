<script lang="ts">
import { faCircleInfo, faTriangleExclamation, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import type { AuditRecord, AuditResult } from '@podman-desktop/api';
import Fa from 'svelte-fa';

export let auditResult: AuditResult;

let infoRecords: AuditRecord[];
let warningRecords: AuditRecord[];
let errorRecords: AuditRecord[];

$: infoRecords = auditResult?.records.filter(record => record.type === 'info');
$: warningRecords = auditResult?.records.filter(record => record.type === 'warning');
$: errorRecords = auditResult?.records.filter(record => record.type === 'error');
</script>

{#if errorRecords && errorRecords.length > 0}
  {#each errorRecords as record}
    <div class="bg-charcoal-600 border-t-2 border-red-500 p-4 mb-2" role="alert" aria-label="error">
      <div class="flex flex-row">
        <div class="mr-3">
          <Fa size="1.1x" class="text-red-400" icon={faXmarkCircle} />
        </div>
        <div class="text-sm text-white">
          {record.record}
        </div>
      </div>
    </div>
  {/each}
{/if}

{#if warningRecords && warningRecords.length > 0}
  {#each warningRecords as record}
    <div class="bg-charcoal-600 border-t-2 border-amber-500 p-4 mb-2" role="alert" aria-label="warning">
      <div class="flex flex-row">
        <div class="mr-3">
          <Fa size="1.1x" class="flex text-amber-400" icon={faTriangleExclamation} />
        </div>
        <div class="text-sm text-white">
          {record.record}
        </div>
      </div>
    </div>
  {/each}
{/if}

{#if infoRecords && infoRecords.length > 0}
  {#each infoRecords as record}
    <div class="bg-charcoal-600 border-t-2 border-purple-500 p-4 mb-2" role="alert" aria-label="info">
      <div class="flex flex-row">
        <div class="mr-3">
          <Fa size="1.1x" class="text-purple-500" icon={faCircleInfo} />
        </div>
        <div class="text-sm text-white">
          {record.record}
        </div>
      </div>
    </div>
  {/each}
{/if}
