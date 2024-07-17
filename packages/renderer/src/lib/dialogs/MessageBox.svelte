<script lang="ts">
import { faCircle, faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { faCircleExclamation, faInfo, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Button, type ButtonType } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import Fa from 'svelte-fa';

import Dialog from './Dialog.svelte';
import type { MessageBoxOptions } from './messagebox-input';

let currentId = 0;
let title: string;
let message: string;
let detail: string | undefined;
let buttons: string[];
let type: string | undefined;
let cancelId = -1;
let defaultId: number;
let buttonOrder: number[];

let display = false;

const showMessageBoxCallback = (messageBoxParameter: unknown) => {
  const options: MessageBoxOptions | undefined = messageBoxParameter as MessageBoxOptions;
  currentId = options?.id || 0;
  title = options?.title || '';
  message = options?.message || '';
  if (options?.detail) {
    detail = options.detail;
  } else {
    detail = undefined;
  }

  // use provided buttons, or a single 'OK' button if none are provided
  if (options?.buttons && options.buttons.length > 0) {
    buttons = options.buttons;
  } else {
    buttons = ['OK'];
  }
  type = options?.type;

  buttonOrder = Array.from(buttons, (value, index) => index);

  // use the provided cancel id, otherwise try to find a button labelled 'cancel'
  if (options?.cancelId) {
    cancelId = options.cancelId;
  } else {
    cancelId = buttons.findIndex(b => b.toLowerCase() === 'cancel');
  }

  // use the provided default (primary) id, otherwise the first non-cancel button is the default
  if (options?.defaultId) {
    defaultId = options.defaultId;
  } else {
    if (cancelId === 0) {
      defaultId = 1;
    } else {
      defaultId = 0;
    }
  }

  // move cancel button to the start/left and default button to the end/right
  buttonOrder.sort((a, b) => {
    if (a === cancelId || b === defaultId) {
      return -1;
    } else if (a === defaultId || b === cancelId) {
      return 1;
    } else {
      return a - b;
    }
  });

  display = true;
};

onMount(() => {
  // handle the showMessageBox event
  window.events?.receive('showMessageBox:open', showMessageBoxCallback);
});

onDestroy(() => {
  cleanup();
});

function cleanup() {
  display = false;
  title = '';
  message = '';
}

function clickButton(index?: number) {
  window.sendShowMessageBoxOnSelect(currentId, index);
  cleanup();
}

function onClose() {
  window.sendShowMessageBoxOnSelect(currentId, cancelId >= 0 ? cancelId : undefined);
  cleanup();
}

function getButtonType(b: boolean): ButtonType {
  if (b) {
    return 'primary';
  } else {
    return 'secondary';
  }
}
</script>

{#if display}
  <Dialog title={title} on:close={onClose}>
    <svelte:fragment slot="icon">
      {#if type === 'error'}
        <Fa class="h-4 w-4 text-[var(--pd-state-error)]" icon={faCircleExclamation} />
      {:else if type === 'warning'}
        <Fa class="h-4 w-4 text-[var(--pd-state-warning)]" icon={faTriangleExclamation} />
      {:else if type === 'info'}
        <div class="flex">
          <Fa class="h-4 w-4 place-content-center" icon={faCircle} />
          <Fa class="h-4 w-4 place-content-center -ml-4 mt-px text-xs" icon={faInfo} />
        </div>
      {:else if type === 'question'}
        <Fa class="h-4 w-4" icon={faCircleQuestion} />
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="content">
      <div class="leading-5" aria-label="Dialog Message">{message}</div>

      {#if detail}
        <div class="pt-4 leading-5" aria-label="Dialog Details">{detail}</div>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="buttons">
      {#each buttonOrder as i}
        {#if i === cancelId}
          <Button type="link" aria-label="Cancel" on:click={() => clickButton(i)}>Cancel</Button>
        {:else}
          <Button type={getButtonType(defaultId === i)} on:click={() => clickButton(i)}>{buttons[i]}</Button>
        {/if}
      {/each}
    </svelte:fragment>
  </Dialog>
{/if}
