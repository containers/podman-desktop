<script lang="ts">
import type { SecretInfo } from '@desktop-framework/api';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

interface Props {
  secret: SecretInfo;
}

let { secret }: Props = $props();
const inspectDetails = $derived(JSON.stringify(secret, undefined, 2));
</script>

<MonacoEditor content={inspectDetails} language="json" />
