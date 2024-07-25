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
  innerOnSave(_recordId, _value);
}

function onCancel(_recordId: string, originalValue: number) {
  innerOnSave(_recordId, originalValue);
}

interface DisplayConfigurationValue {
  value: number;
  format?: string;
}

function getDisplayConfigurationValue(
  configurationKey: IConfigurationPropertyRecordedSchema,
  value?: unknown,
): DisplayConfigurationValue | undefined {
  if (configurationKey.format === 'memory' || configurationKey.format === 'diskSize') {
    const fileSizeItem = value
      ? filesize(value as number)
      : filesize(getNormalizedDefaultNumberValue(configurationKey));
    const fileSizeItems = fileSizeItem.split(' ');
    // the value returned consists of a number and its format (e.g 20 GB). We return the number as value and the format as description for the editableItem component
    return {
      value: Number(fileSizeItems[0]),
      format: fileSizeItems[1],
    };
  } else if (configurationKey.format === 'cpu') {
    return {
      value: value ? Number(value) : Number(getNormalizedDefaultNumberValue(configurationKey)),
    };
  }
  return undefined;
}

function getFileSizeValue(fileSizeItem: string): number {
  return parseInt(fileSizeItem.split(' ')[0]);
}

function normalizeDiskAndMemoryConfigurationKey(
  configurationKey: IConfigurationPropertyRecordedSchema,
): IConfigurationPropertyRecordedSchema {
  const configurationKeyClone = Object.assign({}, configurationKey);
  // if configurationKey is memory or diskSize let's convert the values in bytes to GB so, in case of errors, the message is displayed correctly to the user
  // instad of having "the value must be less than 16000000000" will be ".... less than 16"
  if (configurationKey.format === 'memory' || configurationKey.format === 'diskSize') {
    configurationKeyClone.maximum =
      typeof configurationKey.maximum === 'number'
        ? getFileSizeValue(filesize(configurationKey.maximum))
        : configurationKey.maximum;
    configurationKeyClone.minimum = configurationKey.minimum
      ? getFileSizeValue(filesize(configurationKey.minimum))
      : configurationKey.minimum;
    configurationKeyClone.default =
      typeof configurationKey.maximum === 'number' && configurationKey.default
        ? getFileSizeValue(filesize(configurationKey.default))
        : configurationKey.default;
    return configurationKeyClone;
  }
  return configurationKey;
}

function innerOnSave(_recordId: string, _value: number) {
  // convert value to byte to be saved
  const displayConfigurationValue = getDisplayConfigurationValue(record, value);
  if (displayConfigurationValue) {
    switch (displayConfigurationValue.format) {
      case 'GB': {
        _value = _value * 1000 * 1000 * 1000;
        break;
      }
      case 'MB': {
        _value = _value * 1000 * 1000;
        break;
      }
    }
    onSave(_recordId, _value);
  }
}
</script>

{#if record && recordValue}
  <EditableItem
    record={normalizeDiskAndMemoryConfigurationKey(record)}
    value={recordValue.value}
    description={recordValue.format}
    onCancel={onCancel}
    onChange={onChangeInput} />
{/if}
