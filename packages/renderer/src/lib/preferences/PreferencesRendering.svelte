<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../../../main/src/plugin/configuration-registry-constants';

import PreferencesRenderingItem from './PreferencesRenderingItem.svelte';
import SettingsPage from './SettingsPage.svelte';
import Route from '../../Route.svelte';
import { onMount } from 'svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let key: string;

let matchingRecords: Map<string, IConfigurationPropertyRecordedSchema[]>;

$: matchingRecords = properties
  .filter(
    property => property.parentId.startsWith(key) && property.scope === CONFIGURATION_DEFAULT_SCOPE && !property.hidden,
  )
  .reduce((map, property) => {
    if (!map.has(property.parentId)) {
      map.set(property.parentId, []);
    }
    map.get(property.parentId).push(property);
    return map;
  }, new Map<string, IConfigurationPropertyRecordedSchema[]>());
</script>

<Route path="/" breadcrumb="{key}" let:meta>
  <SettingsPage title="Preferences">
    <div class="flex flex-col min-w-full rounded-md px-3">
      {#each [...matchingRecords.keys()].sort((a, b) => a.localeCompare(b)) as configSection}
        <div class="mt-5">
          <div class="first-letter:uppercase">{configSection.replace('preferences.', '').replace('.', ' ')}</div>
          {#each matchingRecords.get(configSection) as configItem}
            <div class="bg-zinc-800 rounded-md mt-2 ml-2">
              <PreferencesRenderingItem record="{configItem}" />
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </SettingsPage>
</Route>
