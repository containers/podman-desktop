<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { setContext } from 'svelte';
import { writable } from 'svelte/store';
import type { TinroRouteMeta } from 'tinro';

import NavItem from './NavItem.svelte';
/* eslint-disable import/no-duplicates */

let meta: TinroRouteMeta = { url: '/test' } as TinroRouteMeta;

// define context so that item thinks we're in a section
setContext('nav-items', writable(0));
</script>

<NavItem tooltip="Dashboard" href="/test" bind:meta={meta}></NavItem>
