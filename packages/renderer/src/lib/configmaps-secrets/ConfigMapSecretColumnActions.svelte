<script lang="ts">
import ConfigmapSecretActions from './ConfigMapSecretActions.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

export let object: ConfigMapSecretUI;
</script>

<ConfigmapSecretActions configMapSecret="{object}" on:update />
