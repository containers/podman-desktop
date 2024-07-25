<script lang="ts">
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import BooleanItem from '/@/lib/preferences/item-formats/BooleanItem.svelte';
import EnumItem from '/@/lib/preferences/item-formats/EnumItem.svelte';
import FileItem from '/@/lib/preferences/item-formats/FileItem.svelte';
import NumberItem from '/@/lib/preferences/item-formats/NumberItem.svelte';
import SliderItem from '/@/lib/preferences/item-formats/SliderItem.svelte';
import StringItem from '/@/lib/preferences/item-formats/StringItem.svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import Markdown from '../markdown/Markdown.svelte';
import { getNormalizedDefaultNumberValue } from './Util';

let invalidText: string | undefined = undefined;
export let invalidRecord = (_error: string) => {};
export let validRecord = () => {};
export let updateResetButtonVisibility = (_recordValue: any) => {};
export let resetToDefault = false;
export let enableAutoSave = false;

export let setRecordValue = (_id: string, _value: string | boolean | number) => {};
export let enableSlider = false;
export let record: IConfigurationPropertyRecordedSchema;
export let initialValue: Promise<any>;
export let givenValue: unknown = undefined;

let currentRecord: IConfigurationPropertyRecordedSchema;
let recordUpdateTimeout: NodeJS.Timeout;

let recordValue: string | boolean | number | undefined;
$: recordValue;
$: updateResetButtonVisibility?.(recordValue);

$: if (resetToDefault) {
  recordValue = record.type === 'number' ? getNormalizedDefaultNumberValue(record) : record.default;
  if (ensureType(recordValue)) {
    update(record);
  }

  resetToDefault = false;
}

$: if (currentRecord !== record) {
  initialValue.then(value => {
    recordValue = value;
    if (record.type === 'boolean') {
      recordValue = !!value;
    }
  });

  currentRecord = record;
}

async function update(record: IConfigurationPropertyRecordedSchema) {
  // save the value
  if (record.id) {
    try {
      await window.updateConfigurationValue(record.id, recordValue, record.scope);
    } catch (error) {
      invalidText = String(error);
      invalidRecord(invalidText);
      throw error;
    }
  }
}

function autoSave(): Promise<void> {
  if (enableAutoSave) {
    return new Promise((_, reject) => {
      recordUpdateTimeout = setTimeout(() => {
        update(record).catch((err: unknown) => reject(err));
      }, 1000);
    });
  }
  return Promise.resolve();
}

function ensureType(value: any): boolean {
  switch (typeof value) {
    case 'boolean':
      return record.type === 'boolean';
    case 'number':
      return record.type === 'number';
    case 'string':
      return record.type === 'string';
    default:
      return false;
  }
}

async function onChange(recordId: string, value: boolean | string | number): Promise<void> {
  if (!ensureType(value)) {
    invalidText = `Value type provided is ${typeof value} instead of ${record.type}.`;
    invalidRecord(invalidText);
    return Promise.reject(invalidText);
  }

  clearTimeout(recordUpdateTimeout);

  // update the value
  recordValue = value;

  // propagate the update to parent
  setRecordValue(recordId, value);

  // valid the value (each child component is responsible for validating the value
  invalidText = undefined;
  validRecord();

  // auto save
  return await autoSave();
}
</script>

<div class="flex flex-row mb-1 pt-2 text-start items-center justify-start">
  {#if invalidText}
    <ErrorMessage error="{invalidText}." icon={true} class="mr-2" />
  {/if}
  {#if record.type === 'boolean'}
    <BooleanItem record={record} checked={!!recordValue} onChange={onChange} />
  {:else if record.type === 'number'}
    {#if enableSlider && typeof record.maximum === 'number'}
      <SliderItem
        record={record}
        value={typeof givenValue === 'number' ? givenValue : getNormalizedDefaultNumberValue(record)}
        onChange={onChange} />
    {:else}
      <NumberItem
        record={record}
        value={typeof recordValue === 'number' ? recordValue : getNormalizedDefaultNumberValue(record)}
        onChange={onChange}
        invalidRecord={invalidRecord} />
    {/if}
  {:else if record.type === 'string' && (typeof recordValue === 'string' || recordValue === undefined)}
    {#if record.format === 'file' || record.format === 'folder'}
      <FileItem record={record} value={recordValue ?? ''} onChange={onChange} />
    {:else if record.enum && record.enum.length > 0}
      <EnumItem record={record} value={recordValue} onChange={onChange} />
    {:else}
      <StringItem record={record} value={recordValue} onChange={onChange} />
    {/if}
  {:else if record.type === 'markdown'}
    <div class="text-sm">
      <Markdown markdown={record.markdownDescription} />
    </div>
  {/if}
</div>
