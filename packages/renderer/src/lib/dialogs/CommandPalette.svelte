<script lang="ts">
import { onDestroy, onMount, tick } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { commandsInfos } from '/@/stores/commands';
import { context } from '/@/stores/context';
import type { CommandInfo } from '/@api/command-info';

import type { ContextUI } from '../context/context';
import { isPropertyValidInContext } from '../preferences/Util';

const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';
const ARROW_DOWN_KEY = 'ArrowDown';
const ARROW_UP_KEY = 'ArrowUp';
const TAB_KEY = 'Tab';

export let display = false;
let inputElement: HTMLInputElement | HTMLTextAreaElement | undefined = undefined;
let outerDiv: HTMLDivElement | undefined = undefined;
let inputValue: string | undefined = '';
let scrollElements: HTMLLIElement[] = [];

let commandInfoItems: CommandInfo[] = [];
let filteredCommandInfoItems: CommandInfo[] = [];
let globalContext: ContextUI;

$: filteredCommandInfoItems = commandInfoItems
  .filter(property => isPropertyValidInContext(property.enablement, globalContext))
  .filter(item => (inputValue ? item.title?.toLowerCase().includes(inputValue.toLowerCase()) : true));

let contextsUnsubscribe: Unsubscriber;

onMount(() => {
  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
  });
  // subscribe to the commands
  return commandsInfos.subscribe(infos => {
    commandInfoItems = infos;
  });
});

onDestroy(() => {
  contextsUnsubscribe?.();
});

let selectedFilteredIndex = 0;
let selectedIndex = 0;

function handleKeydown(e: KeyboardEvent) {
  // toggle display using F1 or ESC keys
  if (e.key === 'F1') {
    // clear the input value
    inputValue = '';
    selectedFilteredIndex = 0;
    selectedIndex = 0;
    // toggle the display
    display = true;
    tick()
      .then(() => {
        inputElement?.focus();
      })
      .catch(() => {
        // ignore
      });

    e.preventDefault();
    return;
  } else if (e.key === ESCAPE_KEY) {
    // here we toggle the display
    display = false;
    e.preventDefault();
    return;
  }

  // for other keys, only check if it's being displayed
  if (!display) {
    return;
  }

  // no items, abort
  if (filteredCommandInfoItems.length === 0) {
    return;
  }

  if (e.key === ARROW_DOWN_KEY || e.key === TAB_KEY) {
    // if down key is pressed, move the index
    selectedFilteredIndex++;
    if (selectedFilteredIndex >= filteredCommandInfoItems.length) {
      selectedFilteredIndex = 0;
    }

    selectedIndex = commandInfoItems.indexOf(filteredCommandInfoItems[selectedFilteredIndex]);

    scrollElements[selectedFilteredIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    e.preventDefault();
  } else if (e.key === ARROW_UP_KEY) {
    // if up key is pressed, move the index
    selectedFilteredIndex--;
    if (selectedFilteredIndex < 0) {
      selectedFilteredIndex = filteredCommandInfoItems.length - 1;
    }
    selectedIndex = commandInfoItems.indexOf(filteredCommandInfoItems[selectedFilteredIndex]);
    scrollElements[selectedFilteredIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    e.preventDefault();
  } else if (e.key === ENTER_KEY) {
    // hide the command palette
    display = false;

    selectedIndex = commandInfoItems.indexOf(filteredCommandInfoItems[selectedFilteredIndex]);
    executeCommand(selectedIndex);
    e.preventDefault();
  }
}

async function executeCommand(index: number) {
  // get command id
  const commandId = commandInfoItems[index].id;
  // execute the command
  try {
    await window.executeCommand(commandId);
  } catch (error) {
    console.error('error executing command', error);
  }
}

function handleMousedown(e: MouseEvent) {
  if (!display) {
    return;
  }

  if (outerDiv && !e.defaultPrevented && e.target instanceof Node && !outerDiv.contains(e.target)) {
    display = false;
  }
}

async function clickOnItem(item: any, index: number) {
  // hide the command palette
  display = false;

  // select the index from the cursor
  selectedIndex = commandInfoItems.indexOf(filteredCommandInfoItems[index]);
  executeCommand(selectedIndex);
}

async function onInputChange() {
  // in case of quick pick, filter the items

  selectedFilteredIndex = 0;
  if (filteredCommandInfoItems.length > 0) {
    selectedIndex = commandInfoItems.indexOf(filteredCommandInfoItems[selectedFilteredIndex]);
  }
}
</script>

<svelte:window on:keydown={handleKeydown} on:mousedown={handleMousedown} />

{#if display}
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 h-full z-50"></div>

  <div class="absolute m-auto left-0 right-0 z-50">
    <div class="flex justify-center items-center mt-1">
      <div
        bind:this={outerDiv}
        class="bg-charcoal-800 w-[700px] max-h-fit shadow-sm p-2 rounded shadow-zinc-700 text-sm">
        <div class="w-full flex flex-row">
          <input
            bind:this={inputElement}
            aria-label="Command palette command input"
            type="text"
            bind:value={inputValue}
            on:input={() => onInputChange()}
            class="px-1 w-full text-gray-400 bg-zinc-700 border border-charcoal-600 focus:outline-none" />
        </div>
        <ul class="max-h-[50vh] overflow-y-auto flex flex-col">
          {#each filteredCommandInfoItems as item, i}
            <li class="flex w-full flex-row" bind:this={scrollElements[i]} aria-label={item.id}>
              <button
                on:click={() => clickOnItem(item, i)}
                class="text-gray-400 text-left relative my-0.5 mr-2 w-full {i === selectedFilteredIndex
                  ? 'bg-violet-500 selected'
                  : 'hover:bg-charcoal-600'}  px-1">
                <div class="flex flex-col w-full">
                  <div class="flex flex-row w-full max-w-[700px] truncate">
                    <div class="text-xs">{item.title}</div>
                  </div>
                </div>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
{/if}
