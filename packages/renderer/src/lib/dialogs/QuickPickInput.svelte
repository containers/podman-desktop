<script lang="ts">
import { onDestroy, onMount, tick } from 'svelte';
import type { InputBoxOptions, QuickPickOptions } from './quickpick-input';

const DEFAULT_PROMPT = "Press 'Enter' to confirm your input or 'Escape' to cancel";
let inputValue = '';
let placeHolder = '';
let prompt = '';
let currentId = 0;
let title = '';

let validationEnabled = false;
let validationError = '';

let onSelectCallbackEnabled = false;

let display = false;
let mode: 'InputBox' | 'QuickPick';

let quickPickItems: { value: any; description: string; detail: string; checkbox: boolean }[] = [];
let quickPickFilteredItems: { value: any; description: string; detail: string; checkbox: boolean }[] = quickPickItems;
let quickPickSelectedIndex = 0;
let quickPickSelectedFilteredIndex = 0;
let quickPickCanPickMany = false;

let inputElement: HTMLInputElement = undefined;

const showInputCallback = async (options?: InputBoxOptions) => {
  mode = 'InputBox';
  inputValue = options.value;
  placeHolder = options.placeHolder;
  title = options.title;
  currentId = options.id;
  if (options.prompt) {
    prompt = `${options.prompt} (${DEFAULT_PROMPT})`;
  } else {
    prompt = DEFAULT_PROMPT;
  }

  validationEnabled = options.validate;
  display = true;
  await tick();

  if (display && inputElement) {
    inputElement.focus();
    if (options.valueSelection) {
      inputElement.setSelectionRange(options.valueSelection[0], options.valueSelection[1]);
    }
  }
};

const showQuickPickCallback = async (options?: QuickPickOptions) => {
  mode = 'QuickPick';
  placeHolder = options.placeHolder;
  title = options.title;
  currentId = options.id;
  if (options.prompt) {
    prompt = options.prompt;
  }
  quickPickItems = options.items.map(item => {
    if (typeof item === 'string') {
      return { value: item, description: '', detail: '', checkbox: false };
    } else {
      // if type is QuickPickItem use label field for the display
      return { value: item.label, description: item.description, detail: item.detail, checkbox: false };
    }
  });
  quickPickFilteredItems = quickPickItems;

  if (options.canPickMany) {
    quickPickCanPickMany = true;
  }

  if (options.onSelectCallback) {
    onSelectCallbackEnabled = true;
    // if there is one item, notify that focus will be on it
    if (quickPickItems.length > 0) {
      window.sendShowQuickPickOnSelect(currentId, 0);
    }
  }

  display = true;

  await tick();

  if (display && inputElement) {
    inputElement.focus();
  }
};

onMount(() => {
  // handle the showInputBox events
  window.events?.receive('showInputBox:add', showInputCallback);

  // handle the showInputBox events
  window.events?.receive('showQuickPick:add', showQuickPickCallback);
});

async function onInputChange(event: any) {
  // in case of quick pick, filter the items
  if (mode === 'QuickPick') {
    quickPickFilteredItems = quickPickItems.filter(item => item.value.includes(event.target.value));
    quickPickSelectedFilteredIndex = 0;
    if (quickPickFilteredItems.length > 0) {
      quickPickSelectedIndex = quickPickItems.indexOf(quickPickFilteredItems[quickPickSelectedFilteredIndex]);
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
  if (result !== undefined && result !== null && result) {
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
      window.sendShowQuickPickValues(currentId, [quickPickSelectedIndex]);
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
  if (e.key === 'Escape') {
    // In case of validating error, do not proceed
    if (validationError) {
      e.preventDefault();
      return;
    }
    if (mode === 'QuickPick') {
      window.sendShowQuickPickValues(currentId, []);
    } else if (mode === 'InputBox') {
      window.sendShowInputBoxValue(currentId, undefined, undefined);
    }
    cleanup();
    e.preventDefault();
    return;
  } else if (e.key === 'Enter') {
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
  } else if (e.key === ' ') {
    if (mode === 'QuickPick') {
      if (quickPickCanPickMany) {
        // if space is pressed, toggle the item
        const originalIndex = quickPickItems.indexOf(quickPickFilteredItems[quickPickSelectedFilteredIndex]);
        quickPickItems[originalIndex].checkbox = !quickPickItems[originalIndex].checkbox;
        quickPickFilteredItems = quickPickItems;
        e.preventDefault();
        return;
      }
    }
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
</script>

<svelte:window on:keydown="{handleKeydown}" />

{#if display}
  <!-- Create overlay-->
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 h-full z-40"></div>

  <div class="absolute m-auto left-0 right-0 z-50">
    <div class=" flex justify-center items-center mt-1">
      <div
        class="bg-zinc-900 w-[700px] {mode === 'InputBox' ? 'h-16' : ''} shadow-sm p-2 rounded shadow-zinc-700 text-sm">
        {#if title}
          <div
            aria-label="title"
            class="w-full bg-zinc-800 rounded-sm text-center max-w-[700px] truncate cursor-default">
            {title}
          </div>
        {/if}
        <div class="w-full flex flex-row">
          <input
            bind:this="{inputElement}"
            on:input="{event => onInputChange(event)}"
            type="text"
            bind:value="{inputValue}"
            class="px-1 w-full text-gray-300 bg-zinc-700 border {validationError
              ? 'border-red-700'
              : 'border-zinc-800'} focus:outline-none"
            placeholder="{placeHolder}" />
          {#if quickPickCanPickMany}
            <button
              on:click="{() => validateQuickPick()}"
              class="text-gray-300 bg-violet-600 border border-zinc-800 focus:outline-none px-1">OK</button>
          {/if}
        </div>

        {#if mode === 'InputBox'}
          {#if validationError}
            <div class="text-gray-300 border border-red-700 relative w-full bg-red-700 px-1">{validationError}</div>
          {:else}
            <div class="relative text-gray-300 pt-2 px-1 h-6 overflow-y-auto">{prompt}</div>
          {/if}
        {:else if mode === 'QuickPick'}
          {#each quickPickFilteredItems as item, i}
            <div
              class="flex w-full flex-row {i === quickPickSelectedFilteredIndex
                ? 'bg-violet-500'
                : 'hover:bg-zinc-800'} ">
              {#if quickPickCanPickMany}
                <input type="checkbox" class="mx-1 outline-none" bind:checked="{item.checkbox}" />
              {/if}
              <button
                on:click="{() => clickQuickPickItem(item, i)}"
                class="text-gray-300 text-left relative my-1 w-full {i === quickPickSelectedFilteredIndex
                  ? 'bg-violet-500'
                  : ''} px-1">
                <div class="flex flex-col w-full">
                  <!-- first row is Value + optional description-->
                  <div class="flex flex-row w-full max-w-[700px] truncate">
                    <div class="font-bold">{item.value}</div>
                    {#if item.description}
                      <div class="text-gray-300 text-xs ml-2">{item.description}</div>
                    {/if}
                  </div>
                  <!-- second row is optional detail -->
                  {#if item.detail}
                    <div class="w-full max-w-[700px] truncate text-gray-300 text-xs">{item.detail}</div>
                  {/if}
                </div>
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}
