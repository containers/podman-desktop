<script lang="ts">
import NavSection from './NavSection.svelte';

let expanded: boolean;
</script>

Is it expanded: <div data-testid="expand">{expanded}</div>

<NavSection tooltip="Test Section" bind:expanded="{expanded}">
  <div data-testid="icon" slot="icon">The icon</div>
  <div data-testid="content">Content</div>
</NavSection>
