<script lang="ts">
import type { ImageChecks } from '@podman-desktop/api';
import type { ImageCheckerInfo } from '../../../../main/src/plugin/api/image-checker-info';
import type { ImageInfoUI } from './ImageInfoUI';

export let image: ImageInfoUI;

let providers: ImageCheckerInfo[];
let result: ImageChecks;

// TODO: move this to a state
window.getImageCheckerProviders().then(_providers => {
  providers = _providers;
  window
    .imageCheck(_providers[0].id, image.name)
    .then(_result => (result = _result))
    .catch((e: unknown) => console.log('check error', e));
});
</script>

<div>Checking {image.name}...</div>
<pre>{JSON.stringify(providers)}</pre>
<pre>{JSON.stringify(result)}</pre>
