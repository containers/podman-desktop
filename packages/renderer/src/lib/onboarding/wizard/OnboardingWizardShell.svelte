<script lang="ts">
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

interface Props extends HTMLAttributes<HTMLDivElement> {
  leftSidebar: Snippet;
  leftSidebarFooter: Snippet;
  rightContent: Snippet;
  footer: Snippet;
  sidebarTitle?: string;
  /** When true the sidebar is hidden and only the content area is shown. */
  hideSidebar?: boolean;
}

let {
  leftSidebar,
  leftSidebarFooter,
  rightContent,
  footer,
  sidebarTitle = 'Get started',
  hideSidebar = false,
  class: className,
  ...restProps
}: Props = $props();
</script>

<div class={['flex h-full w-full overflow-hidden', className]} {...restProps}>
  {#if !hideSidebar}
    <aside
      class="flex min-h-full w-56 min-w-56 shrink-0 flex-col bg-(--pd-content-bg)">
      <div class="flex h-full flex-col justify-between px-6 pt-10 pb-6">
        <div class="flex min-h-0 flex-1 flex-col gap-6">
          <div class="text-xl font-bold leading-[1.4] text-(--pd-content-header) [text-wrap:balance]">{sidebarTitle}</div>
          <div class="min-h-0 flex-1 overflow-y-auto">
            {@render leftSidebar?.()}
          </div>
        </div>
        {#if leftSidebarFooter}
          <div class="pt-4">
            {@render leftSidebarFooter()}
          </div>
        {/if}
      </div>
    </aside>
  {/if}

  <section
    aria-label="Content"
    class="relative flex min-h-full min-w-0 flex-1 flex-col overflow-hidden bg-linear-to-br from-(--pd-content-bg) via-(--pd-content-card-bg) to-(--pd-content-bg)">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent via-transparent to-(--pd-button-primary-bg) opacity-10">
    </div>
    <div class="relative z-10 min-h-0 flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 lg:p-10">
      {@render rightContent?.()}
    </div>
    {#if footer}
      <footer class="relative z-10 bg-transparent px-8 pt-4 pb-7 lg:px-10">
        {@render footer()}
      </footer>
    {/if}
  </section>
</div>
