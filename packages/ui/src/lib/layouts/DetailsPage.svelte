<script lang="ts">
import { createEventDispatcher } from 'svelte';

import CloseButton from '../button/CloseButton.svelte';
import Link from '../link/Link.svelte';

export let title: string;
export let titleDetail: string | undefined = undefined;
export let subtitle: string | undefined = undefined;
export let breadcrumbLeftPart: string | undefined = undefined;
export let breadcrumbRightPart: string | undefined = undefined;
export let breadcrumbTitle: string | undefined = '';

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

<div class="flex flex-col w-full h-full shadow-pageheader bg-[var(--pd-content-bg)]">
  <div class="flex flex-row w-full h-fit px-5 pt-4 pb-2">
    <div class="flex flex-col w-full h-fit">
      <div class="flex flew-row items-center text-sm text-[var(--pd-content-breadcrumb)]">
        {#if breadcrumbLeftPart}
          <Link class="text-sm" aria-label="back" on:click={onbreadcrumbClick} title={breadcrumbTitle}
            >{breadcrumbLeftPart}</Link>
        {/if}
        {#if breadcrumbRightPart}
          <div class="mx-2">&gt;</div>
          <div class="grow font-extralight" aria-label="name">{breadcrumbRightPart}</div>
        {/if}
        <CloseButton class="justify-self-end" on:click={onclose} />
      </div>
      <div class="flex flex-row items-start pt-1">
        <div class="pr-3">
          <slot name="icon" />
        </div>
        <div class="flex flex-col grow pr-2">
          <div class="flex flex-row items-baseline">
            <h1 aria-label={title} class="text-xl leading-tight text-[var(--pd-content-header)]">{title}</h1>
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
          <div class="flex flex-nowrap justify-self-end pl-3 space-x-2">
            <slot name="actions" />
          </div>
          <div class="relative">
            <div class="absolute top-0 right-0">
              <slot name="detail" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-row px-2 border-b border-[var(--pd-content-divider)]">
    <slot name="tabs" />
  </div>
  <div class="h-full bg-[var(--pd-details-bg)] min-h-0">
    <slot name="content" />
  </div>
</div>
