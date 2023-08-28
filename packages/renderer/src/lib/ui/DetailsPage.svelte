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
</script>

<div class="w-full h-full">
  <div class="flex h-full flex-col">
    <div class="flex w-full flex-row">
      <div class="w-full pl-5 pt-4">
        <div class="flex flew-row items-center">
          <Link aria-label="back" internalRef="{$lastPage.path}" title="Go back to {$lastPage.name}"
            >{$lastPage.name}</Link>
          <div class="text-xl mx-2 text-gray-700">></div>
          <div class="text-sm font-extralight text-gray-700" aria-label="name">{$currentPage.name}</div>
        </div>
        <div class="text-lg flex flex-row items-start pt-1">
          <div class="pr-3 pt-1">
            <slot name="icon" />
          </div>
          <div class="text-lg flex flex-col">
            <div class="flex flex-row items-baseline">
              <h1>{title}</h1>
              <div class="text-base text-violet-400 ml-2" class:hidden="{!titleDetail}">{titleDetail}</div>
            </div>
            <div class="mr-2 pb-4">
              <span class="text-small text-gray-900" class:hidden="{!subtitle}">{subtitle}</span>
              <slot name="subtitle" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col pr-2 pt-5">
        <div class="flex justify-end space-x-2">
          <slot name="actions" />
        </div>
        <slot name="detail" />
      </div>
      <a href="{$lastPage.path}" title="Close Details" class="mt-2 mr-2 text-gray-900"
        ><i class="fas fa-times" aria-hidden="true"></i></a>
    </div>
    <div class="flex flex-row px-2 border-b border-charcoal-400">
      <slot name="tabs" />
    </div>
    <div class="h-full bg-charcoal-900">
      <slot name="content" />
    </div>
  </div>
</div>
