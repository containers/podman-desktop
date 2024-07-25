<script lang="ts">
import { SearchInput } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { type Unsubscriber } from 'svelte/store';

import { context } from '/@/stores/context';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import Route from '../../Route.svelte';
import type { ContextUI } from '../context/context';
import PreferencesRenderingItem from './PreferencesRenderingItem.svelte';
import SettingsPage from './SettingsPage.svelte';
import { isDefaultScope, isPropertyValidInContext } from './Util';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let key: string;

// Context variables
let contextsUnsubscribe: Unsubscriber;
let globalContext: ContextUI;

// Search and matching records
let updateSearchValueTimeout: NodeJS.Timeout;
let matchingRecords: Map<string, IConfigurationPropertyRecordedSchema[]>;
export let searchValue = '';
$: searchValue;
$: matchingRecords = properties
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
  }, new Map<string, IConfigurationPropertyRecordedSchema[]>());

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
function updateSearchValue(event: any) {
  clearTimeout(updateSearchValueTimeout);
  updateSearchValueTimeout = setTimeout(() => (searchValue = event.target.value), 500);
}
</script>

<Route path="/" breadcrumb={key}>
  <SettingsPage title="Preferences">
    <SearchInput slot="header" title="preferences" class="mt-4" on:input={e => updateSearchValue(e)} />
    <div class="flex flex-col space-y-5 text-[var(--pd-content-header)]">
      {#if matchingRecords.size === 0}
        <div>No Settings Found</div>
      {:else}
        {#each [...matchingRecords.keys()].sort((a, b) => a.localeCompare(b)) as configSection}
          {@const records = matchingRecords.get(configSection)}
          {#if records}
            <div>
              <div class="text-lg font-semibold first-letter:uppercase">{records.at(0)?.title}</div>
              {#each records as configItem}
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
