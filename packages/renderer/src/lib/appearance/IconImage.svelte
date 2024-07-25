<script lang="ts">
import { onMount } from 'svelte';

import { AppearanceUtil } from './appearance-util';

export let image: string | { light: string; dark: string } | undefined = undefined;
export let alt: string | undefined = undefined;

let imgSrc: string | undefined = undefined;

onMount(async () => {
  const appearanceUtil = new AppearanceUtil();
  imgSrc = await appearanceUtil.getImage(image);
});
</script>

{#if imgSrc}
  <img src={imgSrc} alt={alt} class={$$props.class} />
{:else}
  <slot />
{/if}
