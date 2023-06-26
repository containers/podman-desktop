<script lang="ts">
import Route from '../../Route.svelte';

export let name: string;
export let title: string;
export let titleDetail: string = undefined;
export let subtitle: string = undefined;
export let parentName: string = undefined;
export let parentURL: string = undefined;
</script>

<Route path="/*">
  <div class="w-full h-full">
    <div class="flex h-full flex-col">
      <div class="flex w-full flex-row">
        <div class="w-full pl-5 pt-5">
          <div class="flex flew-row items-center">
            <a
              class="text-violet-400 text-base hover:no-underline"
              aria-label="back"
              href="{parentURL}"
              title="Go back to {parentName}">{parentName}</a>
            <div class="text-xl mx-2 text-gray-700">></div>
            <div class="text-sm font-extralight text-gray-700">{name}</div>
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
              <div class="mr-2 pb-4 text-small text-gray-900">{subtitle}</div>
            </div>
          </div>
        </div>
        <div class="flex flex-col pr-2 pt-5">
          <slot name="actions" />
          <slot name="detail" />
        </div>
        <a href="{parentURL}" title="Close Details" class="mt-2 mr-2 text-gray-900"
          ><i class="fas fa-times" aria-hidden="true"></i></a>
      </div>
      <section class="pf-c-page__main-tabs pf-m-limit-width">
        <div class="pf-c-page__main-body">
          <div class="pf-c-tabs pf-m-page-insets" id="open-tabs-example-tabs-list">
            <ul class="pf-c-tabs__list">
              <slot name="tabs" />
            </ul>
          </div>
        </div>
      </section>
      <div class="h-full bg-charcoal-900">
        <slot name="content" />
      </div>
    </div>
  </div>
</Route>
