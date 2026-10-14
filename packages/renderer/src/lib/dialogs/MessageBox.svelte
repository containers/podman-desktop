<script lang="ts">
import { type ButtonsType, type DialogType, type DropdownType, type IconButtonType } from '@desktop-framework/api';
import { faCircle, faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { faCircleExclamation, faInfo, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Button, type ButtonType, Dropdown } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onDestroy, onMount } from 'svelte';

import Markdown from '/@/lib/markdown/Markdown.svelte';

import Dialog from './Dialog.svelte';
import type { MessageBoxOptions } from './messagebox-input';

let currentId = 0;
let title: string = $state('');
let message: string = $state('');
let detail: string | undefined = $state();
let buttonsType: ButtonsType[] = $state([]);
let type: DialogType | undefined = $state();
let cancelId = $state(-1);
let defaultId: number | undefined = $state();
let buttonOrder: number[] = $state([]);
let footerMarkdownDescription: string | undefined = $state();

let display = $state(false);

const showMessageBoxCallback = (messageBoxParameter: unknown): void => {
  const options: MessageBoxOptions | undefined = messageBoxParameter as MessageBoxOptions;
  currentId = options?.id || 0;
  title = options?.title || '';
  message = options?.message || '';
  if (options?.detail) {
    detail = options.detail;
  } else {
    detail = undefined;
  }

  footerMarkdownDescription = options.footerMarkdownDescription;

  if (options?.buttons && options.buttons.length > 0) {
    buttonsType = options.buttons;
  } else {
    buttonsType = ['Dismiss'];
  }
  type = options?.type;

  buttonOrder = Array.from(buttonsType, (value, index) => index);

  // use the provided cancel id, otherwise try to find a button labelled 'cancel'
  if (options?.cancelId) {
    cancelId = options.cancelId;
  } else {
    cancelId = buttonsType.findIndex(b => {
      // only for "clasic" buttons and not Dropdown component
      if (typeof b === 'string') return b.toLowerCase() === 'cancel';
    });
  }

  // use the provided default (primary) id, otherwise the first non-cancel button is the default
  if (options?.defaultId) {
    defaultId = options.defaultId;
  } else if (cancelId === 0) {
    defaultId = 1;
  } else {
    defaultId = 0;
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

function cleanup(): void {
  display = false;
  title = '';
  message = '';
}

async function clickButton(index?: number, dropdownIndex?: number): Promise<void> {
  cleanup();
  await window.sendShowMessageBoxOnSelect(currentId, index, dropdownIndex);
}

async function onClose(): Promise<void> {
  cleanup();
  await window.sendShowMessageBoxOnSelect(currentId, cancelId >= 0 ? cancelId : undefined);
}

function getButtonType(b: boolean): ButtonType {
  // eslint-disable-next-line sonarjs/no-selector-parameter
  if (b && type === 'danger') {
    return 'danger';
  } else if (b) {
    return 'primary';
  } else {
    return 'secondary';
  }
}
</script>

{#if display}
  <!-- for danger MessageBox, the initial focus will be on the cancel button (first one) while in all others types the focus will be on the default button (last one) -->
  <Dialog title={title} onclose={onClose} initialButtonFocus={type === 'danger' ? 'first' : 'last'}>
    {#snippet icon()}
      
        {#if type === 'error' || type === 'danger'}
          <Icon class="h-4 w-4 text-[var(--pd-state-error)]" icon={faCircleExclamation} />
        {:else if type === 'warning'}
          <Icon class="h-4 w-4 text-[var(--pd-state-warning)]" icon={faTriangleExclamation} />
        {:else if type === 'info'}
          <div class="flex">
            <Icon class="h-4 w-4 place-content-center" icon={faCircle} />
            <Icon class="h-4 w-4 place-content-center -ml-4 mt-px text-xs" icon={faInfo} />
          </div>
        {:else if type === 'question'}
          <Icon class="h-4 w-4" icon={faCircleQuestion} />
        {/if}
      
      {/snippet}

    {#snippet content()}
      
        <div class="leading-5" aria-label="Dialog Message">
          <Markdown markdown={message} />
        </div>

        {#if footerMarkdownDescription}
          <div class="pt-4 flex justify-center" aria-label="Footer Description">
            <Markdown markdown={footerMarkdownDescription} />
          </div>
        {/if}
        {#if detail}
          <div class="pt-4 leading-5" aria-label="Dialog Details">{detail}</div>
        {/if}
      
      {/snippet}

    {#snippet buttons()}
      
        {#each buttonOrder as i, index (index)}
          {#if i === cancelId}
            <Button type="link" aria-label="Cancel" on:click={async (): Promise<void> => await clickButton(i)}>Cancel</Button>
          {:else if typeof buttonsType[i] === 'object'}
            {#if buttonsType[i].type === 'dropdownButton'}
              {@const dropdownButtons = buttonsType[i] as DropdownType}
              <Dropdown
                name={dropdownButtons.heading}
                value={dropdownButtons.heading}
                onChange={async (option): Promise<void> => {
                  let optionIndex: number | undefined = dropdownButtons.buttons.indexOf(option);
                  if (optionIndex === -1) {
                    optionIndex = undefined;
                  }
                  await clickButton(i, optionIndex);
                }}
                options={dropdownButtons.buttons.map(button => ({label: button, value: button}))}/>
            {:else if buttonsType[i].type === 'iconButton'}
              {@const button = buttonsType[i] as IconButtonType}
              <Button type="primary" icon={button.icon} on:click={async (): Promise<void> => await clickButton(i)}>{button.label}</Button>
            {/if}
          {:else}
            <Button type={getButtonType(defaultId === i)} on:click={async (): Promise<void> => await clickButton(i)}>{buttonsType[i]}</Button>
          {/if}
        {/each}
      
      {/snippet}
  </Dialog>
{/if}
