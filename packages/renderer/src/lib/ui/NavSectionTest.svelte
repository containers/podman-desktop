<script lang="ts">
import type { TinroRouteMeta } from 'tinro';

import NavItem from './NavItem.svelte';
import NavSection from './NavSection.svelte';

let expanded: boolean;

let meta: TinroRouteMeta = { url: '/test' } as TinroRouteMeta;
</script>

Is it expanded: <div data-testid="expand">{expanded}</div>

<NavSection tooltip="Test Section" bind:expanded={expanded}>
  <div data-testid="icon" slot="icon">The icon</div>
  <NavItem href="/item1" tooltip="Item1" bind:meta={meta}>Item1</NavItem>
  <NavItem href="/item2" tooltip="Item2" bind:meta={meta}>Item2</NavItem>
  <NavItem href="/item3" tooltip="Item3" bind:meta={meta}>Item3</NavItem>
</NavSection>
