<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../preload/src/configuration-registry';
import PreferencesRenderingItem from './PreferencesRenderingItem.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let key: string;
export let matchingRecords: IConfigurationPropertyRecordedSchema[] = [];

let title;

$: title = key.replaceAll('.', ' ');
$: matchingRecords = properties.filter(property => property.parentId.startsWith(key));
</script>

<div class="flex flex-1 flex-col">
  <h1 class="capitalize text-xl">{title}</h1>
  <table class="divide-y divide-gray-800 mt-2 min-w-full">
    <tbody class="bg-gray-800 divide-y divide-gray-200 ">
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
