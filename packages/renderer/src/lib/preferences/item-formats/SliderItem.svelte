<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';

import { calcSliderFillPercent, uncertainStringToNumber } from '/@/lib/preferences/Util';

interface Props {
  record: IConfigurationPropertyRecordedSchema;
  value?: number;
  onChange?: (_id: string, _value: number) => Promise<void>;
}
let {
  record,
  value = $bindable(),
  onChange = async (_id: string, _value: number): Promise<void> => {},
}: Props = $props();

// appearance-none drops the browser's native track rendering, which is what would otherwise let
// accent-color paint the filled portion left of the thumb -- so the fill has to be built by hand.
// Writable $derived: reassigning displayValue in onInput overrides it locally until value changes again.
let displayValue = $derived(value);

const fillPercent = $derived(calcSliderFillPercent(record.minimum, record.maximum, displayValue));

const trackBackground = $derived(
  `linear-gradient(to right, var(--pd-input-toggle-on-bg) ${fillPercent}%, var(--pd-input-slider-track-bg) ${fillPercent}%)`,
);

async function onInput(event: Event): Promise<void> {
  const target = event.currentTarget as HTMLInputElement;
  const _value = uncertainStringToNumber(target.value);
  displayValue = _value;
  if (record.id && _value !== value) await onChange(record.id, _value);
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
  oninput={onInput}
  disabled={!!record.readonly || !!record.locked}
  style:background={trackBackground}
  class="w-full h-1 rounded-lg appearance-none accent-(--pd-input-toggle-on-bg) cursor-pointer range-xs mt-2" />
