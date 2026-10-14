<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { SearchInput } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { type Unsubscriber } from 'svelte/store';

import type { ContextUI } from '/@/lib/context/context';
import Route from '/@/Route.svelte';
import { context } from '/@/stores/context';

import PreferencesRenderingItem from './PreferencesRenderingItem.svelte';
import SettingsPage from './SettingsPage.svelte';
import { isDefaultScope, isPropertyValidInContext } from './Util';

interface Props {
  properties: IConfigurationPropertyRecordedSchema[];
  key: string;
  searchValue?: string;
}

let { properties = [], key, searchValue = '' }: Props = $props();

// Context variables
let contextsUnsubscribe: Unsubscriber;
let globalContext: ContextUI;

// Search and matching records
let updateSearchValueTimeout: NodeJS.Timeout;
const matchingRecords = $derived(
  properties
    .filter(property => property.parentId.startsWith(key) && isDefaultScope(property.scope) && !property.hidden)
    .filter(property => isPropertyValidInContext(property.when, globalContext))
    .filter(
      property =>
        !searchValue ||
        matchValue(property.title, searchValue) ||
        (!!property.description && matchValue(property.description, searchValue)) ||
        (!!property.markdownDescription && matchValue(property.markdownDescription, searchValue)),
    )
    .reduce((map, property) => {
      if (!map.has(property.parentId)) {
        map.set(property.parentId, []);
      }
      map.get(property.parentId)?.push(property);
      return map;
    }, new Map<string, IConfigurationPropertyRecordedSchema[]>()),
);

onMount(async () => {
  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
  });
});

onDestroy(() => {
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

function matchValue(text: string, searchValue: string): boolean {
  if (!text) {
    return false;
  }
  return text.toLowerCase().indexOf(searchValue.toLowerCase()) >= 0;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateSearchValue(event: any): void {
  clearTimeout(updateSearchValueTimeout);
  updateSearchValueTimeout = setTimeout(() => (searchValue = event.target.value), 500);
}
</script>

<Route path="/" breadcrumb={key}>
  <SettingsPage title="Preferences">
    {#snippet header()}
        <SearchInput  title="preferences" class="mt-4" oninput={updateSearchValue} />
      {/snippet}
    <div class="flex flex-col space-y-5 text-[var(--pd-content-header)] pb-2">
      {#if matchingRecords.size === 0}
        <div>No Settings Found</div>
      {:else}
        {#each [...matchingRecords.keys()].toSorted((a, b) => a.localeCompare(b)) as configSection, index (index)}
          {@const records = matchingRecords.get(configSection)}
          {#if records}
            <div>
              <div class="text-lg font-medium first-letter:uppercase">{records.at(0)?.title}</div>
              {#each records as configItem (configItem.id)}
                <div class="bg-[var(--pd-invert-content-card-bg)] rounded-md mt-2 ml-2">
                  <PreferencesRenderingItem record={configItem} />
                </div>
              {/each}
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  </SettingsPage>
</Route>
