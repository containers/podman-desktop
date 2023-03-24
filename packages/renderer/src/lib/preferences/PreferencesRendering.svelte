<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../../../main/src/plugin/configuration-registry-constants';

import PreferencesRenderingItem from './PreferencesRenderingItem.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let key: string;

let title;

$: title = key.replaceAll('.', ' ');
$: matchingRecords = properties.filter(
  property => property.parentId.startsWith(key) && property.scope === CONFIGURATION_DEFAULT_SCOPE && !property.hidden,
);
</script>

<div class="flex flex-1 flex-col">
  <table class="divide-y divide-gray-800 mt-2 min-w-full">
    <tbody class="bg-zinc-800 divide-y-8 divide-zinc-700">
      {#each matchingRecords as record}
        <tr>
          <td>
            <PreferencesRenderingItem record="{record}" />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
