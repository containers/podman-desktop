<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';

export let record: IConfigurationPropertyRecordedSchema;
export let checked = false;
export let onChange = (_id: string, _value: boolean) => {};

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.checked !== checked) onChange(record.id, target.checked);
}
</script>

<label class="relative inline-flex items-center cursor-pointer">
  <span class="text-xs {checked ? 'text-white' : 'text-gray-700'} mr-3">{checked ? 'Enabled' : 'Disabled'}</span>
  <input
    on:input="{onInput}"
    class="sr-only peer"
    bind:checked="{checked}"
    name="{record.id}"
    type="checkbox"
    readonly="{!!record.readonly}"
    id="input-standard-{record.id}"
    aria-label="{record.description || record.markdownDescription}" />
  <div
    class="w-8 h-[20px] bg-gray-900 rounded-full peer peer-checked:after:translate-x-full after:bg-charcoal-600 after:content-[''] after:absolute after:top-[4px] after:left-[61px] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600">
  </div>
</label>
