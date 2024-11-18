<script lang="ts">
import { faCheckCircle, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { CloseButton, Link, Spinner } from '@podman-desktop/ui-svelte';
import { toast } from '@zerodevx/svelte-toast';
import Fa from 'svelte-fa';

import type { TaskInfo } from '/@api/taskInfo';

interface Props {
  toastId: number;
  taskInfo: TaskInfo;
  onpop?: () => void;
}

let { toastId, taskInfo, onpop = () => {} }: Props = $props();

const closeAction = (): void => {
  toast.pop(toastId);
  onpop();
};

const executeAction = async (): Promise<void> => {
  await window.executeTask(taskInfo.id);
};
</script>

<div
  class="flex min-h-10 cursor-default max-h-30 max-w-[var(--toastWidth)] flex-col p-2 border-[var(--pd-button-tab-border-selected)] border rounded-md bg-[var(--pd-modal-bg)]"
  title={taskInfo.name}
>
  <div class="mb-1 flex flex-row items-center">
    <div
      class="mr-1 text-[var(--pd-state-info)]"
      role="status"
      aria-label={taskInfo.status}
    >
      {#if taskInfo.status === 'in-progress'}
        <Spinner size="1em"/>
      {:else if taskInfo.status === 'success'}
        <Fa icon={faCheckCircle} />
      {:else if taskInfo.status === 'failure'}
        <Fa icon={faCircleExclamation} class="text-[var(--pd-state-error)]" />
      {/if}
    </div>

    <div class="font-bold text-ellipsis line-clamp-1 overflow-hidden text-[var(--pd-modal-text)]">
      {taskInfo.name}
    </div>

    {#if taskInfo.progress && taskInfo.status === 'in-progress'}
      <span class="ml-1">{taskInfo.progress}%</span>
    {/if}

    <div class="flex flex-grow flex-col items-end">
      <CloseButton on:click={closeAction} />
    </div>
  </div>
  <div class="flex flex-row items-center italic line-clamp-4">
    {#if taskInfo.error}
      <p class="flex-1 text-sm line-clamp-4 text-[var(--pd-state-error)]">
        {taskInfo.error}
      </p>
    {:else}
    <p class="flex-1 text-sm text-ellipsis overflow-hidden text-[var(--pd-modal-text)]">
      {taskInfo.name}
    </p>
    {/if}
  </div>
  {#if taskInfo.action}
    <div class="text-right text-xs text-[var(--pd-content-text)]">
      <Link onclick={executeAction}>{taskInfo.action}</Link>
    </div>
  {/if}
</div>
