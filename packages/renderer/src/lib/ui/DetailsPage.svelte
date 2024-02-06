<script lang="ts">
import { lastPage, currentPage } from '../../stores/breadcrumb';
import { router } from 'tinro';
import Link from './Link.svelte';

export let title: string;
export let titleDetail: string | undefined = undefined;
export let subtitle: string | undefined = undefined;

export function close(): void {
  router.goto($lastPage.path);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close();
    e.preventDefault();
  }
}
</script>

<svelte:window on:keydown="{handleKeydown}" />

<div class="flex flex-col w-full h-full shadow-pageheader">
  <div class="flex flex-row w-full h-fit px-5 pt-4 pb-2">
    <div class="flex flex-col w-full h-fit">
      <div class="flex flew-row items-center text-sm text-gray-700">
        <Link class="text-sm" aria-label="back" internalRef="{$lastPage.path}" title="Go back to {$lastPage.name}"
          >{$lastPage.name}</Link>
        <div class="mx-2">&gt;</div>
        <div class="grow font-extralight" aria-label="name">{$currentPage.name}</div>
        <a href="{$lastPage.path}" title="Close" class="justify-self-end text-gray-900">
          <i class="fas fa-times" aria-hidden="true"></i>
        </a>
      </div>
      <div class="flex flex-row items-start pt-1">
        <div class="pr-3">
          <slot name="icon" />
        </div>
        <div class="flex flex-col grow pr-2">
          <div class="flex flex-row items-baseline">
            <h1 aria-label="{title}" class="text-xl leading-tight">{title}</h1>
            <div class="text-violet-400 ml-2 leading-normal" class:hidden="{!titleDetail}">{titleDetail}</div>
          </div>
          <div>
            <span class="text-sm leading-none text-gray-900" class:hidden="{!subtitle}">{subtitle}</span>
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
  <div class="flex flex-row px-2 border-b border-charcoal-400">
    <slot name="tabs" />
  </div>
  <div class="h-full bg-charcoal-900 min-h-0">
    <slot name="content" />
  </div>
</div>
