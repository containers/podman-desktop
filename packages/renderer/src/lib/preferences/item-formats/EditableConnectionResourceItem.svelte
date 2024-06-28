<script lang="ts">
import { filesize } from 'filesize';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import { getNormalizedDefaultNumberValue } from '../Util';
import EditableItem from './EditableItem.svelte';

export let record: IConfigurationPropertyRecordedSchema;
export let value: number | undefined = undefined;
export let onSave = (_recordId: string, _value: number) => {};

let recordValue: DisplayConfigurationValue | undefined;
$: recordValue = getDisplayConfigurationValue(record, value);

function onChangeInput(_recordId: string, _value: number) {
  const displayConfigurationValue = getDisplayConfigurationValue(record, value);
  if (displayConfigurationValue) {
    onSave(_recordId, normalizeValue(_value));
  }
}

function onCancel(_recordId: string, originalValue: number) {
  onSave(_recordId, originalValue);
}

interface DisplayConfigurationValue {
  value: number;
  format?: string;
  exponent?: number;
}

function getDisplayConfigurationValue(
  configurationKey: IConfigurationPropertyRecordedSchema,
  value?: unknown,
): DisplayConfigurationValue | undefined {
  if (configurationKey.format === 'memory' || configurationKey.format === 'diskSize') {
    const fileSizeItem = value
      ? filesize(value as number, { output: 'object' })
      : filesize(getNormalizedDefaultNumberValue(configurationKey), { output: 'object' });
    // the value returned consists of a number and its format (e.g 20 GB) and its exponent(2 for MB, 3 for GB, etc).
    // We return the number as value and the format as description for the editableItem component
    return {
      value: Number(fileSizeItem.value),
      format: fileSizeItem.symbol,
      exponent: fileSizeItem.exponent,
    };
  } else if (configurationKey.format === 'cpu') {
    return {
      value: value ? Number(value) : Number(getNormalizedDefaultNumberValue(configurationKey)),
    };
  }
  return undefined;
}

function getFileSizeValue(fileSizeItem: string): number {
  return parseFloat(fileSizeItem.split(' ')[0]);
}

function normalizeDiskAndMemoryConfigurationKey(
  configurationKey: IConfigurationPropertyRecordedSchema,
  recordValue?: DisplayConfigurationValue,
): IConfigurationPropertyRecordedSchema {
  const configurationKeyClone = Object.assign({}, configurationKey);
  // if configurationKey is memory or diskSize let's convert the values in bytes to the most appropriate unit so, in case of errors, the message is displayed correctly to the user
  // instead of having "the value must be less than 16000000000" will be ".... less than 16"
  if ((configurationKey.format === 'memory' || configurationKey.format === 'diskSize') && recordValue?.exponent) {
    configurationKeyClone.maximum =
      typeof configurationKey.maximum === 'number'
        ? getFileSizeValue(filesize(configurationKey.maximum, { exponent: recordValue.exponent }))
        : configurationKey.maximum;
    configurationKeyClone.minimum = configurationKey.minimum
      ? getFileSizeValue(filesize(configurationKey.minimum, { exponent: recordValue.exponent }))
      : configurationKey.minimum;
    configurationKeyClone.default =
      typeof configurationKey.maximum === 'number' && configurationKey.default
        ? getFileSizeValue(filesize(configurationKey.default, { exponent: recordValue.exponent }))
        : configurationKey.default;
    return configurationKeyClone;
  }
  return configurationKey;
}

function normalizeValue(originalValue: number): number {
  const displayConfigurationValue = getDisplayConfigurationValue(record, value);
  if (!displayConfigurationValue) {
    return originalValue;
  }
  return originalValue * Math.pow(1000, displayConfigurationValue.exponent || 0);
}
</script>

{#if record && recordValue}
  <EditableItem
    record="{normalizeDiskAndMemoryConfigurationKey(record, recordValue)}"
    value="{recordValue.value}"
    description="{recordValue.format}"
    onCancel="{onCancel}"
    onChange="{onChangeInput}"
    normalizeOriginalValue="{normalizeValue}" />
{/if}
