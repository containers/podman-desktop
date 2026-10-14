<script lang="ts">
import type { CustomPickItem } from '@desktop-framework/extension-api';
import { faAngleDown, faAngleUp, faCircleCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onMount } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

import Markdown from '/@/lib/markdown/Markdown.svelte';

import type { CustomPickOptions } from './quickpick-input';

let id = -1;
let title = '';
let description = '';
let icon: string | { light: string; dark: string };
let items: CustomPickItem[];
let canSelectMany = false;
let hideItemSections = false;
let colsPerRow = 2;
let usePopperForDetails = false;
let minHeight = '';

let display = false;

// used to keep track of if the item section is opened or closed (true: close, false: open)
let itemSectionHiddenStatus = new SvelteMap<number, boolean>();

onMount(() => {
  // handle the showCustomPick events
  window.events?.receive('showCustomPick:add', showCustomPickCallback);
});

function showCustomPickCallback(customQuickPickParameter: unknown): void {
  const options: CustomPickOptions | undefined = customQuickPickParameter as CustomPickOptions;
  id = options?.id ?? 0;
  title = options?.title ?? '';
  description = options?.description ?? '';
  icon = options?.icon ?? '';
  items = options?.items ?? [];
  canSelectMany = options?.canSelectMany ?? false;

  if (items.length > 2 && items.length % 3 !== 1) {
    colsPerRow = 3;
  }

  usePopperForDetails = items.length > 3;

  hideItemSections = usePopperForDetails || options?.hideItemSections || false;
  minHeight = options?.minHeight ?? '';

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
): void {
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

async function cancel(): Promise<void> {
  await window.closeCustomPick(id);
  display = false;
}

async function next(): Promise<void> {
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

function setSectionVisibility(index: number, show: boolean): void {
  itemSectionHiddenStatus.set(index, show);
  itemSectionHiddenStatus = itemSectionHiddenStatus;
}

function dragMe(node: HTMLElement): void {
  if (usePopperForDetails) {
    let moving = false;
    let left = 0;
    let top = 0;

    node.style.cursor = 'move';

    node.addEventListener('mousedown', () => {
      moving = true;
    });

    window.addEventListener('mousemove', e => {
      if (moving) {
        left += e.movementX;
        top += e.movementY;
        node.style.top = `${top}px`;
        node.style.left = `${left}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      moving = false;
    });
  }
}
</script>

{#if display}
  <!-- Create overlay-->
  <div
    class="fixed top-0 left-0 right-0 bottom-0 pt-8 pb-3 h-full grid z-50 overflow-y-auto">
    <div
      class="fixed top-0 left-0 w-full h-full bg-[var(--pd-modal-fade)] bg-blend-multiply opacity-60 z-40">
    </div>
    <div
      class="flex flex-col place-self-center w-[650px] rounded-xl bg-[var(--pd-card-bg)] shadow-xl shadow-(--pd-modal-shadow) z-50"
      class:w-[650px]={colsPerRow === 2}
      class:w-[800px]={colsPerRow === 3}>
      <div class="flex flex-col items-center justify-between pl-4 pr-3 py-3 space-x-2 text-[var(--pd-content-card-text)]">
        {#if icon}
          <div class="mb-2">
            <Icon icon={icon} title={title ? title : 'icon'} class="max-h-12" />
          </div>
        {/if}
        {#if title}
          <h1 class="grow text-lg font-bold capitalize" aria-label={title}>{title}</h1>
        {/if}
        {#if description}
          <h3 class="grow text-xs">{description}</h3>
        {/if}
      </div>

      {#each items as _, i (i)}
        {#if i % colsPerRow === 0}
          <div class="flex flex-row flex-wrap mx-auto">
            {#each Array(colsPerRow) as _, j (j)}
              {#if items[(i / colsPerRow) * colsPerRow + j]}
                {@const innerItem = items[(i / colsPerRow) * colsPerRow + j]}
                <div
                  role="button"
                  tabindex={0}
                  class="flex flex-col w-[300px] mx-2 mb-4 h-fit rounded-md group/footer"
                  class:min-h-[minHeight]={minHeight}
                  class:is-selected={innerItem.selected}
                  class:hide-section={itemSectionHiddenStatus.get((i / colsPerRow) * colsPerRow + j)}
                  class:group={!usePopperForDetails && !itemSectionHiddenStatus.get((i / colsPerRow) * colsPerRow + j)}
                  class:w-[300px]={colsPerRow === 2}
                  class:w-[250px]={colsPerRow === 3}
                  on:mousedown={(e): void => handleSelection(e, innerItem)}>
                  {#if innerItem.selected}
                    <div class="relative">
                      <div class="absolute right-0 m-3 text-xl text-[var(--pd-invert-content-info-icon)]">
                        <Icon icon={faCircleCheck} />
                      </div>
                    </div>
                  {/if}

                  <div
                    class="px-4 pt-4 pb-2 bg-[var(--pd-invert-content-card-bg)] group-hover:bg-[var(--pd-modal-dropdown-highlight)] hover:bg-[var(--pd-modal-dropdown-highlight)] group-hover:border-[var(--pd-tab-highlight)] hover:border-[var(--pd-tab-highlight)] rounded-t-md group-[.is-selected]:bg-[var(--pd-modal-dropdown-highlight)] border-t-2 border-x-2 border-transparent"
                    class:border-b-2={usePopperForDetails ||
                      (itemSectionHiddenStatus.get((i / colsPerRow) * colsPerRow + j) ?? false) ||
                      (innerItem.sections?.length ?? 0) === 0}
                    class:rounded-b-md={usePopperForDetails ||
                      (itemSectionHiddenStatus.get((i / colsPerRow) * colsPerRow + j) ?? false) ||
                      (innerItem.sections?.length ?? 0) === 0}
                    class:bg-[var(--pd-modal-dropdown-highlight)]={innerItem.selected}>
                    <div class="flex flex-row mb-1 gap-x-1">
                      <span class="text-md font-bold">{innerItem.title}</span>
                      {#if innerItem.description}
                        <span class="text-xs text-[var(--pd-content-text)]">{innerItem.description}</span>
                      {/if}
                    </div>

                    <div class="mb-2 text-xs">
                      <Markdown markdown={innerItem.markDownContent} />
                    </div>

                    {#if usePopperForDetails || (innerItem.sections && innerItem.sections.length > 0 && itemSectionHiddenStatus.get((i / colsPerRow) * colsPerRow + j))}
                      <div
                        class="p-4 rounded-b-md text-xs flex justify-center"
                        class:invisible={usePopperForDetails &&
                          !itemSectionHiddenStatus.get((i / colsPerRow) * colsPerRow + j)}>
                        <Button
                          type="link"
                          aria-label="Show more"
                          icon={faAngleDown}
                          on:click={(): void => setSectionVisibility((i / colsPerRow) * colsPerRow + j, false)}>
                          Show details
                        </Button>
                      </div>
                    {/if}
                  </div>
                  {#if innerItem.sections}
                    <div
                      role="button"
                      tabindex={0}
                      class:relative={usePopperForDetails}
                      on:mousedown={(e): void => {
                        if (usePopperForDetails || itemSectionHiddenStatus.get((i / colsPerRow) * colsPerRow + j)) {
                          e.stopPropagation();
                        }
                      }}>
                      <div
                        class="flex flex-col {usePopperForDetails
                          ? 'group-[.hide-section]/footer:hidden'
                          : 'group-[.hide-section]/footer:invisible'} rounded-md"
                        class:absolute={usePopperForDetails}
                        class:left-[90px]={usePopperForDetails}
                        class:z-10={usePopperForDetails}
                        class:border-2={usePopperForDetails}
                        class:border-[var(--pd-tab-highlight)]={usePopperForDetails}
                        class:w-[300px]={usePopperForDetails && colsPerRow === 2}
                        class:w-[250px]={usePopperForDetails && colsPerRow === 3}
                        use:dragMe>
                        {#if usePopperForDetails}
                          <div class="relative">
                            <div class="absolute right-0 mr-2 text-xl">
                              <button on:click={(): void => setSectionVisibility((i / colsPerRow) * colsPerRow + j, true)}>
                                <Icon size="0.9x" icon={faXmark} />
                              </button>
                            </div>
                          </div>
                          <div class="flex justify-center py-2 font-bold rounded-t-md bg-[var(--pd-card-bg)]">
                            {innerItem.title}
                          </div>
                        {/if}

                        {#each innerItem.sections as section, i (i)}
                          <div
                            class="flex justify-center py-2 text-xs font-bold group-[.is-selected]:bg-[var(--pd-tab-highlight)] group-hover:bg-[var(--pd-tab-highlight)] border-x-2 border-transparent group-hover:border-[var(--pd-tab-highlight)]
                    bg-[var(--pd-label-bg)]">
                            {section.title}
                          </div>
                          {#if section.content}
                            <div
                              class="bg-[var(--pd-invert-content-card-bg)] group-hover:bg-[var(--pd-modal-dropdown-highlight)] group-[.is-selected]:bg-[var(--pd-modal-dropdown-highlight)] px-4 py-2 flex flex-col text-xs items-center border-x-2 border-transparent group-hover:border-[var(--pd-tab-highlight)]"
                              class:rounded-b-md={usePopperForDetails &&
                                !section.markDownContent &&
                                i === innerItem.sections.length - 1}>
                              {section.content}
                            </div>
                          {/if}
                          {#if section.markDownContent}
                            <div
                              class="bg-[var(--pd-invert-content-card-bg)] group-hover:bg-[var(--pd-modal-dropdown-highlight)] group-[.is-selected]:bg-[var(--pd-modal-dropdown-highlight)] px-4 py-2 flex flex-col text-xs border-x-2 border-transparent group-hover:border-[var(--pd-tab-highlight)]"
                              class:rounded-b-md={usePopperForDetails && i === innerItem.sections.length - 1}>
                              <Markdown markdown={section.markDownContent} />
                            </div>
                          {/if}
                        {/each}
                        {#if !usePopperForDetails && innerItem.sections.length > 0 && !itemSectionHiddenStatus.get((i / colsPerRow) * colsPerRow + j)}
                          <div
                            class="p-4 bg-[var(--pd-invert-content-card-bg)] group-hover:bg-[var(--pd-modal-dropdown-highlight)] group-[.is-selected]:bg-[var(--pd-modal-dropdown-highlight)] rounded-b-md text-xs flex justify-center border-x-2 border-b-2 border-transparent group-hover:border-[var(--pd-tab-highlight)]">
                            <Button
                              type="link"
                              aria-label="Less detail"
                              icon={faAngleUp}
                              on:click={(): void => setSectionVisibility((i / colsPerRow) * colsPerRow + j, true)}>
                              Less details
                            </Button>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      {/each}

      <ButtonRow class="m-2">
        <Button type="link" aria-label="Cancel" on:click={cancel}>Cancel</Button>
        <Button aria-label="Next" disabled={!items.find(item => item.selected)} on:click={next}>Ok</Button>
      </ButtonRow>
    </div>
  </div>
{/if}
