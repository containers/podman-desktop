<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../../../main/src/plugin/configuration-registry-constants';

import PreferencesRenderingItem from './PreferencesRenderingItem.svelte';
import SettingsPage from './SettingsPage.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let key: string;

let title;

$: title = key.replaceAll('.', ' ');
$: matchingRecords = properties.filter(
  property => property.parentId.startsWith(key) && property.scope === CONFIGURATION_DEFAULT_SCOPE && !property.hidden,
);
</script>

<SettingsPage title="Preferences">
  <table class="divide-y divide-zinc-800 min-w-full mt-5 rounded-md p-3">
    <tbody class="bg-zinc-800 divide-y-8 divide-zinc-900">
      {#each matchingRecords as record}
        <tr>
          <td>
            <PreferencesRenderingItem record="{record}" />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</SettingsPage>
