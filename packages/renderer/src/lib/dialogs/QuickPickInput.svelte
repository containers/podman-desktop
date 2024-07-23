<script lang="ts">
import { Button, Checkbox, Modal } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount, tick } from 'svelte';

import Markdown from '/@/lib/markdown/Markdown.svelte';

import type { InputBoxOptions, QuickPickOptions } from './quickpick-input';

const ENTER = 'Enter';
const ESCAPE = 'Escape';
const DEFAULT_PROMPT = `Press '${ENTER}' to confirm your input or '${ESCAPE}' to cancel`;
let inputValue: string | undefined = '';
let placeHolder: string | undefined = '';
let prompt = '';
let markdownDescription: string | undefined = '';
let currentId = 0;
let title: string | undefined = '';
let multiline = false;

let validationEnabled = false;
let validationError: string | undefined = '';

let onSelectCallbackEnabled = false;

let display = false;
let mode: 'InputBox' | 'QuickPick';

let quickPickItems: { value: any; description: string; detail: string; checkbox: boolean }[] = [];
let quickPickFilteredItems: { value: any; description: string; detail: string; checkbox: boolean }[] = quickPickItems;
let quickPickSelectedIndex = 0;
let quickPickSelectedFilteredIndex = 0;
let quickPickCanPickMany = false;

let inputElement: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;
let outerDiv: HTMLDivElement | undefined = undefined;

const showInputCallback = (inputCallpackParameter: unknown) => {
  const options: InputBoxOptions | undefined = inputCallpackParameter as InputBoxOptions;
  mode = 'InputBox';
  inputValue = options?.value;
  placeHolder = options?.placeHolder;
  title = options?.title;
  currentId = options?.id ?? 0;
  if (options?.prompt) {
    prompt = `${options.prompt} (${DEFAULT_PROMPT})`;
  } else {
    prompt = DEFAULT_PROMPT;
  }
  markdownDescription = options?.markdownDescription;
  multiline = options?.multiline ?? false;

  validationEnabled = options?.validate ?? false;
  display = true;
  tick()
    .then(() => {
      if (display && inputElement) {
        inputElement.focus();
        if (options?.valueSelection) {
          inputElement.setSelectionRange(options.valueSelection[0], options.valueSelection[1]);
        }
      }
    })
    .catch((error: unknown) => {
      console.error('Unable to focus/select input box', error);
    });
};

const showQuickPickCallback = (quickpickParameter: unknown) => {
  const options: QuickPickOptions | undefined = quickpickParameter as QuickPickOptions;
  mode = 'QuickPick';
  placeHolder = options?.placeHolder;
  title = options?.title;
  currentId = options?.id ?? 0;
  if (options?.prompt) {
    prompt = options.prompt;
  }
  quickPickItems = (options?.items ?? []).map(item => {
    if (typeof item === 'string') {
      return { value: item, description: '', detail: '', checkbox: false };
    } else {
      // if type is QuickPickItem use label field for the display
      return {
        value: item.label ?? '',
        description: item.description ?? '',
        detail: item.detail ?? '',
        checkbox: false,
      };
    }
  });

  quickPickFilteredItems = quickPickItems;

  if (options?.canPickMany) {
    quickPickCanPickMany = true;
  }

  if (options?.onSelectCallback) {
    onSelectCallbackEnabled = true;
    // if there is one item, notify that focus will be on it
    if (quickPickItems.length > 0) {
      window.sendShowQuickPickOnSelect(currentId, 0);
    }
  }

  display = true;

  tick()
    .then(() => {
      if (display && inputElement) {
        inputElement.focus();
      }
    })
    .catch((error: unknown) => {
      console.error('Unable to focus input box', error);
    });
};

onMount(() => {
  // handle the showInputBox events
  window.events?.receive('showInputBox:add', showInputCallback);

  // handle the showInputBox events
  window.events?.receive('showQuickPick:add', showQuickPickCallback);
});

const onClose = () => {
  if (validationError) {
    return;
  }
  if (mode === 'QuickPick') {
    window.sendShowQuickPickValues(currentId, []);
  } else if (mode === 'InputBox') {
    window.sendShowInputBoxValue(currentId, undefined, undefined);
  }
  cleanup();
};

async function onInputChange(event: any) {
  // in case of quick pick, filter the items
  if (mode === 'QuickPick') {
    let val = event.target.value.toLowerCase();
    quickPickFilteredItems = quickPickItems.filter(item => item.value.toLowerCase().includes(val));
    quickPickSelectedFilteredIndex = 0;
    if (quickPickFilteredItems.length > 0) {
      quickPickSelectedIndex = quickPickItems.indexOf(quickPickFilteredItems[quickPickSelectedFilteredIndex]);
    } else {
      quickPickSelectedIndex = -1;
    }
    if (onSelectCallbackEnabled) {
      window.sendShowQuickPickOnSelect(currentId, quickPickSelectedIndex);
    }
    return;
  }

  // skip validation if it is not enabled
  if (!validationEnabled) {
    return;
  }
  validationError = undefined;
  const value = event.target.value;
  const result = await window.sendShowInputBoxValidate(currentId, value);
  if (result) {
    validationError = result.toString();
  }
}

onDestroy(() => {
  cleanup();
});

function cleanup() {
  display = false;
  inputValue = '';
  placeHolder = '';
  prompt = '';
  validationEnabled = false;
  onSelectCallbackEnabled = false;
  quickPickCanPickMany = false;
  quickPickSelectedFilteredIndex = 0;
  quickPickSelectedIndex = 0;
}

function validateQuickPick() {
  if (mode === 'InputBox') {
    // needs to convert the index from the filtered index to the original index
    const originalIndex = quickPickItems.indexOf(quickPickFilteredItems[quickPickSelectedIndex]);

    window.sendShowQuickPickValues(currentId, [originalIndex]);
  } else {
    // grab all selected items
    if (quickPickCanPickMany) {
      const selectedItems = quickPickItems.filter(item => item.checkbox);
      window.sendShowQuickPickValues(
        currentId,
        selectedItems.map(item => quickPickItems.indexOf(item)),
      );
    } else {
      if (quickPickSelectedIndex >= 0) {
        window.sendShowQuickPickValues(currentId, [quickPickSelectedIndex]);
      } else {
        window.sendShowQuickPickValues(currentId, []);
      }
    }
  }
  cleanup();
}

function clickQuickPickItem(item: any, index: number) {
  if (quickPickCanPickMany) {
    // reset index as we clicked
    quickPickSelectedFilteredIndex = -1;
    item.checkbox = !item.checkbox;
    quickPickItems = [...quickPickItems];
    quickPickFilteredItems = [...quickPickFilteredItems];
  } else {
    // select the index from the cursor
    quickPickSelectedIndex = quickPickItems.indexOf(quickPickFilteredItems[index]);
    validateQuickPick();
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!display) {
    return;
  }

  if (e.key === 'Enter') {
    if (mode === 'InputBox') {
      // In case of validating error, do not proceed
      if (validationError) {
        e.preventDefault();
        return;
      }
      window.sendShowInputBoxValue(currentId, inputValue, undefined);
      cleanup();
      e.preventDefault();
      return;
    } else if (mode === 'QuickPick') {
      validateQuickPick();
      e.preventDefault();
      return;
    }
  } else if (e.key === ' ' && mode === 'QuickPick' && quickPickCanPickMany) {
    // if space is pressed, toggle the item
    const originalIndex = quickPickItems.indexOf(quickPickFilteredItems[quickPickSelectedFilteredIndex]);
    quickPickItems[originalIndex].checkbox = !quickPickItems[originalIndex].checkbox;
    quickPickFilteredItems = quickPickItems;
    e.preventDefault();
    return;
  }

  if (mode === 'QuickPick') {
    if (e.key === 'ArrowDown') {
      // if down key is pressed, move the index
      quickPickSelectedFilteredIndex++;
      if (quickPickSelectedFilteredIndex >= quickPickFilteredItems.length) {
        quickPickSelectedFilteredIndex = 0;
      }
      quickPickSelectedIndex = quickPickItems.indexOf(quickPickFilteredItems[quickPickSelectedFilteredIndex]);
      e.preventDefault();
      if (onSelectCallbackEnabled) {
        window.sendShowQuickPickOnSelect(currentId, quickPickSelectedIndex);
      }
      return;
    } else if (e.key === 'ArrowUp') {
      // if down key is pressed, move the index
      quickPickSelectedFilteredIndex--;
      if (quickPickSelectedFilteredIndex < 0) {
        quickPickSelectedFilteredIndex = quickPickItems.length - 1;
      }
      quickPickSelectedIndex = quickPickItems.indexOf(quickPickFilteredItems[quickPickSelectedFilteredIndex]);
      if (onSelectCallbackEnabled) {
        window.sendShowQuickPickOnSelect(currentId, quickPickSelectedIndex);
      }
      e.preventDefault();
      return;
    }
  }
}

function handleMousedown(e: MouseEvent) {
  if (outerDiv && !e.defaultPrevented && e.target instanceof Node && !outerDiv.contains(e.target)) {
    window.sendShowQuickPickValues(currentId, []);
    cleanup();
  }
}
</script>

<svelte:window on:keydown={handleKeydown} on:mousedown={handleMousedown} />

{#if display}
  <Modal on:close={onClose} name={title} top>
    <div class="flex justify-center items-center mt-1">
      <div
        bind:this={outerDiv}
        class="w-[700px] {mode === 'InputBox' ? 'h-fit' : ''} shadow-sm p-2 rounded shadow-zinc-700 text-sm">
        {#if title}
          <div
            aria-label="title"
            class="w-full bg-charcoal-600 rounded-sm text-center max-w-[700px] truncate cursor-default">
            {title}
          </div>
        {/if}
        <div class="w-full flex flex-row">
          {#if multiline}
            <textarea
              bind:this={inputElement}
              on:input={event => onInputChange(event)}
              bind:value={inputValue}
              class="px-1 w-full h-20 text-gray-400 bg-zinc-700 border {validationError
                ? 'border-red-700'
                : 'border-charcoal-600'} focus:outline-none"
              placeholder={placeHolder}></textarea>
          {:else}
            <input
              bind:this={inputElement}
              on:input={event => onInputChange(event)}
              type="text"
              bind:value={inputValue}
              class="px-1 w-full text-gray-400 bg-zinc-700 border {validationError
                ? 'border-red-700'
                : 'border-charcoal-600'} focus:outline-none"
              placeholder={placeHolder} />
          {/if}
          {#if quickPickCanPickMany}
            <Button on:click={() => validateQuickPick()} class="px-1">OK</Button>
          {/if}
        </div>

        {#if mode === 'InputBox'}
          {#if validationError}
            <div class="text-gray-400 border border-red-700 relative w-full bg-red-700 px-1">{validationError}</div>
          {:else}
            <div class="relative text-gray-400 pt-2 px-1 h-7 overflow-y-auto">{prompt}</div>
            {#if markdownDescription && markdownDescription.length > 0}
              <div class="relative text-gray-400 pt-2 px-1 h-fit overflow-y-auto">
                <Markdown markdown={markdownDescription} />
              </div>
            {/if}
          {/if}
        {:else if mode === 'QuickPick'}
          {#each quickPickFilteredItems as item, i}
            <div
              class="flex w-full flex-row {i === quickPickSelectedFilteredIndex
                ? 'bg-purple-500'
                : 'hover:bg-charcoal-600'} ">
              {#if quickPickCanPickMany}
                <Checkbox class="mx-1 my-auto" bind:checked={item.checkbox} />
              {/if}
              <button
                on:click={() => clickQuickPickItem(item, i)}
                class="text-gray-400 text-left relative my-1 w-full {i === quickPickSelectedFilteredIndex
                  ? 'bg-purple-500'
                  : ''} px-1">
                <div class="flex flex-col w-full">
                  <!-- first row is Value + optional description-->
                  <div class="flex flex-row w-full max-w-[700px] truncate">
                    <div class="font-bold">{item.value}</div>
                    {#if item.description}
                      <div class="text-gray-400 text-xs ml-2">{item.description}</div>
                    {/if}
                  </div>
                  <!-- second row is optional detail -->
                  {#if item.detail}
                    <div class="w-full max-w-[700px] truncate text-gray-400 text-xs">{item.detail}</div>
                  {/if}
                </div>
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </Modal>
{/if}
