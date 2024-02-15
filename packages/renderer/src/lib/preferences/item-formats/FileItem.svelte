<script lang="ts">
import type { OpenDialogOptions } from '@podman-desktop/api';

import FileInput from '/@/lib/ui/FileInput.svelte';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';

export let record: IConfigurationPropertyRecordedSchema;
export let value: string;

let invalidEntry = false;
let dialogOptions: OpenDialogOptions = {
  title: `Select ${record.description}`,
  selectors: record.format === 'folder' ? ['openDirectory'] : ['openFile'],
};
</script>

<div class="w-full flex">
  <FileInput
    id="input-standard-{record.id}"
    name="{record.id}"
    readonly
    placeholder="{record.placeholder}"
    options="{dialogOptions}"
    value="{value || ''}"
    aria-invalid="{invalidEntry}"
    aria-label="{record.description}" />
</div>
