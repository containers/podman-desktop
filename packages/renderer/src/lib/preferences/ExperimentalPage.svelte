<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';

import Markdown from '/@/lib/markdown/Markdown.svelte';
import PreferencesRenderingItem from '/@/lib/preferences/PreferencesRenderingItem.svelte';
import SettingsPage from '/@/lib/preferences/SettingsPage.svelte';
import { getInitialValue } from '/@/lib/preferences/Util';
import SlideToggle from '/@/lib/ui/SlideToggle.svelte';

interface Props {
  properties: IConfigurationPropertyRecordedSchema[];
}

let { properties = [] }: Props = $props();

let experimental: IConfigurationPropertyRecordedSchema[] = $derived(
  properties.filter(property => !!property.experimental && !property.hidden),
);

let values: Record<string, boolean> = $state({});
let all: boolean = $derived(Object.values(values).every(value => value));
let loading: boolean = $state(false);

function update(propertyId: string, value: unknown): void {
  if (value === undefined) {
    values[propertyId] = false;
  } else if (typeof value === 'boolean') {
    values[propertyId] = value;
  } else if (typeof value === 'object') {
    values[propertyId] = true;
  }
}

function refresh(): void {
  experimental.forEach(property => {
    if (!property.id) return;

    getInitialValue(property)
      .then(update.bind(undefined, property.id))
      .catch((err: unknown) => console.error(`Error getting initial value ${property.id}`, err));
  });
}

async function onCheckedAll(event: { detail: boolean }): Promise<void> {
  loading = true;
  try {
    for (const property of experimental) {
      if (!property.id) continue;
      const enabled = await window.isExperimentalConfigurationEnabled(property.id, property.scope);
      // If is the feature enabled and we want to enable all, enable only those that are not enabled yet
      // If is the feature disabled and we want to disable all, disable only those that are not disabled yet
      if (event.detail === enabled) {
        continue;
      }

      const settings = event.detail ? {} : false;
      await window.updateExperimentalConfigurationValue(property.id, settings, property.scope);
    }
  } finally {
    loading = false;
  }
}

$effect(() => {
  refresh();
});
</script>

<SettingsPage title="Experimental Features">
  <div class="flex flex-col space-y-5 text-[var(--pd-content-header)]">

    <div class="ml-2 flex flex-row bg-[var(--pd-invert-content-card-bg)] rounded-md px-2 pt-2">
      <div class="flex flex-col w-full text-[color:var(--pd-invert-content-card-text)]">
        <div>
          <span class="font-semibold">Enable all experimental features</span>
        </div>
        <div class="pt-1 text-[color:var(--pd-invert-content-card-text)] text-sm pr-2">
          <Markdown markdown="Enable the section to turn on **all experimental features** and give feedback to developers. Or select individual features to try below." />
        </div>
      </div>
      <div class="flex flex-row text-start items-center justify-start">
        <SlideToggle
          id="input-experimental-enable-all"
          name="Enable all experimental features"
          left
          checked={all}
          on:checked={onCheckedAll}
          disabled={loading}
        >
          <span class="text-xs">Enabled</span>
        </SlideToggle>
      </div>
    </div>

    {#each experimental as configItem (configItem.id)}
      <div>
        <div class="bg-[var(--pd-invert-content-card-bg)] rounded-md mt-2 ml-2">
          <PreferencesRenderingItem title="full" record={configItem} />
        </div>
      </div>
    {/each}
  </div>
</SettingsPage>
