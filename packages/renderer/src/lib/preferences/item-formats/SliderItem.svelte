<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import { uncertainStringToNumber } from '../Util';

export let record: IConfigurationPropertyRecordedSchema;
export let value: number;
export let onChange = async (_id: string, _value: number) => {};

function onInput(event: Event) {
  const target = event.currentTarget as HTMLInputElement;
  const _value = uncertainStringToNumber(target.value);
  if (record.id && _value !== value) onChange(record.id, _value);
}
</script>

<input
  id="input-slider-{record.id}"
  type="range"
  name={record.id}
  min={record.minimum}
  max={record.maximum}
  step={record.step}
  value={value}
  aria-label={record.description}
  on:input={onInput}
  class="w-full h-1 bg-violet-600 rounded-lg appearance-none accent-violet-600 cursor-pointer range-xs mt-2" />
