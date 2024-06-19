<script lang="ts">
import { createEventDispatcher } from 'svelte';

import CloseButton from '../button/CloseButton.svelte';
import Link from '../link/Link.svelte';
import LinearProgress from '../progress/LinearProgress.svelte';

export let title: string;
export let showBreadcrumb = true;
export let inProgress = false;
export let breadcrumbLeftPart: string | undefined = undefined;
export let breadcrumbRightPart: string | undefined = undefined;
export let breadcrumbTitle: string | undefined = '';

const dispatchClose = createEventDispatcher<{ close: undefined }>();

function close(): void {
  dispatchClose('close');
}

const dispatchBreadCrumb = createEventDispatcher<{ breadcrumbClick: undefined }>();

function breadcrumbClick(): void {
  dispatchBreadCrumb('breadcrumbClick');
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    close();
    e.preventDefault();
  }
}
</script>

<svelte:window on:keydown="{handleKeydown}" />

<div class="flex flex-col w-full h-full shadow-pageheader bg-[var(--pd-content-bg)]">
  <div class="flex flex-row w-full h-fit px-5 pt-4" class:pb-3.5="{inProgress}" class:pb-4="{!inProgress}">
    <div class="flex flex-col w-full h-fit">
      {#if showBreadcrumb}
        <div class="flex flew-row items-center text-sm text-[var(--pd-content-breadcrumb)]">
          {#if breadcrumbLeftPart}
            <Link aria-label="back" on:click="{breadcrumbClick}" title="{breadcrumbTitle}">{breadcrumbLeftPart}</Link>
          {/if}
          {#if breadcrumbRightPart}
            <div class="mx-2">&gt;</div>
            <div class="grow font-extralight" aria-label="name">{breadcrumbRightPart}</div>
          {/if}
          <CloseButton class="justify-self-end" on:click="{close}" />
        </div>
      {/if}
      <div class="flex flex-row items-center pt-1">
        {#if $$slots.icon}
          <div class="pr-3 text-[var(--pd-content-header-icon)]">
            <slot name="icon" />
          </div>
        {/if}
        <h1 aria-label="{title}" class="grow text-xl first-letter:uppercase text-[var(--pd-content-header)]">
          {title}
        </h1>
        <div class="flex items-center space-x-3">
          {#if $$slots.actions}
            <div class="flex flex-nowrap justify-self-end pl-3 space-x-2">
              <slot name="actions" />
            </div>
          {/if}
          {#if !showBreadcrumb}
            <CloseButton class="justify-self-end" on:click="{close}" />
          {/if}
        </div>
      </div>
    </div>
  </div>
  {#if inProgress}
    <LinearProgress />
  {/if}
  {#if $$slots.tabs}
    <div class="flex flex-row px-2">
      <slot name="tabs" />
    </div>
  {/if}
  <div class="flex w-full h-full overflow-auto">
    <slot name="content" />
  </div>
</div>
