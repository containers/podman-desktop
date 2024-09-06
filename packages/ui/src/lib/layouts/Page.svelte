<script lang="ts">
import { createEventDispatcher, onDestroy, onMount } from 'svelte';

import { LinearProgress } from '..';
import CloseButton from '../button/CloseButton.svelte';
import Link from '../link/Link.svelte';

export let title: string;
export let titleDetail: string | undefined = undefined;
export let subtitle: string | undefined = undefined;
export let breadcrumbLeftPart: string | undefined = undefined;
export let breadcrumbRightPart: string | undefined = undefined;
export let breadcrumbTitle: string | undefined = '';
export let hasClose: boolean = true;
export let inProgress: boolean = false;

let showBreadcrumb = breadcrumbLeftPart ?? breadcrumbRightPart;
let detailSlot: HTMLDivElement;
let observer: MutationObserver;
$: heightOfDetail = 0;

onMount(() => {
  observer = new MutationObserver(() => updateHeight());
  observer.observe(detailSlot, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  updateHeight();
});

onDestroy(() => observer?.disconnect());

function updateHeight(): void {
  heightOfDetail = detailSlot ? detailSlot.getBoundingClientRect().height : 0;
}

const dispatchClose = createEventDispatcher<{ close: undefined }>();
export let onclose: () => void = () => {
  dispatchClose('close');
};

const dispatchBreadCrumb = createEventDispatcher<{ breadcrumbClick: undefined }>();
export let onbreadcrumbClick: () => void = () => {
  dispatchBreadCrumb('breadcrumbClick');
};

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    onclose();
    e.preventDefault();
  }
}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="flex flex-col w-full h-full bg-[var(--pd-content-bg)]">
  <div class="flex flex-row w-full h-fit px-5 pt-4 pb-2" aria-label="Header" role="region">
    <div class="flex flex-col w-full h-fit">
      {#if showBreadcrumb}
        <div
          class="flex flew-row items-center text-sm text-[var(--pd-content-breadcrumb)]"
          role="navigation"
          aria-label="Breadcrumb">
          {#if breadcrumbLeftPart}
            <Link class="text-sm" aria-label="Back" on:click={onbreadcrumbClick} title={breadcrumbTitle}
              >{breadcrumbLeftPart}</Link>
          {/if}
          {#if breadcrumbRightPart}
            <div class="mx-2">&gt;</div>
            <div class="grow font-extralight" aria-label="Page Name">{breadcrumbRightPart}</div>
          {/if}
          {#if hasClose}
            <CloseButton class="justify-self-end text-lg" on:click={onclose} />
          {/if}
        </div>
      {/if}
      <div class="flex flex-row items-center pt-1">
        {#if $$slots.icon}
          <div class="pr-3">
            <slot name="icon" />
          </div>
        {/if}
        <div class="flex flex-col grow pr-2">
          <div class="flex flex-row items-baseline">
            <h1 aria-label={title} class="text-xl font-bold leading-tight text-[var(--pd-content-header)]">
              {title}
            </h1>
            <div class="text-[var(--pd-table-body-text-sub-secondary)] ml-2 leading-normal" class:hidden={!titleDetail}>
              {titleDetail}
            </div>
          </div>
          <div>
            <span class="text-sm leading-none text-[var(--pd-content-sub-header)] line-clamp-1" class:hidden={!subtitle}
              >{subtitle}</span>
            <slot name="subtitle" />
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex flex-nowrap justify-self-end pl-3 space-x-2" aria-label="Control Actions" role="group">
            <slot name="actions" />
          </div>
          <div class="relative">
            <div bind:this={detailSlot} class="absolute top-0 right-0">
              <slot name="detail" />
            </div>
          </div>
          {#if !showBreadcrumb}
            <CloseButton class="justify-self-end" on:click={onclose} />
          {/if}
        </div>
      </div>
    </div>
  </div>
  {#if inProgress}
    <LinearProgress />
  {/if}
  <div
    class="flex flex-row px-2 border-b border-[var(--pd-content-divider)]"
    style="padding-top: {heightOfDetail > 50 ? '1rem' : '0px'}"
    aria-label="Tabs"
    role="region">
    <slot name="tabs" />
  </div>
  <div class="h-full min-h-0" aria-label="Tab Content" role="region">
    <slot name="content" />
  </div>
</div>
