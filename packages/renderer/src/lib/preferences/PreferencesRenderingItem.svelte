<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../preload/src/configuration-registry';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';

export let record: IConfigurationPropertyRecordedSchema;

let recordUI: {
  title: string;
  breadCrumb: string;
  description: string;
  original: IConfigurationPropertyRecordedSchema;
};

// add space from camel case and upper case on the first letter
function startCase(str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => {
    return str.toUpperCase();
  });
}
function update() {
  const id = record.id;
  // take string after the last dot
  const key = id.substring(id.lastIndexOf('.') + 1);

  // define bread crumb as first part before the last dot
  const breadCrumb = id.substring(0, id.lastIndexOf('.'));
  // and replace dot by > in breadcrumb
  const breadCrumbUI = breadCrumb.replace(/\./g, ' > ').concat(':');

  recordUI = {
    title: startCase(key),
    breadCrumb: breadCrumbUI,
    description: record.description,
    original: record,
  };
}
$: {
  update();
}
</script>

<div class="flex flex-col px-2">
  <div class="flex">
    <div>{recordUI.breadCrumb}</div>
    <div class="ml-2">{recordUI.title}</div>
  </div>
  <div class="mb-1">{recordUI.description}</div>
  <PreferencesRenderingItemFormat record="{recordUI.original}" />
</div>
