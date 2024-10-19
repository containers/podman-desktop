
<script lang="ts">
import { faCheckCircle, faCircleExclamation, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { CloseButton, Link } from '@podman-desktop/ui-svelte';
import { toast } from '@zerodevx/svelte-toast';
import Fa from 'svelte-fa';

import type { TaskInfo } from '/@api/taskInfo';

let { toastId, taskInfo, onpop = () => {} }: { toastId: number; taskInfo: TaskInfo; onpop?: () => void } = $props();

const clicked = (): void => {
  toast.pop(toastId);
  onpop();
};

const executeAction = (): void => {
  window.executeTask(taskInfo.id);
};
</script>

<div class="flex min-h-10 max-h-30 flex-col p-2 border-[var(--pd-button-tab-border-selected)] border rounded-md bg-[var(--pd-modal-bg)]">
  <div class="mb-1 flex flex-row items-center">

    <div class="mr-1 text-purple-500" role="status" aria-label="{taskInfo.status}">
      {#if taskInfo.status === 'in-progress'}
        <Fa class="animate-spin" icon={faSpinner} />
        {:else if taskInfo.status === 'success'}
          <Fa icon={faCheckCircle} />
        {:else if taskInfo.status === 'failure'}
          <Fa icon={faCircleExclamation} class="text-[var(--pd-state-error)]" />
      {/if}
      </div>


    <div class="font-bold text-ellipsis line-clamp-1 max-w-32">{taskInfo.name}</div>

      {#if taskInfo.progress && taskInfo.status === 'in-progress'}
        <span class="ml-1">{taskInfo.progress}%</span>
      {/if}


    <div class="flex flex-grow flex-col items-end">
      <CloseButton on:click={clicked} />
    </div>

  </div>
<div class="flex flex-row items-center italic">
  {#if taskInfo.error}
  <p class="flex-1 text-sm line-clamp-4 text-[var(--pd-state-error)]">{taskInfo.error}</p>
  {:else}
  {taskInfo.name}
  {/if}
  </div>
  <div class="text-right text-xs text-[var(--pd-content-text)]">
  {#if taskInfo.action}
  <Link onclick={executeAction}>{taskInfo.action}</Link>
  {/if}

</div>



</div>
