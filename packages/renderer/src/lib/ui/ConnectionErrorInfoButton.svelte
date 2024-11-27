<script lang="ts">
import type { IConnectionStatus } from '../preferences/Util';

export let status: IConnectionStatus | undefined;

async function showTaskManager(): Promise<void> {
  // call the command show-task-manager'
  await window.executeCommand('show-task-manager');
}
</script>

{#if status?.action && status?.error}
  <button
    aria-label="{status.action} failed"
    class="ml-3 text-[9px] text-[var(--pd-state-error)] underline"
    on:click={showTaskManager}>{status.action} failed</button>
{/if}
