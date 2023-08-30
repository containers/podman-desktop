<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { CONFIGURATION_DEFAULT_SCOPE } from '../../../../main/src/plugin/configuration-registry-constants';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import Markdown from '../markdown/Markdown.svelte';
import { getNormalizedDefaultNumberValue } from './Util';
import BooleanItem from '/@/lib/preferences/item-formats/BooleanItem.svelte';
import SliderItem from '/@/lib/preferences/item-formats/SliderItem.svelte';
import NumberItem from '/@/lib/preferences/item-formats/NumberItem.svelte';
import FileItem from '/@/lib/preferences/item-formats/FileItem.svelte';
import EnumItem from '/@/lib/preferences/item-formats/EnumItem.svelte';
import StringItem from '/@/lib/preferences/item-formats/StringItem.svelte';

let invalidText = undefined;
export let invalidRecord = (_error: string) => {};
export let validRecord = () => {};
export let updateResetButtonVisibility = (_recordValue: any) => {};
export let resetToDefault = false;
export let enableAutoSave = false;

export let setRecordValue = (_id: string, _value: string) => {};
export let enableSlider = false;
export let record: IConfigurationPropertyRecordedSchema;

let currentRecord: IConfigurationPropertyRecordedSchema;

let recordValue: any;
$: recordValue;
$: updateResetButtonVisibility?.(recordValue);
let checkboxValue = false;
$: if (resetToDefault) {
  recordValue = record.type === 'number' ? getNormalizedDefaultNumberValue(record) : record.default;
  if (typeof recordValue === 'boolean') {
    checkboxValue = recordValue;
  }
  update(record);
  resetToDefault = false;
}

$: if (currentRecord !== record) {
  if (record.scope === CONFIGURATION_DEFAULT_SCOPE) {
    window.getConfigurationValue(record.id, record.scope).then(value => {
      recordValue = value;
      if (record.type === 'boolean') {
        recordValue = !!value;
        checkboxValue = recordValue;
      }
    });
  } else if (record.default !== undefined) {
    recordValue = record.type === 'number' ? getNormalizedDefaultNumberValue(record) : record.default;
    if (record.type === 'boolean') {
      checkboxValue = recordValue;
    }
  }

  currentRecord = record;
}

function update(record: IConfigurationPropertyRecordedSchema) {
  let value: any = recordValue;
  if (record.type === 'number') {
    value = parseFloat(value);
  } else if (record.type === 'boolean') {
    value = checkboxValue;
  }

  // save the value
  try {
    window.updateConfigurationValue(record.id, value, record.scope);
  } catch (error) {
    invalidText = error;
    invalidRecord(error);
  }
}

function autoSave() {
  if (enableAutoSave) {
    recordUpdateTimeout = setTimeout(() => update(record), 1000);
  }
}

function onChange(recordId: string, value: boolean | string | number) {
  console.log(recordId, value, typeof value);
  recordValue = value;

  switch (typeof value) {
    case 'boolean':
      break;
    case 'number':
      break;
    case 'string':
      setRecordValue(recordId, value);
      break;
  }

  validRecord();
  autoSave();
}
</script>

<div class="flex flex-row mb-1 pt-2">
  <div class="flex flex-col text-start w-full justify-center items-start">
    {#if record.type === 'boolean'}
      <BooleanItem record="{record}" checked="{checkboxValue}" onChange="{onChange}" />
    {:else if enableSlider && record.type === 'number' && typeof record.maximum === 'number'}
      <SliderItem record="{record}" value="{getNormalizedDefaultNumberValue(record)}" onChange="{onChange}" />
    {:else if record.type === 'number'}
      <NumberItem record="{record}" value="{recordValue}" onChange="{onChange}" invalidRecord="{invalidRecord}" />
    {:else if record.type === 'string' && record.format === 'file'}
      <FileItem record="{record}" value="{recordValue}" onChange="{onChange}" />
    {:else if record.type === 'string' && record.enum && record.enum.length > 0}
      <EnumItem record="{record}" value="{recordValue}" onChange="{onChange}" />
    {:else if record.type === 'markdown'}
      <div class="text-sm">
        <Markdown>{record.markdownDescription}</Markdown>
      </div>
    {:else}
      <StringItem record="{record}" value="{recordValue}" onChange="{onChange}" />
    {/if}

    {#if invalidText}
      <ErrorMessage error="{invalidText}." />
    {/if}
  </div>
</div>
