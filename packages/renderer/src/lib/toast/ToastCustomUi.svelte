<script lang="ts">
import type { TaskInfo } from '@desktop-framework/api';
import { faCheckCircle, faCircleExclamation, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { CloseButton, Spinner } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { toast } from '@zerodevx/svelte-toast';

interface Props {
  toastId: number;
  taskInfo: TaskInfo;
  onpop?: () => void;
}

let { toastId, taskInfo, onpop = (): void => {} }: Props = $props();

const taskStatus: { [taskInfo.status]: string } = {
  failure: 'Error',
  canceled: 'Canceled',
};

function hideToast(): void {
  toast.pop(toastId);
}

const closeAction = (): void => {
  hideToast();
  onpop();
};
</script>

<div
  class="flex flex-nowrap min-h-10 select-none pointer-events-auto cursor-default max-h-50 max-w-[var(--toastWidth)] flex-row p-2 border-[var(--pd-content-divider)] border rounded bg-[var(--pd-modal-bg)] gap-2 justify-between text-base"
  title={taskInfo.name}
>
  <div class="flex flex-row gap-1 items-start">
    <div
      class="mr-1 text-[var(--pd-state-info)] w-fit h-fit"
      role="status"
      aria-label={taskInfo.status}
    >
      {#if taskInfo.status === 'in-progress'}
        <Spinner size="1.5em"/>
      {:else if taskInfo.status === 'success'}
        <Icon icon={faCheckCircle} class="text-[var(--pd-state-success)] fa-xl"/>
      {:else if taskInfo.status === 'failure'}
        <Icon icon={faCircleExclamation} class="text-[var(--pd-state-error)] fa-xl"/>
      {:else if taskInfo.status === 'canceled'}
        <Icon icon={faTriangleExclamation } class="text-[var(--pd-state-warning)] fa-xl" />
      {/if}
    </div>

    <div class="text-base text-balance text-ellipsis text-[var(--pd-card-text)] h-fit wrap-break-word max-w-46">
      {taskStatus[taskInfo.status] ?? ''} {taskInfo.name}
      {#if taskInfo.error}
        <p class="text-[var(--pd-content-text)]">{taskInfo.error}</p>
      {/if}
    </div>
  </div>

  <div class="flex flex-none whitespace-nowrap flex-col self-start w-fit">
    <CloseButton class="text-[var(--pd-modal-text)]" onclick={closeAction} />
  </div>

</div>
