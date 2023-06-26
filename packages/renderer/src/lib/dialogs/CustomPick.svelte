<script lang="ts">
import { onMount } from 'svelte';
import type { CustomPickOptions } from './quickpick-input';
import type { CustomPickItem } from '@podman-desktop/api';
import Markdown from '../markdown/Markdown.svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

let id = -1;
let title = '';
let description = '';
let icon: string | { light: string; dark: string };
let items: CustomPickItem[];
let canSelectMany = false;
let hideItemSections = false;

let display = false;

// used to keep track of if the item section is opened or closed (true: close, false: open)
let itemSectionHiddenStatus: Map<number, boolean>;
$: itemSectionHiddenStatus = new Map<number, boolean>();

onMount(() => {
  // handle the showCustomPick events
  window.events?.receive('showCustomPick:add', showCustomPickCallback);
});

async function showCustomPickCallback(options?: CustomPickOptions) {
  id = options.id;
  title = options.title;
  description = options.description;
  icon = options.icon;
  items = options.items;
  canSelectMany = options.canSelectMany;
  hideItemSections = options.hideItemSections;

  items.forEach((_value, index) => {
    itemSectionHiddenStatus.set(index, hideItemSections);
  });
  display = true;
}

function handleSelection(
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLDivElement;
  },
  item: CustomPickItem,
) {
  if (
    e.target instanceof HTMLButtonElement &&
    (e.target.ariaLabel === 'Less detail' || e.target.ariaLabel === 'Show more')
  ) {
    return;
  }
  //if it's deselecting an item, just do it
  //if it's selecting an item and the multiselect is disabled, first it unselects any selected item before selecting it
  if (!item.selected && !canSelectMany) {
    items.forEach(item => {
      item.selected = false;
    });
  }
  item.selected = !item.selected;
  items = items;
}

async function cancel() {
  await window.closeCustomPick(id);
  display = false;
}

async function next() {
  const indexes = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].selected) {
      indexes.push(i);
    }
  }
  await window.sendCustomPickItemsOnConfirmation(id, indexes);
  await window.closeCustomPick(id);
  display = false;
}

function setSectionVisibility(index: number, show: boolean) {
  itemSectionHiddenStatus.set(index, show);
  itemSectionHiddenStatus = itemSectionHiddenStatus;
}
</script>

{#if display}
  <!-- Create overlay-->
  <div
    class="fixed top-0 left-0 right-0 bottom-0 bg-black pt-8 pb-3 bg-opacity-60 bg-blend-multiply h-full grid z-50 overflow-y-auto">
    <div class="flex flex-col place-self-center w-[650px] rounded-xl bg-charcoal-800 shadow-xl shadow-black">
      <div class="flex flex-col items-center justify-between pl-4 pr-3 py-3 space-x-2 text-gray-400">
        {#if icon}
          <div class="mb-2">
            {#if typeof icon === 'string'}
              <img src="{icon}" alt="{title ? title : 'icon'}" class="max-h-12" />
            {:else}
              <!-- TODO check theme used for image, now use dark by default -->
              <img src="{icon.dark}" alt="{title ? title : 'icon'}" class="max-h-12" />
            {/if}
          </div>
        {/if}
        {#if title}
          <h1 class="grow text-lg font-bold capitalize" aria-label="{title}">{title}</h1>
        {/if}
        {#if description}
          <h3 class="grow text-xs">{description}</h3>
        {/if}
      </div>

      <div class="flex flex-row flex-wrap mx-auto">
        {#each items as item, i}
          <div
            class="flex flex-col w-[300px] mx-2 mb-4 h-fit hover:border-solid border-2 rounded-md border-transparent hover:border-purple-500 hover:bg-purple-600 group
        {item.selected ? 'is-selected border-purple-500 bg-purple-600' : ''}
        {itemSectionHiddenStatus.get(i) ? 'hide-section' : ''}"
            on:mousedown="{e => handleSelection(e, item)}">
            {#if item.selected}
              <div class="relative">
                <div class="absolute right-0 m-3 text-xl text-purple-500">
                  <Fa icon="{faCircleCheck}" />
                </div>
              </div>
            {/if}

            <div
              class="px-4 pt-4 pb-2 bg-charcoal-500 group-hover:bg-purple-800 rounded-t-md group-[.is-selected]:bg-purple-800">
              <div class="flex flex-row mb-1 gap-x-1">
                <span class="text-md font-bold">{item.title}</span>
                {#if item.description}
                  <span class="text-xs text-gray-700">{item.description}</span>
                {/if}
              </div>

              <div class="mb-2 text-xs">
                <Markdown>{item.markDownContent}</Markdown>
              </div>
            </div>
            {#if item.sections}
              {#each item.sections as section}
                <div class="mx-auto my-2 text-xs font-bold group-[.hide-section]:hidden">
                  {section.title}
                </div>
                {#if section.content}
                  <div
                    class="bg-charcoal-500 group-hover:bg-purple-800 group-[.hide-section]:hidden group-[.is-selected]:bg-purple-800 px-4 py-2 flex flex-col text-xs items-center">
                    {section.content}
                  </div>
                {/if}
                {#if section.markDownContent}
                  <div
                    class="bg-charcoal-500 group-hover:bg-purple-800 group-[.hide-section]:hidden group-[.is-selected]:bg-purple-800 px-4 py-2 flex flex-col text-xs">
                    <Markdown>{section.markDownContent}</Markdown>
                  </div>
                {/if}
              {/each}
              {#if item.sections.length > 0}
                <div
                  class="p-4 bg-charcoal-500 group-hover:bg-purple-800 group-[.is-selected]:bg-purple-800 rounded-b-md text-xs flex justify-center">
                  {#if itemSectionHiddenStatus.get(i)}
                    <button
                      aria-label="Less detail"
                      class="text-xs hover:underline"
                      on:click="{() => setSectionVisibility(i, false)}">
                      Show details
                      <span class="pf-c-button__icon pf-m-end">
                        <i class="fas fa-angle-down" aria-hidden="true"></i>
                      </span>
                    </button>
                  {:else}
                    <button
                      aria-label="Less detail"
                      class="text-xs hover:underline"
                      on:click="{() => setSectionVisibility(i, true)}">
                      Less details
                      <span class="pf-c-button__icon pf-m-end">
                        <i class="fas fa-angle-up" aria-hidden="true"></i>
                      </span>
                    </button>
                  {/if}
                </div>
              {/if}
            {/if}
          </div>
        {/each}
      </div>

      <div class="px-5 py-5 mt-2 flex flex-row w-full justify-end space-x-5">
        <button aria-label="Cancel" class="text-xs hover:underline" on:click="{() => cancel()}">Cancel</button>
        <button
          class="pf-c-button pf-m-primary transition ease-in-out delay-50 hover:cursor-pointer h-full rounded-md shadow hover:shadow-lg justify-center pb-1"
          aria-label="Next"
          disabled="{!items.find(item => item.selected)}"
          on:click="{() => next()}">Next</button>
      </div>
    </div>
  </div>
{/if}
